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
  ORDER_REFUND_REQUEST,
  ORDER_REFUND_SUCCESS,
  ORDER_REFUND_FAILURE,
  ORDER_DELETE_REQUEST,
  ORDER_DELETE_SUCCESS,
  ORDER_DELETE_FAILURE
} from '../constants/orderConstants';
import { CART_CLEAR_ITEMS } from '../constants/cartConstants';

export const createOrder = (orderFormData) => async dispatch => {
  try {
    dispatch({type: ORDER_CREATE_REQUEST});
    const res = await api.post('/orders', orderFormData);
    let result = res.data.data;

    dispatch({
      type: ORDER_CREATE_SUCCESS,
      payload: result
    })

    dispatch ({
      type: CART_CLEAR_ITEMS
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

export const getAllUserOrders = (pageNumber, itemsPerPage) => async dispatch => {
  try {
    dispatch({type: ORDER_LIST_MY_REQUEST});
    const res = await api.get(`/orders/my-orders?pageNumber=${pageNumber}&offsetItems=${itemsPerPage}`);

    dispatch({
      type: ORDER_LIST_MY_SUCCESS,
      payload: res.data.data
    })
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
export const getAllAdminOrders = (pageNumber, itemsPerPage) => async dispatch => {
  try {
    dispatch({type: ORDER_LIST_REQUEST});
    const res = await api.get(`/orders?pageNumber=${pageNumber}&offsetItems=${itemsPerPage}`);

    dispatch({
      type: ORDER_LIST_SUCCESS,
      payload: res.data.data
    })

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

// ADMIN - get order details
export const getOrderDetailAdmin = (order_id) => async dispatch => {
  try {
    dispatch({type: ORDER_DETAILS_REQUEST});
    const res = await api.get(`/orders/admin/${order_id}`);

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
// TODO consider delete as order is paid via stripw or paypal before order is even created
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

// order shipping status update
export const updateOrderStatusToShipped = (order_id) => async dispatch => {
  try {
    dispatch({type: ORDER_DELIVER_REQUEST});
    const res = await api.get(`/orders/${order_id}/status-to-shipped`);

    dispatch({
      type: ORDER_DELIVER_SUCCESS,
      payload: res.data.data
    })
    
    dispatch(setAlert('Order has been shipped.', 'success'));
  } catch (err) {
    dispatch(setAlert('Failed to change shipping status of order.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: ORDER_DELIVER_FAILURE});
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

    dispatch(setAlert('Order delivered.', 'success'));
  } catch (err) {
    dispatch(setAlert('Failed to change delivery status of order.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: ORDER_DELIVER_FAILURE});
  }
};

// order REFUND status
export const refundOrder = (order_id) => async dispatch => {
  try {
    dispatch({type: ORDER_REFUND_REQUEST});
    const res = await api.get(`/orders/${order_id}/refund`);

    dispatch({
      type: ORDER_REFUND_SUCCESS,
      payload: res.data.data
    })

    dispatch(setAlert('Order refunded.', 'success'));
  } catch (err) {
    dispatch(setAlert('Failed to change order status to refund.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: ORDER_REFUND_FAILURE});
  }
};

export const refundPayPalOrder = (orderId, userId, paypalPaymentId, paypalCaptureId, amount) => async dispatch => {
  try {
    const chargeData = { orderId, userId, paypalPaymentId, paypalCaptureId, amount };

    dispatch({type: ORDER_REFUND_REQUEST});
    const res = await api.post(`/payment/refund-paypal/order/${orderId}`, chargeData);

    dispatch({
      type: ORDER_REFUND_SUCCESS,
      payload: res.data.data
    })

    dispatch(setAlert('Order refunded.', 'success'));
  } catch (err) {
    dispatch(setAlert('Failed to change order status to refund.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: ORDER_REFUND_FAILURE});
  }
};

export const deleteOrder = (order_id, history) => async dispatch => {
  try {
    dispatch({type: ORDER_DELETE_REQUEST});
    await api.delete(`/orders/${order_id}/remove`);

    dispatch({
      type: ORDER_DELETE_SUCCESS
    })

    dispatch(setAlert('Order deleted.', 'success'));
    history.push('/admin/order-list');
  } catch (err) {
    dispatch(setAlert('Failed to delete order.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: ORDER_DELETE_FAILURE});
  }
};