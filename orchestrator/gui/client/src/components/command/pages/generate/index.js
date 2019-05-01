import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'

import JSONPretty from 'react-json-pretty'

import { Button, ButtonGroup, Form, FormGroup, Label, Input, FormText, Tooltip } from 'reactstrap';

import {
    Field,
} from './lib'

import {
    delMultiKey,
    escaped2cbor,
    format,
    getMultiKey,
    generateUUID4,
    hexify,
    loadURL,
    minify,
    setMultiKey,
    validateUUID4,
    validURL
} from '../../../utils'

import JSONInput from '../../../utils/jadn-editor'
import locale from '../../../utils/jadn-editor/locale/en'

import * as UtilActions from '../../../../actions/util'
import * as GenerateActions from '../../../../actions/generate'
import * as CommandActions from '../../../../actions/command'

const str_fmt = require('string-format')


class GenerateCommands extends Component {
    constructor(props, context) {
        super(props, context)

		this.state = {
		    command_record: '',
		    channel: {
		        serialization: '',
		        protocol: ''
		    },
		    schema: {
				schema: {},
				selected: 'empty',
				type: '',
				decodeTypes: {
				    all: [],
				    exports: []
				}
			},
		    message: {}
		}

		this.optChange = this.optChange.bind(this)
		this.selectChange = this.selectChange.bind(this)
		this.sendCommand = this.sendCommand.bind(this)

		this.props.actuatorInfo()
		this.props.deviceInfo()
    }

    shouldComponentUpdate(nextProps, nextState) {
        let props_update = this.props != nextProps
        let state_update = this.state != nextState

        if (this.state.schema.schema != nextState.schema.schema) {
            this.props.setSchema(nextState.schema.schema)
            nextState.message = {}
        }

        return props_update || state_update
    }

    makeID() {
        this.setState({
            message: {
                ...this.state.message,
                id: generateUUID4()
            }
        })
    }

    sendCommand() {
        let actuator = str_fmt('{type}/{selected}', {
            type: this.state.schema.type,
            selected: this.state.schema.selected
        })

        Promise.resolve(this.props.sendCommand(this.state.message, actuator, this.state.channel)).then(() => {
            let errs = this.props.errors[CommandActions.SEND_COMMAND_FAILURE] || {}
            if (Object.keys(errs).length !== 0) {
                console.log(errs)
                if (errs.hasOwnProperty('non_field_errors')) {
                    Object.values(errs).forEach(err => {
                        toast(<p>Error: { err }</p>, {type: toast.TYPE.WARNING})
                    })
                } else {
                    Object.keys(errs).forEach(err => {
                       toast(<div><p>Error { err }:</p><p>{ errs[err] }</p></div>, {type: toast.TYPE.WARNING})
                    })
                }
            } else {
                console.log('show responses...')
            }
        })
    }

    optChange(k, v) {
        // console.log(k, v)
        this.setState((prevState) => {
            let msg = prevState.message || {}
            let keys = k.split('.')
            if (keys.length > 1 && msg[keys[0]] && !msg[keys[0]][keys[1]]) {
                delMultiKey(msg, keys[0])
            }

            if (['', ' ', null, undefined, [], {}].indexOf(v) == -1) {
                setMultiKey(msg, k, v)
            } else {
                delMultiKey(msg, k)
            }

            return {
                message: msg
            }
        })
    }

    selectChange(e) {
		let type = e.target.id.split('-')[0]
        let selected = e.target.value

        let idx = e.nativeEvent.target.selectedIndex
        let field = e.nativeEvent.target[idx].getAttribute('field')

        let schema_act = ''


        if (field == 'profile') {
            let act_profile = this.props.actuators.filter((act) => act.profile == selected)

            if (act_profile.length == 0) {
                toast(<p>Not a valid profile</p>, {type: toast.TYPE.WARNING})
                return
            } else {
                act_profile = act_profile[Math.floor(Math.random()*act_profile.length)]
            }
            schema_act = act_profile.actuator_id

        } else if (field == 'actuator') {
            let act_name = this.props.actuators.filter((act) => act.name == selected)

            if (act_name.length == 0 || act_name.length > 1) {
                toast(<p>Not a valid actuator</p>, {type: toast.TYPE.WARNING})
                return
            } else {
                act_name = act_name[0]
            }
            schema_act = act_name.actuator_id
        }

		this.setState((prevState) => {
            return {
                'command_record': '',
                message: {},
                schema: {
			        ...prevState.schema,
		            selected: selected,
		            type: field
			    }
            }
		}, () => {
		    console.log(schema_act, field)
		    Promise.resolve(this.props.actuatorSelect(schema_act, field)).then(() => {
		        if (Object.keys(this.props.selected.schema).length === 0) {
                    toast(<p>No schema defined</p>, {type: toast.TYPE.INFO})
		        }

		        this.setState((prevState) => {
                    return {
                        schema: {
                            ...prevState.schema,
                            schema: this.props.selected.schema,
                            profile: this.props.selected.profile
                        }
                    }
                })
		    })
		})
	}

