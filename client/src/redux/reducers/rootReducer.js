import { combineReducers } from 'redux'; // all reducers into one
import alertReducer from './alertReducer';
import authReducer from './authReducer';
import cartReducer from './cartReducer';
import imageReducer from './imageReducer';
import orderReducer from './orderReducer';
import productReducer from './productReducer';
import userReducer from './userReducer';
import slideReducer from './slideReducer';
import stripeReducer from './stripeReducer';

// treat as global state - retreive via getState()
export default combineReducers({
  alert: alertReducer,
  auth: authReducer,
  cart: cartReducer,
  image: imageReducer,
  order: orderReducer,
  product: productReducer,
  user: userReducer,
  slide: slideReducer,
  stripe: stripeReducer
});