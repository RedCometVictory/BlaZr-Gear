import api from '../../utils/api';
import { setAlert } from './alertActions';
import { addCardToUser } from './stripeActions';

// actions pass data as object
import {
  AUTH_REGISTER_REQUEST,
  AUTH_REGISTER_SUCCESS,
  AUTH_REGISTER_FAILURE,
  AUTH_LOGIN_REQUEST,
  AUTH_LOGIN_SUCCESS,
  AUTH_LOGIN_FAILURE,
  AUTH_USER_LOGOUT,
  AUTH_USER_DELETE_REQUEST,
  AUTH_USER_DELETE_SUCCESS,
  AUTH_USER_DELETE_FAILURE,
  AUTH_USER_LOADED,
  AUTH_ERROR,
  AUTH_FORGOT_PASSWORD_REQUEST,
  AUTH_FORGOT_PASSWORD_SUCCESS,
  AUTH_FORGOT_PASSWORD_FAILURE,
  AUTH_VERIFY_PASSWORD_REQUEST,
  AUTH_VERIFY_PASSWORD_SUCCESS,
  AUTH_VERIFY_PASSWORD_FAILURE,
  AUTH_VERIFY_PASSWORD_RESET,
  // AUTH_UPDATE_PASSWORD_REQUEST,
  // AUTH_UPDATE_PASSWORD_SUCCESS,
  // AUTH_UPDATE_PASSWORD_FAILURE,
  // AUTH_UPDATE_PASSWORD_RESET,
  AUTH_NEW_PASSWORD_REQUEST,
  AUTH_NEW_PASSWORD_SUCCESS,
  AUTH_NEW_PASSWORD_FAILURE,
  // TOKEN_REQUEST,
  // TOKEN_RECEIVED,
  // TOKEN_FAILURE
} from '../constants/authConstants';
import { USER_DETAILS_RESET } from '../constants/userConstants';
import { CART_CLEAR_ITEMS } from '../constants/cartConstants'

// authTest controller
export const loadUser = () => async dispatch => {
  try {
    const res = await api.get('/auth');
    let result = res.data.data;
    // console.log("stripeCustId upon user loaded")
    // console.log(result)
    // console.log("--------------------")
    // console.log(result.stripeCustId)
    if (result.stripeCustId) {
      await dispatch(addCardToUser(result.stripeCustId));
    }

    dispatch({
      type: AUTH_USER_LOADED,
      payload: result
    })
  } catch (err) {
    dispatch({type: AUTH_ERROR});
    dispatch(setAlert('Failed to retrieve user info.', 'danger'));
  }
};

export const registerUser = (formRegData) => async dispatch => {
  try {
    dispatch({type: AUTH_REGISTER_REQUEST})

    const res = await api.post('/auth/register', formRegData);
    const result = res.data.data;

    // payload is token, place token into LS
    dispatch({
      type: AUTH_REGISTER_SUCCESS,
      payload: result
    })
    // load user information
    dispatch(loadUser());
    dispatch(setAlert('Successfully registered. Welcome.', 'success'));
  } catch (err) {
    dispatch(setAlert('Failed to Register', 'danger'));
    const errors = err.response.data.errors;
    // pass msg and alert type
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: AUTH_REGISTER_FAILURE});
  }
};

export const loginUser = (formData) => async dispatch => {
  try {
    // if (localStorage.getItem('__shippingAddress')) {
    //   localStorage.removeItem('__shippingAddress');
    // }
    dispatch({type: AUTH_LOGIN_REQUEST})
    const res = await api.post('/auth/login', formData);

    let result = res.data.data;
    
    // payload is token, place token into LS
    dispatch({
      type: AUTH_LOGIN_SUCCESS,
      payload: result
    })
    // load user information
    dispatch(loadUser());

    dispatch(setAlert('Welcome!', 'success'));
  } catch (err) {
    dispatch(setAlert('Failed to login. Incorrect email or password.', 'danger'));
    const errors = err.response.data.errors;
    // pass msg and alert type
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: AUTH_LOGIN_FAILURE});
  }
};

export const logout = (history) => async dispatch => {
  dispatch({type: USER_DETAILS_RESET})
  dispatch({type: AUTH_USER_LOGOUT})
  if (localStorage.getItem('__shippingAddress')) {
    localStorage.removeItem('__shippingAddress');
  }

  history.push('/');
  dispatch(setAlert('Logout successful.', 'success'));

  await api.post('/auth/logout');
};

export const deleteUser = (history) => async dispatch => {
  try {
    dispatch({type: CART_CLEAR_ITEMS});
    dispatch({type: USER_DETAILS_RESET});
    dispatch({type: AUTH_USER_DELETE_REQUEST});
    // let servicedData = await registerForm(formRegData);
    await api.delete('/auth/remove');

    // payload is token, place token into LS
    dispatch({
      type: AUTH_USER_DELETE_SUCCESS,
      // payload: res.data.data
    })
    // load user information
    history.push('/');
    dispatch(setAlert('Your user account has been deleted.', 'success'));
  } catch (err) {
    dispatch({type: AUTH_USER_DELETE_FAILURE});
    const errors = err.response.data.errors;
    // pass msg and alert type
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch(setAlert("Failed to delete account.", "danger"));
  }
};

export const forgotPassword = (email) => async dispatch => {
  try {
    dispatch({type: AUTH_FORGOT_PASSWORD_REQUEST})
    const res = await api.post('/auth/forgot-password', {email});

    let result = res.data;

    dispatch({
      type: AUTH_FORGOT_PASSWORD_SUCCESS,
      payload: result
    })

    dispatch(setAlert('Password reset link sent to your email.', 'success'));
  } catch (err) {
    dispatch(setAlert('Failed to send reset link. Check email address and try again.', 'danger'));
    const errors = err.response.data.errors;
    // pass msg and alert type
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: AUTH_FORGOT_PASSWORD_FAILURE});
  }
};

export const verifyPassword = (token, email, history) => async dispatch => {
  try {
    dispatch({type: AUTH_VERIFY_PASSWORD_REQUEST})
    const res = await api.post(`/auth/verify-reset?token=${token}&email=${email}`);

    let result = res.data;

    dispatch({
      type: AUTH_VERIFY_PASSWORD_SUCCESS,
      payload: result
    })

    dispatch(setAlert('Reset link valid.', 'success'));
  } catch (err) {
    // history.push("/login");
    const errors = err.response.data.errors;
    // pass msg and alert type
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch(setAlert('Reset link invalid. Please try password reset again.', 'danger'));
    dispatch({type: AUTH_VERIFY_PASSWORD_FAILURE});
  }
};

export const resetPassword = (token, email, passwords, history) => async dispatch => {
  try {
    dispatch({type: AUTH_FORGOT_PASSWORD_REQUEST})
    const res = await api.post(`/auth/reset-password?token=${token}&email=${email}`, passwords);

    let result = res.data.status;

    dispatch({
      type: AUTH_FORGOT_PASSWORD_SUCCESS,
      payload: result
    })

    dispatch(setAlert('Password reset. Please login using new password.', 'success'));
    history.push('/login');
  } catch (err) {
    dispatch(setAlert('Failed to reset password. Please try password reset again.', 'danger'));
    const errors = err.response.data.errors;
    // pass msg and alert type
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: AUTH_FORGOT_PASSWORD_FAILURE});
  }
};