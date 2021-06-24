import * as command from '../actions/command';
import { mergeByProperty } from '../components/utils';

export interface CommandState {
  commands: Array<command.Command>;
  sort: string;
  count: number;
  errors: Record<string, any>;
}

const initialState: CommandState = {
  commands: [],
  sort: '',
  count: 0,
  errors: {}
};

export default (state=initialState, action: command.CommandActions) => {
  let newCmds: Array<command.Command>;
  switch (action.type) {
    case command.GET_COMMANDS_SUCCESS:
      newCmds = action.payload.results;
      return {
        ...state,
        count: action.payload.count || 0,
        commands: action.meta.refresh ? newCmds : mergeByProperty(state.commands, newCmds, 'command_id'),
        sort: action.meta.sort,
        errors: {
          ...state.errors,
          [command.GET_COMMANDS_FAILURE]: {}
        }
      };

    case command.SEND_COMMAND_SUCCESS:
      setTimeout(() => {
        action.asyncDispatch(command.getCommand(action.payload.command_id));
      }, action.payload.wait * 1000 || 1000);

      return {
        ...state,
        errors: {
          ...state.errors,
          [command.SEND_COMMAND_FAILURE]: {}
        }
      };

    case command.GET_COMMAND_SUCCESS:
      return {
        ...state,
        commands:mergeByProperty(state.commands, [action.payload], 'command_id')
      };

    case command.GET_COMMANDS_FAILURE:
    case command.SEND_COMMAND_FAILURE:
    case command.GET_COMMAND_FAILURE:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.type]: action.payload.response || {'non_field_errors': action.payload.statusText}
        }
      };

    default:
      return state;
  }
};
