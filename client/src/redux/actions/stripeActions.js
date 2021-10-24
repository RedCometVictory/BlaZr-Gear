import api from '../../utils/api';
import { setAlert } from './alertActions';
import {
  CHARGE_COMPLETE_REQUEST,
  CHARGE_COMPLETE_SUCCESS,
  CHARGE_COMPLETE_FAILURE,
  ADD_CARD_TO_USER_REQUEST,
  ADD_CARD_TO_USER_SUCCESS,
  ADD_CARD_TO_USER_FAILURE,
  STRIPE_CHARGE_RETRIEVED_REQUEST,
  STRIPE_CHARGE_RETRIEVED_SUCCESS,
  STRIPE_CHARGE_RETRIEVED_FAILURE
} from '../constants/stripeConstants';

export const addCardToUser = (stripeId) => async dispatch => {
  try {
    console.log("adding card(s) to user account")
    dispatch({type: ADD_CARD_TO_USER_REQUEST});
    const res = await api.post('/payment/add-user-card', { stripeId });
    // let result = res.data.data.cards.data;
    let result = res.data.data.cards;
    console.log("results")
    console.log(result);

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
    console.log("charging card")
    dispatch({type: CHARGE_COMPLETE_REQUEST});
    const chargeData = { total, description, cart };
    const res = await api.post('/payment/single-checkout-charge', chargeData);
    // check user profile exists/ securoty?
    let result = res.data.data.clientSecret;
    console.log("results")
    console.log(result);

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
  try {
    console.log("saving card and charging card")
    dispatch({type: CHARGE_COMPLETE_REQUEST});
    const chargeData = {total, description, cart};

    const res = await api.post('/payment/save-card-charge', chargeData);
    let result = res.data.data.clientSecret;
    console.log("results")
    console.log(result);

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

export const singleChargeCard = (card, total, description, cart) => async dispatch => {
  try {
    console.log("saving card and charging card")
    dispatch({type: CHARGE_COMPLETE_REQUEST});
    const chargeData = {card, total, description, cart};

    const res = await api.post('/payment/checkout-charge-card', chargeData);
    let result = res.data.data.clientSecret;
    console.log("results")
    console.log(result);

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
    console.log("deleting card")
    dispatch({type: CHARGE_COMPLETE_REQUEST});
    const res = await api.post('/payment/delete-card', cardId);
    let result = res.data.data;
    console.log("results")
    console.log(result);

    dispatch({
      type: CHARGE_COMPLETE_SUCCESS,
      payload: result
    });
  } catch (err) {
    dispatch(setAlert('Failed to remove card / payment method.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: CHARGE_COMPLETE_FAILURE});
  }
};

// export const getAllStripeCharges = (cardId, stripeCustId) => async dispatch => {
//   try {
//     console.log("refunding card")
//     dispatch({type: CHARGE_COMPLETE_REQUEST});
//     const chargeData = { cardId, stripeCustId };
//     const res = await api.post('/payment/list-stripe-users', chargeData);
//     let result = res.data.data;
//     console.log("results")
//     console.log(result);
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
    console.log("refunding card")
    dispatch({type: CHARGE_COMPLETE_REQUEST});
    const res = await api.post('/payment/get-stripe-charge', { chargeId });
    let result = res.data.data;
    console.log("results")
    console.log(result);
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
    console.log("refunding card")
    dispatch({type: CHARGE_COMPLETE_REQUEST});
    // charge id should be paymentmethodID?
    const chargeData = { orderId, userId, stripePaymentId, amount };
    const res = await api.post(`/payment/refund-charge/order/${orderId}`, chargeData);
    let result = res.data.data;
    console.log("results")
    console.log(result);
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