import api from '../../utils/api';
import { setAlert } from './alertActions';
import {
  CART_GET_ALL,
  CART_GET_ALL_GUEST,
  CART_ADD_ITEM,
  CART_ADD_ITEM_GUEST,
  CART_UPDATE_LIST,
  CART_UPDATE_ITEM,
  CART_ADD_ITEM_FAILURE,
  CART_ADD_ITEM_GUEST_FAILURE,
  CART_UPDATE_ITEM_FAILURE,
  // CART_CLEAR_ITEMS,
  CART_REMOVE_ITEM,
  CART_SAVE_SHIPPING_ADDRESS,
  CART_SAVE_PAYMENT_METHOD
} from '../constants/cartConstants';

export const getCart = () => async dispatch => {
  try {
    const res = await api.get('/cart/me');

    dispatch({
      type: CART_GET_ALL,
      payload: res.data.data.cartItems
    })
  } catch (err) {
    dispatch(setAlert('Failed to get cart from db.', 'danger'));
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
  }
};

export const getCartGuest = () => async dispatch => {
  try {
    // const res = await api.get('/cart/me');
    dispatch({
      type: CART_GET_ALL_GUEST,
      // payload: res.data.data.cartItems
    })
  } catch (err) {
    dispatch(setAlert('Failed to get guest cart.', 'danger'));
  }
};

export const resetCartOnProductDelete = (match) => async (dispatch, getState) => {
  try {
    dispatch({
      type: CART_UPDATE_LIST,
      payload: match
    })

    localStorage.setItem('__cart', JSON.stringify(getState().cart.cartItems));
  } catch (err) {
    dispatch(setAlert('Failed to reset guest cart.', 'danger'));
  }
};

export const addItemToCartGuest = (prod_id, qty) => async (dispatch, getState) => {
  try {
    // let cartItemsGuest = [];
    // const res = await api.post('/cart/add', cartData);
    const res = await api.get(`/products/${prod_id}`);
    let product = res.data.data;
    product = res.data.data.productInfo;

    dispatch({
      type: CART_ADD_ITEM_GUEST,
      payload: {product, qty}
    });
    localStorage.setItem('__cart', JSON.stringify(getState().cart.cartItems));

  } catch (err) {
    dispatch(setAlert('Failed to add to cart.', 'danger'));
    dispatch({type: CART_ADD_ITEM_GUEST_FAILURE});
    // const errors = err.response.data.errors;

    // if (errors) {
    //   errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    // }
  }
};

export const addItemToCart = (prod_id, qty) => async (dispatch, getState) => {
  try {
    // const res = await api.post('/cart/add', cartData);
    const res = await api.get(`/products/${prod_id}`, qty);
    // const res = await api.put('/cart/update-quantity');
    dispatch({
      type: CART_ADD_ITEM,
      payload: res.data.data
    });

    localStorage.setItem('__cart', JSON.stringify(getState().cart.cartItems));
  } catch (err) {
    dispatch(setAlert('Failed to add to cart.', 'danger'));
    dispatch({type: CART_ADD_ITEM_FAILURE});
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
  }
};

// add / subtract item qty from cart
export const updateItemInCart = (prod_id, cartQty) => async (dispatch, getState) => {
  try {
    // const res = await api.post('/cart/add', cartData);
    const res = await api.get(`/products/${prod_id}`);
    // const res = await api.put('/cart/update-quantity');
    dispatch({
      type: CART_UPDATE_ITEM,
      payload: { product: res.data.data, cartQty }
    });

    localStorage.setItem('__cart', JSON.stringify(getState().cart.cartItems));
  } catch (err) {
    dispatch(setAlert('Failed to add to cart.', 'danger'));
    dispatch({type: CART_UPDATE_ITEM_FAILURE});
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
  }
};

export const removeFromCart = (prod_id) => async (dispatch, getState) => {
  try {
    // const res = await api.post('/cart/add', cartData);
    const res = await api.delete(`/cart/delete`);

    dispatch({
      type: CART_REMOVE_ITEM,
      payload: res.data.data
    });

    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
  } catch (err) {
    dispatch(setAlert('Failed to remove item from cart.', 'danger'));
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
  }
};

export const removeFromCartGuest = (prod_id) => async (dispatch, getState) => {
  dispatch({
    type: CART_REMOVE_ITEM,
    payload: prod_id
  })

  localStorage.setItem('__cart', JSON.stringify(getState().cart.cartItems))
}

export const shippingAddressForCart = (shippingAddress) => async (dispatch, getState) => {
  try {
    // const res = await api.post('/users/shipping-address', formData);
    // let result = res.data.data;
    dispatch({
      type: CART_SAVE_SHIPPING_ADDRESS,
      payload: shippingAddress
    });

    localStorage.setItem('__shippingAddress', JSON.stringify(getState().cart.shippingAddress));
  } catch (err) {
    dispatch(setAlert('Failed to set shipping address for cart.', 'danger'));
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
  }
};

export const paymentMethodForCart = (formData) => async (dispatch, getState) => {
  try {
    // const res = await api.post('/cart/add', cartData);
    // const res = await api.delete(`/products/${prod_id}`);
    dispatch({
      type: CART_SAVE_PAYMENT_METHOD,
      payload: formData
    });

    localStorage.setItem('__paymentMethod', JSON.stringify(formData));
  } catch (err) {
    dispatch(setAlert('Failed to set payment method for cart.', 'danger'));
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
  }
};