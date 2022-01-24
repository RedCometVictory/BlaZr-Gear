import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../layouts/Spinner';

const AdminRoute = ({ component: Component, ...rest }) => {
  const userAuth = useSelector(state => state.auth);
  const { isAuthenticated, userInfo, loading } = userAuth;

  return (
    <Route
      {...rest}
      render={props =>
        loading ? (
          <Spinner />
        ) : !loading && isAuthenticated && userInfo.role === 'admin' ? (
          <Component {...props} />
        ) : (
          // when logging out redirect to...
          <Redirect to="/" />
        )
      }
    />
  );
};
export default AdminRoute;