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
  STRIPE_CHARGE_RETRIEVED_FAILURE,
  CLEAR_CARD_INFO
} from '../constants/stripeConstants';

const initialState = {
  intent: null,
  cards: [],
  cardToUse: {},
  clientSecret: null,
  success: false,
  loading: true,
  errors: []
};

const stripeReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case CHARGE_COMPLETE_REQUEST:
    case SET_CARD_REQUEST:
    case ADD_CARD_TO_USER_REQUEST:
    case REMOVE_CARD_OF_USER_REQUEST:
    case STRIPE_CHARGE_RETRIEVED_REQUEST:
      return {
        ...state,
        loading: true
      }
    case SET_CARD_SUCCESS:
      return {
        ...state,
        cardToUse: payload,
        loading: false
      }
    case ADD_CARD_TO_USER_SUCCESS:
      // only overrid if new value, otherwise keep curr if new value is false, override or erasee with a diff case call
      return {
        ...state,
        cards: payload.cards,
        // clientSecret: payload.clientSecret === '' || !payload.clientSecret ? state.clientSecret : payload.clientSecret,
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
    case REMOVE_CARD_OF_USER_SUCCESS:
      let removedPM = state.cards.data.filter(pm => pm.id !== payload.deleted.id);
      state.cards.data = removedPM;
      return {
        ...state,
        loading: false
      }
    case CLEAR_CARD_INFO:
      return {
        intent: null,
        cards: [],
        cardToUse: {},
        clientSecret: null
      }
    case CHARGE_COMPLETE_FAILURE:
    case SET_CARD_FAILURE:
    case ADD_CARD_TO_USER_FAILURE:
    case STRIPE_CHARGE_RETRIEVED_FAILURE:
    case REMOVE_CARD_OF_USER_FAILURE:
      return {
        loading: false,
        errors: payload
      }
    default:
      return state;
  }
};
export default stripeReducer;