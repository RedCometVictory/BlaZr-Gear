// reducers are functions that take in any piece of state and apply actions to them.
import { SET_ALERT, REMOVE_ALERT } from '../constants/alertConstants';
// alert state is an [] of obj.

// const initialState = [{
  // id: 1, msg: 'Please Login.', alertType: 'success'
// }]
const initialState = [];
// action contains the type (mandatory) and the payload, which is the data passed into the state. Payload may not be included (not mandatory) in calling the action type. Naming convention is to use contants or variables for the ation types. The action argument contains both the type and the payload of the action as it is dispatched to the reducer.

// export default (state = initialState, action) => {
const alertReducer = (state = initialState, action) => {
  const { type, payload } = action;

  // statement used to evaluate the action type:
  switch(type) {
    case SET_ALERT:
      // pending action type, decide what is returned to state (which is immutable), thus include any state that may already exist using the spread operator. Any existing alerts that may exist are copied and a new alert is added into the state via action payload.
      return [...state, payload];
    case REMOVE_ALERT:
      // remove specific alert from state []. compare alert id to payload id (id could be anything, determined by actions being dispatched). Return all alerts exxcept the once matcching the payload id.
      return state.filter(alert => alert.id !== payload);
    default:
      return state;
  }
};
export default alertReducer;