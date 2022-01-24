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
  AUTH_USER_LOADED_REQUEST,
  AUTH_USER_LOADED,
  AUTH_USER_LOADED_FAILURE,
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
  TOKEN_RECEIVED,
  // TOKEN_FAILURE
} from '../constants/authConstants';
// import { ACCOUNT_DELETED } from '../constants/profileConstants';
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: localStorage.getItem("__userInfo") ? true : false,
  loading: false,
  userInfo: localStorage.getItem("__userInfo") ? JSON.parse(localStorage.getItem("__userInfo")) : {},
  errors: null,
  allowReset: false
}

const authReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    // case TOKEN_REQUEST:
    case TOKEN_RECEIVED:
      return {
        ...state,
        token: payload
      }
    case AUTH_USER_LOADED_REQUEST:
      return {
        ...state,
        loading: true
      }
    case AUTH_REGISTER_REQUEST:
    case AUTH_LOGIN_REQUEST:
    case AUTH_USER_DELETE_REQUEST:
      return { ...state, loading: true }
    case AUTH_FORGOT_PASSWORD_REQUEST:
    case AUTH_VERIFY_PASSWORD_REQUEST:
    case AUTH_NEW_PASSWORD_REQUEST:
      return {
        ...state,
        loading: true,
        errors: null
      }
    case AUTH_USER_LOADED:
    case AUTH_REGISTER_SUCCESS:
    case AUTH_LOGIN_SUCCESS:
      return {
        ...state,
        // token: payload,
        isAuthenticated: true,
        loading: false,
        userInfo: payload.userInfo
      }
    case AUTH_VERIFY_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        status: payload.status,
        allowReset: true
      }
    case AUTH_FORGOT_PASSWORD_SUCCESS:
    case AUTH_NEW_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        allowReset: false,
        status: payload
      }
    case AUTH_USER_DELETE_SUCCESS:
    case AUTH_USER_LOGOUT:
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        userInfo: null,
      }
    case AUTH_REGISTER_FAILURE:
    case AUTH_LOGIN_FAILURE:
    case AUTH_USER_LOADED_FAILURE:
    case AUTH_USER_DELETE_FAILURE:
    case AUTH_ERROR:
      return {
        ...state,
        isAuthenticated: false,
        loading: false,
        userInfo: null,
        errors: payload
      }
    case AUTH_VERIFY_PASSWORD_FAILURE:
      return {
        ...state,
        loading: false,
        errors: payload,
        allowReset: false
      }
    // case TOKEN_FAILURE:
    case AUTH_FORGOT_PASSWORD_FAILURE:
    case AUTH_NEW_PASSWORD_FAILURE:
      return {
        ...state,
        loading: false,
        allowReset: false,
        errors: payload
      }
    case AUTH_VERIFY_PASSWORD_RESET:
      return {
        ...state,
        allowReset: false
      }
    default:
      return state
  }
};
export default authReducer;