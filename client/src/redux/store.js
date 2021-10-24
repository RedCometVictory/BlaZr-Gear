import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import setAuthToken from '../utils/setAuthToken';
import rootReducer from './reducers/rootReducer';
// check if access token is expired before any async action / dispatch

const initialState = {}; // included for all reducers
const middleware = [thunk]; // list middleware

const store = createStore(
  rootReducer, initialState, composeWithDevTools(applyMiddleware(...middleware))
);

// subscription listener stores user token into LS
// init current state from redux store, used for comparison to prevent undefined values
let currentState = store.getState();

store.subscribe(() => {
  // compare current state with previous state
  let previousState = currentState;
  currentState = store.getState(); // from rootReducer
  console.log("current state");
  console.log(currentState);
  // if token changes, set the value in LS and axios headers
  // TODO === temporary fix for not having a defined token in LS. Need better workaround? Currnetly if LS is undefined "nothing happens";
  // --------------------------------------
  // only used when first building app when redux is not fully implemented
  // if (setAuthToken.token === undefined) {
  //   return;
  // };
  // --------------------------------------
  // if (previousState.auth.token !== currentState.setAuthToken.token) {
  if (previousState !== currentState.auth.token) {
    // central state is the root reducer
    // access authReducer (set as auth in the rootReducer)
    const token = currentState.auth.token;
    setAuthToken(token);
  }
});
export default store;

/*
const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : []

const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null

const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
  ? JSON.parse(localStorage.getItem('shippingAddress'))
  : {}


const initialState = {
  cart: {
    cartItems: cartItemsFromStorage,
    shippingAddress: shippingAddressFromStorage,
  },
  userLogin: { userInfo: userInfoFromStorage },
}
*/