    schema(maxHeight) {
        let profile_schemas = []
        let actuator_schemas = []

        this.props.actuators.forEach((act, i) => {
            let dev = this.props.devices.filter(d => d.device_id == act.device)
            dev = dev.length == 1 ? dev[0] : {}
            actuator_schemas.push(<option key={ i } value={ act.name } field='actuator' >{ dev ? dev.name + ' - ' : '' }{ act.name }</option>)
            if (profile_schemas.indexOf(act.profile) === -1) {
                profile_schemas.push(act.profile)
            }
        })

        profile_schemas = profile_schemas.map((p, i) => <option key={ i } value={ p } field='profile' >{ p }</option>)

        return (
            <div className='col-md-6'>
                <div id="schema-card" className="tab-pane fade active show">
				    <div className="card">
					    <div className="card-header">
						    <div className="row float-left col-sm-10 pl-0">
							    <div className="form-group col-md-6 pr-0 pl-1">
								    <select id="schema-list" name="schema-list" className="form-control" default="empty" onChange={ this.selectChange }>
									    <option value="empty">Schema</option>
                                            <optgroup label="Profiles">
						                        { profile_schemas }
                                            </optgroup>
                                            <optgroup label="Actuators">
                                                { actuator_schemas }
                                            </optgroup>
								    </select>
								</div>
							</div>
						</div>

                        <div className="form-control border card-body p-0" style={{ height: maxHeight+'px' }}>
                            <JSONInput
                                id='jadn_schema'
                                placeholder={ this.state.schema.schema }
                                onChange={ (val) => {
                                    if (val.jsObject) {
                                        this.setState({ schema: {...this.state.schema, schema: val.jsObject }})
                                    }
                                }}
                                theme='light_mitsuketa_tribute'
                                locale={ locale }
                                reset={ false }
                                height='100%'
                                width='100%'
                            />
                        </div>
					</div>
				</div>
            </div>
        )
    }

