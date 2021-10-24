import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { loginUser } from '../../redux/actions/authActions';
import { useSelector, useDispatch } from "react-redux";

const Login = () => {
  const dispatch = useDispatch();
  const userAuth = useSelector(state => state.auth);
  const { isAuthenticated } = userAuth;
  const [formData, setFormData] = useState({
    email: '', password: ''
  });

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  }
  
  if (isAuthenticated) {
    return <Redirect to="/" />
  }

  return (
    <section className="form-page-wrapper">
      <div className="form-container">
        <form className="form" onSubmit={onSubmit}>
          <div className="form__section-header">
            <h1 className="form__header">Log In</h1>
            <p>
              <i className="fas fa-user" /> Sign into your Account
            </p>
          </div>
          <div className="form__inner-container">
            <div className="form__section">
              <div className="form__group">
                <input type="email" name="email" value={email} onChange={onChange} placeholder="myemail123@mail.com " aria-required="true" required/>
                <label htmlFor="email" className="form__label">
                  <span className="form__label-name">E-Mail Address</span>
                </label>
              </div>
              <div className="form__group">
                <input type="password" name="password" value={password} onChange={onChange} placeholder="Must be 6 or more characters. " aria-required="true" required/>
                <label htmlFor="password" className="form__label">
                  <span className="form__label-name">Password</span>
                </label>
              </div>
            </div>
          </div>
          <div className="form__footer">
            <input type="submit" className="btn btn-primary btn-full-width form__submit" value="Login" />
            <div className="form__footer-links">
              <p>
                Don't have an account?{" "}<Link to="/register"><span className="form form__link">Create one.</span></Link>
              </p>
              <p>
              <Link to="/forgot-password">
                <span className="form form__link">
                  forgot password?
                </span>
              </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
};
export default Login;