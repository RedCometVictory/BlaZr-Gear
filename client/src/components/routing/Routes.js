import React from 'react';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from './PrivateRoutes';
import AdminRoute from './AdminRoutes';
import Alert from '../layouts/Alert';

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
import PaymentContainer from '../cart/PaymentContainer';
import OrderSuccess from '../cart/OrderSuccess';
import Map from '../layouts/Map';

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
import AdminOrders from '../admin/orders/AdminOrders';
import AdminOrderDetail from '../admin/orders/AdminOrderDetail';

const Routes = () => {
  return (
    <main className="container">
      <Alert />
      <Switch>
        <Route exact path="/register" component={Register} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/search/:keyword" component={Product} />
        <Route exact path="/shop" component={Product} />
        <Route exact path="/product/:prod_id" component={ProductDetail} />
        <Route exact path="/cart" component={Cart} />
        <Route exact path="/forgot-password" component={ForgotPassword} />
        <Route exact path="/reset-password" component={ResetPassword} />
        <Route exact path="/shipping-address" component={Shipping} />
        <Route exact path="/confirm-order" component={ConfirmOrder} />
        <Route exact path="/payment" component={PaymentContainer} />
        <Route exact path="/success" component={OrderSuccess} />
        <PrivateRoute exact path="/orders" component={Orders} />
        <PrivateRoute exact path="/order/:order_id/detail" component={OrderDetail} />
        <PrivateRoute exact path="/profile" component={Profile} />
        <PrivateRoute exact path="/map" component={Map} />

        {/* ADMIN */}
        <AdminRoute exact path="/admin/slide/list" component={AdminSlideList} />
        <AdminRoute exact path="/admin/slide/create" component={AdminSlideCreate} />
        <AdminRoute exact path="/admin/slide/:slide_id/detail" component={AdminSlideDetail} />
        <AdminRoute exact path="/admin/image/list" component={AdminImageList} />
        <AdminRoute exact path="/admin/image/:image_id/detail" component={AdminImageDetail} />
        <AdminRoute exact path="/admin/product-list" component={AdminProductList} />
        <AdminRoute exact path="/admin/product/create" component={AdminProductCreate} />
        <AdminRoute exact path="/admin/product/:prod_id/detail" component={AdminProductDetail} />
        <AdminRoute exact path="/admin/user-list" component={AdminUserList} />
        <AdminRoute exact path="/admin/user/:user_id" component={AdminUserDetail} />
        <AdminRoute exact path="/admin/order-list" component={AdminOrders} />
        <AdminRoute exact path="/admin/order/:order_id/detail" component={AdminOrderDetail} />
        <Route component={NotFound} />
      </Switch>
    </main>
  )
}
export default Routes;