import { SET_ALERT, REMOVE_ALERT } from '../constants/alertConstants';
import { v4 as uuidv4 } from 'uuid';

export const setAlert = (msg, alertType, timeout = 6000) => dispatch => {
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