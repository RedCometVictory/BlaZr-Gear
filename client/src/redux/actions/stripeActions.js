import api from '../../utils/api';
import { setAlert } from './alertActions';
import { refundOrder } from './orderActions';
import {
  CHARGE_COMPLETE_REQUEST,
  CHARGE_COMPLETE_SUCCESS,
  CHARGE_COMPLETE_FAILURE,
  SET_CARD_REQUEST,
  SET_CARD_SUCCESS,
  SET_CARD_FAILURE,
  ADD_CARD_TO_USER_REQUEST,
  ADD_CARD_TO_USER_SUCCESS,
  ADD_CARD_TO_USER_FAILURE,
  REMOVE_CARD_OF_USER_REQUEST,
  REMOVE_CARD_OF_USER_SUCCESS,
  REMOVE_CARD_OF_USER_FAILURE,
  STRIPE_CHARGE_RETRIEVED_REQUEST,
  STRIPE_CHARGE_RETRIEVED_SUCCESS,
  STRIPE_CHARGE_RETRIEVED_FAILURE
} from '../constants/stripeConstants';

export const setCard = (card) => async dispatch => {
  try {
    dispatch({type: SET_CARD_REQUEST});

    dispatch({
      type: SET_CARD_SUCCESS,
      payload: card
    });
    dispatch(setAlert('Card set.', 'success'));
  } catch (err) {
    dispatch(setAlert('Failed to set card.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: SET_CARD_FAILURE});
  }
};

export const addCardToUser = (stripeId) => async dispatch => {
  try {
    dispatch({type: ADD_CARD_TO_USER_REQUEST});
    const res = await api.post('/payment/add-user-card', { stripeId });
    let result = res.data.data;

    dispatch({
      type: ADD_CARD_TO_USER_SUCCESS,
      payload: result
    });
    dispatch(setAlert('Cards added.', 'success'));
  } catch (err) {
    dispatch(setAlert('Failed to list card(s) of user account.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: ADD_CARD_TO_USER_FAILURE});
  }
};

export const singleCharge = (total, description, cart) => async dispatch => {
  try {
    dispatch({type: CHARGE_COMPLETE_REQUEST});
    const chargeData = { total, description, cart };
    const res = await api.post('/payment/single-checkout-charge', chargeData);
    let result = res.data.data.clientSecret;

    dispatch({
      type: CHARGE_COMPLETE_SUCCESS,
      payload: result
    });
    dispatch(setAlert('Charge successful.', 'success'))
  } catch (err) {
    dispatch(setAlert('Failed to charge card.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: CHARGE_COMPLETE_FAILURE});
  }
};

export const saveCardAndCharge = (total, description, cart) => async dispatch => {
// export const saveCardAndCharge = async (total, description, cart) => {
  try {
    dispatch({type: CHARGE_COMPLETE_REQUEST});
    const chargeData = {total, description, cart};

    const res = await api.post('/payment/save-card-charge', chargeData);
    let result = res.data.data.clientSecret;

    dispatch({
      type: CHARGE_COMPLETE_SUCCESS,
      payload: result
    });
    return result;
  } catch (err) {
    dispatch(setAlert('Failed to charge card.', 'danger'));
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: CHARGE_COMPLETE_FAILURE});
  }
};

export const singleChargeCard = (card, total, description, cart) => async dispatch => {
// export const singleChargeCard = async (card, total, description, cart) => {
  try {
    dispatch({type: CHARGE_COMPLETE_REQUEST});
    const chargeData = {card, total, description, cart};

    const res = await api.post('/payment/checkout-charge-card', chargeData);
    let result = res.data.data.clientSecret;

    dispatch({
      type: CHARGE_COMPLETE_SUCCESS,
      payload: result
    });
    dispatch(setAlert('Charge successful.', 'success'));
  } catch (err) {
    dispatch(setAlert('Failed to charge card.', 'danger'));
    const errors = err.response.data.errors;
 
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: CHARGE_COMPLETE_FAILURE});
  }
};

export const deleteCard = (cardId) => async dispatch => {
  try {
    let pm = {cardId};
    dispatch({type: REMOVE_CARD_OF_USER_REQUEST});
    const res = await api.post('/payment/delete-card', pm);

    let result = res.data.data;

    dispatch({
      type: REMOVE_CARD_OF_USER_SUCCESS,
      payload: result
    });
  } catch (err) {
    dispatch(setAlert('Failed to remove card / payment method.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: REMOVE_CARD_OF_USER_FAILURE});
  }
};

// export const getAllStripeCharges = (cardId, stripeCustId) => async dispatch => {
//   try {
//     dispatch({type: CHARGE_COMPLETE_REQUEST});
//     const chargeData = { cardId, stripeCustId };
//     const res = await api.post('/payment/list-stripe-users', chargeData);
//     let result = res.data.data;
//     dispatch({
//       type: CHARGE_COMPLETE_SUCCESS,
//       payload: result
//     });
//     dispatch(setAlert('Refund successful.', 'success'))
//   } catch (err) {
//     dispatch(setAlert('Failed to refund card. Contact customer support recommended', 'danger'));
//     const errors = err.response.data.errors;
//     if (errors) {
//       errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
//     }
//     dispatch({type: CHARGE_COMPLETE_FAILURE})
//   }
// };

export const getStripeCharge = (chargeId) => async dispatch => {
  try {
    dispatch({type: CHARGE_COMPLETE_REQUEST});
    const res = await api.post('/payment/get-stripe-charge', { chargeId });
    let result = res.data.data;
    dispatch({
      type: CHARGE_COMPLETE_SUCCESS,
      payload: result
    });
    dispatch(setAlert('Refund successful.', 'success'))
  } catch (err) {
    dispatch(setAlert('Failed to refund card. Contact customer support recommended', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: CHARGE_COMPLETE_FAILURE})
  }
};

export const refundCharge = (orderId, userId, stripePaymentId, amount) => async dispatch => {
  try {
    dispatch({type: CHARGE_COMPLETE_REQUEST});

    const chargeData = { orderId, userId, stripePaymentId, amount };
    const res = await api.post(`/payment/refund-charge/order/${orderId}`, chargeData);
    let result = res.data.data;

    dispatch({
      type: CHARGE_COMPLETE_SUCCESS,
      // payload: result
    });
    dispatch(refundOrder(orderId));
    dispatch(setAlert('Refund successful.', 'success'))
  } catch (err) {
    dispatch(setAlert('Failed to refund card. Contact customer support recommended.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: CHARGE_COMPLETE_FAILURE})
  }
};