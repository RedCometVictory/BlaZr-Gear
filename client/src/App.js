import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from './components/layouts/Navbar';
import Landing from './components/layouts/Landing';
import Footer from './components/layouts/Footer';
import Routes from './components/routing/Routes';
// Redux
import { Provider } from 'react-redux';
import store from './redux/store';
import { loadUser, logout } from './redux/actions/authActions';
import setAuthToken from './utils/setAuthToken';
import './sass/styles.scss';

const App = () => {
  useEffect (() => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    };
    store.dispatch(loadUser());
    // logout user from all tabs if logged out from one tab
    window.addEventListener('storage', () => {
      console.log("refresh logged me out")
      if (!localStorage.token) store.dispatch(logout());
    });
  }, []);
  const [hasMounted, setHasMounted] = useState(false);

  // useEffect(() => {
  //   setHasMounted(true);
  // }, []);

  // if (!hasMounted) {
  //   return null;
  // }
  return (
    <Provider store={store} >
      <Router>
        <Navbar />
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route component={ Routes } />
        </Switch>
        <Footer />
      </Router>
    </Provider>
  )
};
export default App;