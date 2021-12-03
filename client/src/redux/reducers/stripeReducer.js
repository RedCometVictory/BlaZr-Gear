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

const initialState = {
  intent: null,
  cards: [],
  clientSecret: null,
  success: false,
  loading: true,
  errors: []
};

const stripeReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case CHARGE_COMPLETE_REQUEST:
    case ADD_CARD_TO_USER_REQUEST:
    case STRIPE_CHARGE_RETRIEVED_REQUEST:
      return {
        ...state,
        loading: true
      }
    case ADD_CARD_TO_USER_SUCCESS:
      return {
        ...state,
        cards: payload,
        success: true,
        loading: false
      }
    case CHARGE_COMPLETE_SUCCESS:
    case STRIPE_CHARGE_RETRIEVED_SUCCESS:
      return {
        ...state,
        clientSecret: payload,
        success: true,
        loading: false
      }
    case CHARGE_COMPLETE_FAILURE:
    case ADD_CARD_TO_USER_FAILURE:
    case STRIPE_CHARGE_RETRIEVED_FAILURE:
      return {
        loading: false,
        errors: payload
      }
    default:
      return state;
  }
};
export default stripeReducer;