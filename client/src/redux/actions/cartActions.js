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
    console.log("getting user cart")
    const res = await api.get('/cart/me');
    console.log("user cart results")
    console.log(res);
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
    console.log("getting guest user cart")
    // const res = await api.get('/cart/me');
    // console.log("user cart results")
    // console.log(res);
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
    console.log("match");
    console.log(match);
    dispatch({
      type: CART_UPDATE_LIST,
      payload: match
    })
    
    console.log("resetting cartItems to LS state")
    localStorage.setItem('__cart', JSON.stringify(getState().cart.cartItems));
  } catch (err) {
    dispatch(setAlert('Failed to reset guest cart.', 'danger'));
  }
};

export const addItemToCartGuest = (prod_id, qty) => async (dispatch, getState) => {
  try {
    console.log("initiating add item to cart, user as guest")
    // let cartItemsGuest = [];
    // const res = await api.post('/cart/add', cartData);
    const res = await api.get(`/products/${prod_id}`);
    let product = res.data.data;
    // const res = await Promise.all(api.get(`/products/${prod_id}`, qty));
    // const res = await api.put('/cart/update-quantity');
    // let addToCart = {prod_id, qty};
    console.log("product info retrieved")
    // console.log(res.data.data);
    // console.log("===================")
    // console.log("pushing result into array")
    // cartItemsGuest.push(res.data.data);
    // console.log("getting product id")
    // result = res.data.data.productInfo.id;
    product = res.data.data.productInfo;
    // console.log(cartItemsGuest)
    console.log("-|-|-|-|-|-|-|-|-")
    // console.log(product);
    dispatch({
      type: CART_ADD_ITEM_GUEST,
      payload: {product, qty}
      // payload: {product: result}
      // payload: { product: res.data.data, cartQty }
      // payload: {product: res.data.data}
      // payload: [ res.data.data ]
      // payload: cartItemsGuest
    });
    console.log("saving item to LS. __cart")
    localStorage.setItem('__cart', JSON.stringify(getState().cart.cartItems));

  } catch (err) {
    dispatch(setAlert('Failed to add to cart.', 'danger'));
    dispatch({type: CART_ADD_ITEM_GUEST_FAILURE});
    // TODO: search item by product_id, if value returned from backend is false, delete from cart
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
      // payload: { product: res.data.data, cartQty }
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
      // payload: { result: res.data.data, prod_id }
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

export const shippingAddressForCart = (formData) => async (dispatch) => {
  // TODO --- make api call for shipping address to be saved
  try {
    console.log("ACTION: setting shipping information");
    console.log("formData");
    console.log(formData);
    console.log("==-=---=--=---=-==");
    
    // const res = await api.post('/users/shipping-address', formData);
    // let result = res.data.data;
    // console.log("result");
    // console.log(result);

    dispatch({
      type: CART_SAVE_SHIPPING_ADDRESS,
      // payload: { result: res.data.data, prod_id }
      payload: formData
      // payload: result
    });

    localStorage.setItem('__shippingAddress', JSON.stringify(formData));
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
    // TODO --- make api call to payment method to be saved
    // const res = await api.post('/cart/add', cartData);
    // const res = await api.delete(`/products/${prod_id}`);

    dispatch({
      type: CART_SAVE_PAYMENT_METHOD,
      // payload: { result: res.data.data, prod_id }
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