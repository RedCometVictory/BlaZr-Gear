import {
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_DETAILS_FAILURE,
  USER_DETAILS_RESET,
  USER_LIST_REQUEST,
  USER_LIST_SUCCESS,
  USER_LIST_FAILURE,
  USER_LIST_RESET,
  USER_CREATE_PROFILE_REQUEST,
  USER_CREATE_PROFILE_SUCCESS,
  USER_CREATE_PROFILE_FAILURE,
  USER_CREATE_PROFILE_RESET,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_UPDATE_PROFILE_FAILURE,
  USER_UPDATE_PROFILE_RESET,
  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAILURE,
  USER_UPDATE_RESET
} from '../constants/userConstants';

const initialState = {
  users: null,
  userById: null,
  loading: true,
  errors: []
}
const userReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case USER_DETAILS_REQUEST:
      return {
        ...state,
        loading: true
      }
    case USER_CREATE_PROFILE_REQUEST:
    case USER_UPDATE_PROFILE_REQUEST:
    case USER_UPDATE_REQUEST:
      return { ...state, loading: true }
    case USER_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        users: []
      }
    case USER_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        userById: payload
      }
    case USER_CREATE_PROFILE_SUCCESS:
    case USER_UPDATE_PROFILE_SUCCESS:
      return {
        loading: false,
        success: true,
        userById: payload
      }
    case USER_LIST_SUCCESS:
      return {
        loading: false,
        users: payload
      }
    case USER_UPDATE_SUCCESS:
      return {
        ...state,
        userById: payload,
        loading: false,
        success: true
      }
    case USER_DETAILS_FAILURE:
    case USER_CREATE_PROFILE_FAILURE:
    case USER_UPDATE_PROFILE_FAILURE:
    case USER_LIST_FAILURE:
    case USER_UPDATE_FAILURE:
      return { loading: false, errors: payload }
    case USER_DETAILS_RESET:
    case USER_UPDATE_RESET:
    case USER_CREATE_PROFILE_RESET:
    case USER_UPDATE_PROFILE_RESET:
    return { userById: {} }
    case USER_LIST_RESET:
      return { users: {} }
    default:
      return state;
  }
};
export default userReducer;