# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import bleach
import json
import time
import uuid

from datetime import datetime, timezone
from django.conf import settings

from dynamic_preferences.registries import global_preferences_registry

# from oc2.codec import Codec, jadn_check

from ..models import SentHistory, ResponseHistory

from orchestrator.models import Protocol, Serialization
from actuator.models import Actuator, ActuatorProfile
from device.models import Device

from utils import encode_msg, get_or_none, safe_cast

global_preferences = global_preferences_registry.manager()


def action_send(usr=None, cmd={}, actuator=None, channel={}, *args, **kwargs):
    err = None
    if usr is None:
        err = dict(
            detail='user invalid',
            response='User Invalid: command must be send by a valid user'
        )
    elif cmd is {}:
        err = dict(
            detail='command invalid',
            response='Command Invalid: command cannot be empty'
        )
    else:  # Get Actuator/Profile - from command or meta ??
        if actuator is None:
            # TODO: actuator broadcast??
            err = dict(
                detail='actuator invalid',
                response='Actuator Invalid: actuator cannot be none'
            )
        act_type = actuator.split('/')
        if len(act_type) != 2:
            err = dict(
                detail='actuator invalid',
                response='Actuator Invalid: application error'
            )
        else:
            _type, _act_prof = act_type
            _type = str(_type)
            _act_prof = bleach.clean(str(_act_prof).replace('_', ' '))

            if _type == 'actuator':
                # Single Actuator
                actuators = get_or_none(Actuator, name__iexact=_act_prof)
                if actuators is None:
                    err = dict(
                        detail='actuator invalid',
                        response='Actuator Invalid: actuator must be specified with a command'
                    ), 404
                else:
                    print('check channel')
                    print(actuators.device)
                    dev = get_or_none(Device, device_id=actuators.device.device_id)
                    print(dev)
                    if 'serialization' in channel:
                        ser = get_or_none(Serialization, name=bleach.clean(str(channel['serialization'])))
                        print(ser)
                    else:
                        print('no serial')

                    print(channel)

            elif _type == 'profile':
                # Profile Actuators
                actuators = get_or_none(ActuatorProfile, name__iexact=_act_prof)
                if actuators is None:
                    err = dict(
                        detail=f'profile cannot be found',
                        response=f'Profile Invalid: profile must be a valid registered profile with the orchestrator'
                    ), 400
                else:
                    actuators = list(Actuator.objects.filter(profile__iexact=_act_prof.replace(' ', '_')))
            else:
                err = dict(
                    detail='actuator invalid',
                    response='Actuator Invalid: application error'
                )

    if err is not None:
        return err, 400

    '''
    # Validate command
    try:
        schema = jadn_check(actuators[0].schema)
        codec = Codec(schema, True, True)
    except (KeyError, ValueError) as e:
        print(e)
        err = Error(
            type='schema',
            msg=f'Schema Invalid: {e}'
        )
        return None, err
        
    try:
        msg = codec.decode('OpenC2-Command', cmd)
    except (ValueError, TypeError) as e:
        print(e)
        err = Error(
            type='command',
            msg=f'Command Invalid: {e}'
        )
        return None, err
    '''

    # Store command in db
    cmd_id = cmd.get('id', uuid.uuid4())
    if get_or_none(SentHistory, command_id=cmd_id) is None:
        com = SentHistory(command_id=cmd_id, user=usr, command=cmd)
        try:
            com.save()
        except ValueError as e:
            return dict(
                detail=f'command error',
                response=str(e)
            ), 400
    else:
        return dict(
            command_id=[
                u'This ID is used by another command.'
            ]
        ), 400

    # Process Actuators that should receive command
    processed_acts = []
    for proto in Protocol.objects.all():
        proto_acts = []
        for act in actuators:
            if act.name not in processed_acts and act.device.transport.filter(protocol__name=proto.name).exists():
                processed_acts.append(act.name)
                proto_acts.append(act)

        if len(proto_acts) >= 1:
            orc_ip = global_preferences.get('orchestrator__host', '127.0.0.1')
            header = dict(
                source=dict(
                    orchestratorID=global_preferences.get('orchestrator__id', ''),
                    transport=dict(
                        type=proto.name,
                        # TODO: Change the socket to dynamic
                        socket=f'{orc_ip}:5000'
                    ),
                    correlationID=com.command_id,
                    date=f'{com.received_on:%a, %d %b %Y %X %Z}'
                ),
                destination=[]
            )

            for act in proto_acts:
                com.actuators.add(act)
                trans = act.device.transport.filter(protocol__name=proto.name).first()

                dev = list(filter(lambda x: x['deviceID'] == str(act.device.device_id), header['destination']))
                profile = str(act.profile).lower()
                if len(dev) == 1:
                    idx = header['destination'].index(dev[0])
                    header['destination'][idx]['profile'].append(profile)

                else:
                    header['destination'].append(dict(
                        deviceID=str(act.device.device_id),
                        socket=f'{trans.host}:{trans.port}',
                        profile=[profile],
                        encoding=trans.serialization.first().name.lower()
                    ))

            # Send command to transport
            print('Send command to buffer')
            settings.MESSAGE_QUEUE.send(
                msg=json.dumps(cmd),
                headers=header,
                routing_key=proto.name.lower().replace(' ', '_')
            )


    wait = safe_cast(global_preferences.get('command__wait', 1), int, 1)

    rsp = None
    for _ in range(wait):
        rsp = get_or_none(ResponseHistory, command=com)
        if rsp is None:
            time.sleep(0.9)
        else:
            break

    if hasattr(rsp, '__iter__'):
        rsp = [r.response for r in rsp]
    elif hasattr(rsp, 'response'):
        rsp = [rsp.response]
    else:
        rsp = None

    return dict(
        detail=f'command {"received" if rsp is None else "processed"}',
        response='pending' if rsp is None else rsp,
        command_id=com.command_id,
        command=com.command,
        wait=wait
    ), 200