import { SET_ALERT, REMOVE_ALERT } from '../constants/alertConstants';
import { v4 as uuidv4 } from 'uuid';

// action file utilizes dispatch to dictate to the reducer the input/output of the main redux state. dispatch connects the action to the reducer, due to being a method of reduc, the reducer thus interacts with the main redux state. the component imports the action file and its method, passing the data from the comp into the action file that dispatched to the reducer.
// dispatch allows for more than one actions type with this func due to thunk
// alert action called via Register.js comp. dispatch reducer based on action type, changes state accordingly
export const setAlert = (msg, alertType, timeout = 5000) => dispatch => {
  // uuid returns string, dispatch alert, pass payload to alert redducer
  const id = uuidv4();
  // dispatch action type to render pending action data passed via comp / user input
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id }
  });
  // remove alert specified by id after 5 second delay
  setTimeout(() => dispatch({
    type: REMOVE_ALERT, payload: id
  }), timeout);
};