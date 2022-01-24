import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from './components/layouts/Navbar';
import Landing from './components/layouts/Landing';
import Footer from './components/layouts/Footer';
import Routes from './components/routing/Routes';
import { Provider } from 'react-redux';
import store from './redux/store';
import { loadUser, logout } from './redux/actions/authActions';
import setAuthToken from './utils/setAuthToken';
import './sass/styles.scss';

const App = () => {
  useEffect (() => {
    if (localStorage.token) setAuthToken(localStorage.token);
    store.dispatch(loadUser());
    // logout user from all tabs if logged out from one tab
    window.addEventListener('storage', () => {
      if (!localStorage.token) store.dispatch(logout());
    });
  }, []);

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