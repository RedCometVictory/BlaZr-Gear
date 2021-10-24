import React from 'react';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from './PrivateRoutes';
import Alert from '../layouts/Alert';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from '@stripe/stripe-js';
import Register from '../auth/Register';
import Login from '../auth/Login';
import Product from '../product/Product';
import ProductDetail from '../product/ProductDetail';
import Cart from '../cart/Cart';
import Orders from '../order/Orders';
import OrderDetail from '../order/OrderDetail';
import Profile from '../profile/Profile';
import ForgotPassword from '../auth/ForgotPassword';
import ResetPassword from '../auth/ResetPassword';
import Shipping from '../cart/Shipping';
import ConfirmOrder from '../cart/ConfirmOrder';
import GuestPayment from '../cart/GuestPayment';
import Payment from '../cart/Payment';
// import OrderSuccess from '../cart/OrderSuccess';

// ========================================

import NotFound from '../layouts/NotFound';
import AdminSlideList from '../admin/slide/AdminSlideList';
import AdminSlideDetail from '../admin/slide/AdminSlideDetail';
import AdminSlideCreate from '../admin/slide/AdminSlideCreate';
import AdminImageList from '../admin/image/AdminImageList';
import AdminImageDetail from '../admin/image/AdminImageDetail';
import AdminProductList from '../admin/product/AdminProductList';
import AdminProductDetail from '../admin/product/AdminProductDetail';
import AdminProductCreate from '../admin/product/AdminProductCreate';
import AdminUserList from '../admin/users/AdminUserList';
import AdminUserDetail from '../admin/users/AdminUserDetail';

// force user auth before access to components
// import PrivateRoute from './PrivateRoute';
// pass the component to load as a component prop
const Routes = () => {
  const stripePromise = loadStripe(`${process.env.REACT_APP_STRIPE_PUBLIC_KEY}`)
  return (
    <main className="container">
      <Alert />
      <Elements stripe={stripePromise}>
        <Switch>
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/search/:keyword" component={Product} />
          <Route exact path="/shop" component={Product} />
          <Route exact path="/payment-guest" component={GuestPayment} />
          <Route exact path="/product/:prod_id" component={ProductDetail} />
          <Route exact path="/cart" component={Cart} />
          <Route exact path="/forgot-password" component={ForgotPassword} />
          <Route exact path="/reset-password" component={ResetPassword} />
          <Route exact path="/shipping-address" component={Shipping} />
          <Route exact path="/confirm-order" component={ConfirmOrder} />
          <Route exact path="/payment" component={Payment} />
          <PrivateRoute exact path="/orders" component={Orders} />
          <PrivateRoute exact path="/order/:order_id/detail" component={OrderDetail} />
          <PrivateRoute exact path="/profile" component={Profile} />
          
          {/* ADMIN */}
          <PrivateRoute exact path="/admin/slide/list" component={AdminSlideList} />
          <PrivateRoute exact path="/admin/slide/create" component={AdminSlideCreate} />
          <PrivateRoute exact path="/admin/slide/:slide_id/detail" component={AdminSlideDetail} />
          <PrivateRoute exact path="/admin/image/list" component={AdminImageList} />
          <PrivateRoute exact path="/admin/image/:image_id/detail" component={AdminImageDetail} />
          <PrivateRoute exact path="/admin/product-list" component={AdminProductList} />
          <PrivateRoute exact path="/admin/product/create" component={AdminProductCreate} />
          <PrivateRoute exact path="/admin/product/:prod_id/detail" component={AdminProductDetail} />
          <PrivateRoute exact path="/admin/user-list" component={AdminUserList} />
          <PrivateRoute exact path="/admin/user/:user_id" component={AdminUserDetail} />
          <Route component={NotFound} />
        </Switch>
      </Elements>
    </main>
  )
}
export default Routes;