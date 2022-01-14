import api from '../../utils/api';
import { setAlert } from './alertActions';
import {
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_DETAILS_FAILURE,
  // USER_DETAILS_RESET,
  USER_LIST_REQUEST,
  USER_LIST_SUCCESS,
  USER_LIST_FAILURE,
  // USER_LIST_RESET,
  USER_CREATE_PROFILE_REQUEST,
  USER_CREATE_PROFILE_SUCCESS,
  USER_CREATE_PROFILE_FAILURE,
  // USER_CREATE_PROFILE_RESET,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_UPDATE_PROFILE_FAILURE,
  // USER_UPDATE_PROFILE_RESET,
  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAILURE,
  // USER_UPDATE_RESET,
} from '../constants/userConstants';

export const getUserProfile = () => async dispatch => {
  try {
    dispatch({type: USER_DETAILS_REQUEST});

    const res = await api.get('/users/me');
    let result = res.data.data;
    dispatch({
      type: USER_DETAILS_SUCCESS,
      payload: result
    })
  } catch (err) {
    dispatch(setAlert('Failed to get user profile.', 'danger'));
    const errors = err.response.data.errors;
    
    dispatch({type: USER_DETAILS_FAILURE});
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
  }
};

// Admin can view user and make the user admin as well
export const getUserProfileAdmin = (user_id) => async dispatch => {
  try {
    dispatch({type: USER_DETAILS_REQUEST});

    const res = await api.get(`/users/${user_id}`);
    const result = res.data.data;

    dispatch({
      type: USER_DETAILS_SUCCESS,
      payload: result
    })
  } catch (err) {
    dispatch(setAlert('Failed to get user profile.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: USER_DETAILS_FAILURE});
  }
};

// list all users
export const getUsersAdmin = () => async dispatch => {
  try {
    dispatch({type: USER_LIST_REQUEST});
    
    const res = await api.get(`/users`);
    const result = res.data.data.profiles;

    dispatch({
      type: USER_LIST_SUCCESS,
      payload: result
    })
  } catch (err) {
    dispatch(setAlert('Failed to list users.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: USER_LIST_FAILURE});
  }
};

export const updateUserInfo = (userForm) => async dispatch => {
  try {
    dispatch({type: USER_UPDATE_PROFILE_REQUEST});

    const res = await api.put(`/users/info`, userForm);
    let result = res.data.data;

    dispatch({
      type: USER_UPDATE_PROFILE_SUCCESS,
      payload: result
    })

    localStorage.setItem('userInfo', JSON.stringify(result));
    dispatch(setAlert('User information updated.', 'success'));
  } catch (err) {
    dispatch(setAlert('Failed to update user information.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: USER_UPDATE_PROFILE_FAILURE});
  }
};


// register new user + create user profile
export const createUserProfile = (profileForm) => async dispatch => {
  try {
    dispatch({type: USER_CREATE_PROFILE_REQUEST});

    const res = await api.post(`/users/profile`, profileForm);

    let result = res.data.data;

    dispatch({
      type: USER_CREATE_PROFILE_SUCCESS,
      payload: result
    })

    localStorage.setItem('userInfo', JSON.stringify(result));
    dispatch(setAlert('Profile created.', 'success'));
  } catch (err) {
    dispatch(setAlert('Failed to create user profile.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: USER_CREATE_PROFILE_FAILURE});
  }
};


export const updateUserProfile = (profileForm) => async dispatch => {
  try {
    dispatch({type: USER_UPDATE_PROFILE_REQUEST});

    const res = await api.put(`/users/profile`, profileForm);
    let result = res.data.data;

    dispatch({
      type: USER_UPDATE_PROFILE_SUCCESS,
      payload: result
    })

    localStorage.setItem('userInfo', JSON.stringify(result));
    dispatch(setAlert('Profile updated.', 'success'));
  } catch (err) {
    dispatch(setAlert('Failed to update user profile.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: USER_UPDATE_PROFILE_FAILURE});
  }
};

// register new user + create user profile
export const updateUserAdmin = (user_id, userForm) => async dispatch => {
  try {
    dispatch({type: USER_UPDATE_REQUEST});

    const res = await api.put(`/users/${user_id}`, userForm);
    let result = res.data.data;

    dispatch({
      type: USER_UPDATE_SUCCESS,
      payload: result
    })

    localStorage.setItem('userInfo', JSON.stringify(result));
  } catch (err) {
    dispatch(setAlert('Admin failed to update user profile.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: USER_UPDATE_FAILURE});
  }
};