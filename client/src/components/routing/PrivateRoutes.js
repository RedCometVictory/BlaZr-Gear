import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../layouts/Spinner';

// take in comp passed into component prop, and a spread op to take in any additional values passed into comp
// Component (the placeholder name for any of the private route components passed into the components props)
// any custom props passed into ...rest will be passed into the routes
// ...rest collects any other props passed into the component
// render={render props & component}, in particular render if user is authenticated, if not authenticated and not loading then redirect, otherwise load in the passed in component (if user is authenticated)
const PrivateRoute = ({ component: Component, ...rest }) => {
  // const dispatch = useDispatch();
  const userAuth = useSelector(state => state.auth);
  // const { isAuthenticated, user, loading } = userAuth;
  const { isAuthenticated, loading } = userAuth;

  return (
    <Route
      {...rest}
      render={props =>
        loading ? (
          <Spinner />
        ) : isAuthenticated ? (
          <Component {...props} />
        ) : (
          // when logging out redirect to...
          // <Redirect to="/login" />
          <Redirect to="/" />
        )
      }
    />
  );
};
export default PrivateRoute;