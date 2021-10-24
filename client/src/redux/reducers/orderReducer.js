import {
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_SUCCESS,
  ORDER_CREATE_FAILURE,
  ORDER_CREATE_RESET,
  ORDER_DETAILS_REQUEST,
  ORDER_DETAILS_SUCCESS,
  ORDER_DETAILS_FAILURE,
  ORDER_PAY_REQUEST,
  ORDER_PAY_SUCCESS,
  ORDER_PAY_FAILURE,
  ORDER_PAY_RESET,
  ORDER_LIST_MY_REQUEST,
  ORDER_LIST_MY_SUCCESS,
  ORDER_LIST_MY_FAILURE,
  ORDER_LIST_MY_RESET,
  ORDER_LIST_REQUEST,
  ORDER_LIST_SUCCESS,
  ORDER_LIST_FAILURE,
  ORDER_DELIVER_REQUEST,
  ORDER_DELIVER_SUCCESS,
  ORDER_DELIVER_FAILURE,
  ORDER_DELIVER_RESET
} from '../constants/orderConstants';

const initialState = {
  order: null,
  orders: [],
  loading: true,
  error: {}
};
const orderReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case ORDER_CREATE_REQUEST:
    case ORDER_PAY_REQUEST:
    case ORDER_DELIVER_REQUEST:
    case ORDER_LIST_MY_REQUEST:
    case ORDER_LIST_REQUEST:
      return { loading: true }
    case ORDER_DETAILS_REQUEST:
      return { ...state, loading: true }
    case ORDER_CREATE_SUCCESS:
      return {
        loading: false,
        success: true,
        order: payload
      }
    case ORDER_DETAILS_SUCCESS:
      return { loading: false, order: payload }
    case ORDER_LIST_SUCCESS:
    case ORDER_LIST_MY_SUCCESS:
      return { loading: false, orders: payload }
    case ORDER_PAY_SUCCESS:
    case ORDER_DELIVER_SUCCESS:
      return { loading: false, success: true }
    case ORDER_CREATE_FAILURE:
    case ORDER_DETAILS_FAILURE:
    case ORDER_PAY_FAILURE:
    case ORDER_LIST_MY_FAILURE:
    case ORDER_LIST_FAILURE:
    case ORDER_DELIVER_FAILURE:
      return { loading: false, error: payload }
    case ORDER_CREATE_RESET:
    case ORDER_PAY_RESET:
    case ORDER_DELIVER_RESET:
      return {}
    case ORDER_LIST_MY_RESET:
      return { orders: [] }
    default:
      return state;
  };
};
export default orderReducer;