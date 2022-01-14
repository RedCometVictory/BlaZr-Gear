import {
  CART_GET_ALL,
  CART_GET_ALL_GUEST,
  CART_GET_ALL_FAILURE,
  CART_ADD_ITEM,
  CART_ADD_ITEM_GUEST,
  CART_UPDATE_LIST,
  CART_UPDATE_ITEM,
  CART_ADD_ITEM_FAILURE,
  CART_ADD_ITEM_GUEST_FAILURE,
  CART_UPDATE_ITEM_FAILURE,
  CART_CLEAR_ITEMS,
  CART_REMOVE_ITEM,
  CART_SAVE_SHIPPING_ADDRESS,
  CART_SAVE_PAYMENT_METHOD
} from '../constants/cartConstants'

const initialState = {
  cartItems: localStorage.getItem('__cart') ? JSON.parse(localStorage.getItem('__cart')) : [],
  paymentMethod: localStorage.getItem('__paymentMethod') ? JSON.parse(localStorage.getItem('__paymentMethod')) : null,
  shippingAddress: localStorage.getItem('__shippingAddress') ? JSON.parse(localStorage.getItem('__shippingAddress')): {},
  total: 0,
  loading: true,
  errors: []
};

const cartReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case CART_GET_ALL:
      return {
        ...state,
        loading: false,
        cartItems: payload
      }
    case CART_GET_ALL_GUEST:
      return {
        ...state,
        loading: false,
        // cartItems
        // cartItems: payload
      }
    case CART_UPDATE_LIST:
      return {
        ...state,
        loading: false,
        cartItems: payload
      }
    case CART_ADD_ITEM:
    case CART_ADD_ITEM_GUEST:
    case CART_UPDATE_ITEM:
      const item = payload;
      const existItem = state.cartItems.find(i => i.product.id === item.product.id);
      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(i => i.product.id === existItem.product.id ? item : i)
        }
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item]
        }
      }
    case CART_REMOVE_ITEM:
      return {
        ...state,
        cartItems: state.cartItems.filter(i => i.product.id !== payload)
      }
    case CART_SAVE_SHIPPING_ADDRESS:
      return {
        ...state,
        shippingAddress: payload
      }
    case CART_SAVE_PAYMENT_METHOD:
      return {
        ...state,
        paymentMethod: payload
      }
    case CART_CLEAR_ITEMS:
      return {
        ...state,
        cartItems: [],
        paymentMethod: null,
        shippingAddress: {}
      }
    case CART_GET_ALL_FAILURE:
    case CART_ADD_ITEM_FAILURE:
    case CART_ADD_ITEM_GUEST_FAILURE:
    case CART_UPDATE_ITEM_FAILURE:
      return {
        ...state,
        loading: false,
        errors: payload
      }
    default:
      return state;
  }
};
export default cartReducer;