    cmdCreator(maxHeight) {
        let export_records = []
        let record_def = []

        if (this.props.selected.schema) {
            export_records = this.props.selected.schema.meta ? this.props.selected.schema.meta.exports : []
            export_records = export_records.map((rec, i) => <option key={ i } value={ rec }>{ rec }</option>)

            record_def = this.props.selected.schema.hasOwnProperty('types') ? this.props.selected.schema.types.filter(type => type[0] == this.state.command_record) : []
            record_def = (record_def.length == 1 ? record_def[0] : [])
        }

        return (
            <div className='col-md-6'>
                 <ul className='nav nav-tabs'>
			        <li className='nav-item'>
				        <a className='nav-link active show' data-toggle='tab' href='#tab-creator'>Creator</a>
  			        </li>

  			        <li id='msg-tab' className='nav-item' >
    			        <a className='nav-link' data-toggle='tab' href='#tab-message'>Message</a>
  			        </li>
		        </ul>

		        <div className='tab-content'>
		            <div className='tab-pane fade active show' id='tab-creator'>
                        <div className='card col-12 p-0 mx-auto'>
                            <div className='card-header'>
                                <FormGroup className='col-md-6 p-0 m-0 float-left'>
                                    <Input type='select' className='form-control' value={ this.state.command_record } onChange={ (e) => { this.setState({'command_record': e.target.value, message: {}}) }}>
                                        <option value=''>Command Type</option>
                                        <optgroup label="Exports">
						                    { export_records }
                                        </optgroup>
                                    </Input>
                                </FormGroup>

                                <Button color='primary' className='float-right' onClick={ () => this.makeID() }>Generate ID</Button>
                            </div>

                            <Form id='command-fields' className='card-body' onSubmit={ () => { return false; } } style={{ height: maxHeight-30+'px', overflowY: 'scroll' }}>
                                {
                                    (record_def.length > 1 && record_def[record_def.length - 2].length > 0) ?
                                    <FormText color="muted"><b>Comment: </b>{ record_def[record_def.length - 2] }</FormText> : ''
                                }
                                <div id="fieldDefs">
                                    {
                                        record_def[record_def.length - 1] == undefined ?
                                            <FormText color="muted">Command Fields will appear here after selecting a type { this.state.command_record }</FormText>
                                        : record_def[record_def.length - 1].map((def, i) => <Field key={ i } def={ def } optChange={ this.optChange } />)
                                    }
                                </div>
                            </Form>
                        </div>
                    </div>

                    <div className='tab-pane fade' id='tab-message'>
                        <div className='card col-12 p-0 mx-auto'>
                            <div className='card-header'>
                                <Button color='primary' className='float-right' onClick={ () => this.sendCommand() }>Send</Button>
                                <div className={ 'col-10 p-0 ' + (this.state.schema.type === 'actuator' ? '' : ' d-none') }>
                                    <FormGroup className='col-md-6 p-0 m-0 float-left'>
                                        <Input type='select' className='form-control' value={ this.state.channel.protocol } onChange={ (e) => { this.setState({ channel: { ...this.state.channel, protocol: e.target.value }}) }}>
                                            <option value=''>Protocol</option>
                                            {/* TODO: Add Actuator Protocols */}
                                        </Input>
                                    </FormGroup>
                                    <FormGroup className='col-md-6 p-0 m-0 float-left'>
                                        <Input type='select' className='form-control' value={ this.state.channel.serialization } onChange={ (e) => { this.setState({ channel: { ...this.state.channel, serialization: e.target.value }}) }}>
                                             <option value=''>Serialization</option>
                                             {/* TODO: Add Actuator serializations */}
                                        </Input>
                                    </FormGroup>
                                </div>
                            </div>

                            <div className='card-body p-1 position-relative' style={{ height: maxHeight-25+'px', overflowY: 'scroll' }}>
                                <JSONPretty
                                    id='message'
                                    className='scroll-xl'
                                    style={{ minHeight: 2.5+'em' }}
                                    json={ this.state.message }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        let maxHeight = window.innerHeight - (parseInt(document.body.style.paddingTop, 10) || 0) - 260

        return (
            <div className='row mt-3'>
                 { this.schema(maxHeight) }

                 <div className='col-12 m-2 d-md-none' />

                 { this.cmdCreator(maxHeight) }

                 <div id='cmd-status' className='modal'>
                    <div className='modal-dialog h-100 d-flex flex-column justify-content-center my-0' role='document'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>Command: <span></span></h5>
                                <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                    <span aria-hidden='true'>&times;</span>
                                </button>
                            </div>

                            <div className='modal-body'>
                                <p className='cmd-details'><b>Details:</b> <span></span></p>
                                <p className='mb-1'><b>Command:</b></p>
                                <pre className='border code command' />
                                <p className='mb-1'><b>Responses:</b></p>
                                <div className='p-1 border border-primary responses' />
                            </div>

                            <div className='modal-footer'>
                                <button type='button' className='btn btn-secondary' data-dismiss='modal'>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        actuators: state.Generate.actuators || [],
        devices: state.Generate.devices || [],
        // loadedSchemas: state.Util.loaded.schemas || {},
        selected: state.Generate.selected || {},

        message: state.Generate.message,
        errors: state.Command.errors
    }
}


function mapDispatchToProps(dispatch) {
    return {
        setSchema: (schema) => dispatch(GenerateActions.setSchema(schema)),
        actuatorInfo: () => dispatch(GenerateActions.actuatorInfo()),
        actuatorSelect: (act, t) => dispatch(GenerateActions.actuatorSelect(act, t)),
        deviceInfo: () => dispatch(GenerateActions.deviceInfo()),
        sendCommand: (cmd, act, chan) => dispatch(CommandActions.sendCommand(cmd, act, chan))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GenerateCommands)