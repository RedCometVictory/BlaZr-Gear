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
  ORDER_DELIVER_RESET,
  ORDER_REFUND_REQUEST,
  ORDER_REFUND_SUCCESS,
  ORDER_REFUND_FAILURE,
  ORDER_DELETE_REQUEST,
  ORDER_DELETE_SUCCESS,
  ORDER_DELETE_FAILURE
} from '../constants/orderConstants';

const initialState = {
  order: {},
  orders: [],
  page: null,
  pages: null,
  loading: true,
  errors: []
};
const orderReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case ORDER_CREATE_REQUEST:
    case ORDER_PAY_REQUEST:
    case ORDER_DELIVER_REQUEST:
    case ORDER_REFUND_REQUEST:
    case ORDER_LIST_MY_REQUEST:
    case ORDER_LIST_REQUEST:
    case ORDER_DELETE_REQUEST:
      return {
        ...state,
        loading: true
      }
    case ORDER_DETAILS_REQUEST:
      return { ...state, loading: true }
    case ORDER_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        order: payload
      }
    case ORDER_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        order: payload.userOrder
      }
    case ORDER_DELETE_SUCCESS:
      return {
        ...state,
        loading: false
      }
    case ORDER_LIST_SUCCESS:
    case ORDER_LIST_MY_SUCCESS:
      return {
        ...state,
        loading: false,
        orders: payload.orderItems,
        pages: payload.pages,
        page: payload.page
      }
    case ORDER_PAY_SUCCESS:
    case ORDER_DELIVER_SUCCESS:
    case ORDER_REFUND_SUCCESS:
      return {
        ...state,
        order: {
          orderInfo: payload.orderInfo,
          orderItems: [...state.order.orderItems],
          userInfo: {...state.order.userInfo},
        },
        loading: false,
        success: true
      }
    case ORDER_CREATE_FAILURE:
    case ORDER_DETAILS_FAILURE:
    case ORDER_PAY_FAILURE:
    case ORDER_LIST_MY_FAILURE:
    case ORDER_LIST_FAILURE:
    case ORDER_DELIVER_FAILURE:
    case ORDER_REFUND_FAILURE:
    case ORDER_DELETE_FAILURE:
      return { ...state, loading: false, errors: payload }
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