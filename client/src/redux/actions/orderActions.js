import api from '../../utils/api';
import { setAlert } from './alertActions';
import {
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_SUCCESS,
  ORDER_CREATE_FAILURE,
  // ORDER_CREATE_RESET,
  ORDER_DETAILS_REQUEST,
  ORDER_DETAILS_SUCCESS,
  ORDER_DETAILS_FAILURE,
  ORDER_PAY_REQUEST,
  ORDER_PAY_SUCCESS,
  ORDER_PAY_FAILURE,
  // ORDER_PAY_RESET,
  ORDER_LIST_MY_REQUEST,
  ORDER_LIST_MY_SUCCESS,
  ORDER_LIST_MY_FAILURE,
  // ORDER_LIST_MY_RESET,
  ORDER_LIST_REQUEST,
  ORDER_LIST_SUCCESS,
  ORDER_LIST_FAILURE,
  ORDER_DELIVER_REQUEST,
  ORDER_DELIVER_SUCCESS,
  ORDER_DELIVER_FAILURE,
  // ORDER_DELIVER_RESET
} from '../constants/orderConstants';
import { CART_CLEAR_ITEMS } from '../constants/cartConstants';

export const createOrder = (orderFormData) => async dispatch => {
  try {
    console.log("ACTION: creating order");
    console.log("orderformdata");
    console.log(orderFormData);
    console.log("------------------");
    // console.log("cartItems");
    // console.log(cartItems);
    console.log("------------------");
    // let formData = {...orderForm, ...cartItems};
    // let formData = [...orderForm, ...cartItems];
    // console.log("formData");
    // console.log(formData);
    // console.log("------------------");
    dispatch({type: ORDER_CREATE_REQUEST});
    const res = await api.post('/orders', orderFormData);
    // const res = await api.post('/orders', formData);
    let result = res.data.data;
    console.log(result);

    dispatch({
      type: ORDER_CREATE_SUCCESS,
      payload: result
    })
    dispatch ({
      type: CART_CLEAR_ITEMS,
      // payload: result
    })
    localStorage.removeItem('__cart');
  } catch (err) {
    dispatch(setAlert('Failed to create order.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: ORDER_CREATE_FAILURE});
  }
};

export const getAllUserOrders = () => async dispatch => {
  try {
    dispatch({type: ORDER_LIST_MY_REQUEST});
    const res = await api.get('/orders/my-orders');

    dispatch({
      type: ORDER_LIST_MY_SUCCESS,
      payload: res.data.data
    })
    
    // localStorage.removeItem('cartItems');
  } catch (err) {
    dispatch(setAlert('Failed to list orders.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: ORDER_LIST_MY_FAILURE});
  }
};

// get all users' orders - ADMIN
export const getAllOrdersAdmin = () => async dispatch => {
  try {
    dispatch({type: ORDER_LIST_REQUEST});
    const res = await api.get('/orders');

    dispatch({
      type: ORDER_LIST_SUCCESS,
      payload: res.data.data
    })
    
    // localStorage.removeItem('cartItems');
  } catch (err) {
    dispatch(setAlert('Failed to list orders.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: ORDER_LIST_FAILURE});
  }
};

// get order details
export const getOrderDetails = (order_id) => async dispatch => {
  try {
    dispatch({type: ORDER_DETAILS_REQUEST});
    const res = await api.get(`/orders/${order_id}`);

    dispatch({
      type: ORDER_DETAILS_SUCCESS,
      payload: res.data.data
    })

  } catch (err) {
    dispatch(setAlert('Failed to list order.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: ORDER_DETAILS_FAILURE});
  }
};

// pay for order
export const payOrder = (order_id, paymentResult) => async dispatch => {
  try {
    dispatch({type: ORDER_PAY_REQUEST});
    const res = await api.get(`/orders/${order_id}/pay`, paymentResult);

    dispatch({
      type: ORDER_PAY_SUCCESS,
      payload: res.data.data
    })

  } catch (err) {
    dispatch(setAlert('Failed to pay order.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: ORDER_PAY_FAILURE});
  }
};

// order delivery status
export const deliverOrder = (order_id) => async dispatch => {
  try {
    dispatch({type: ORDER_DELIVER_REQUEST});
    const res = await api.get(`/orders/${order_id}/deliver`);

    dispatch({
      type: ORDER_DELIVER_SUCCESS,
      payload: res.data.data
    })

  } catch (err) {
    dispatch(setAlert('Failed to change delivery status of order.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: ORDER_DELIVER_FAILURE});
  }
};