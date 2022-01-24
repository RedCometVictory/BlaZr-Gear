import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { setAlert } from '../../redux/actions/alertActions';
import { registerUser } from '../../redux/actions/authActions';

const Register = () => {
  const dispatch = useDispatch();
  const userAuth = useSelector(state => state.auth);
  const { isAuthenticated } = userAuth;
  const [formRegData, setFormRegData] = useState({
    firstName: '', lastName: '',
    username: '', email: '',
    password: '', password2: ''
  });

  const { firstName, lastName, username, email, password, password2 } = formRegData;

  const onChange = (e) => {
    setFormRegData({ ...formRegData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(setAlert('Form registry submitted!', 'success'))
    if (password !== password2) {
      dispatch(setAlert('Passwords do not match.', 'danger'));
    } else {
      dispatch(registerUser(formRegData));
    }
  };
  
  if (isAuthenticated) {
    return <Redirect to="/" />
  }

  return (
    <section className="form-page-wrapper">
      <div className="form-container">
        <form className="form" onSubmit={onSubmit} >
          <div className="form__section-header">
            <h1 className="form__header">Sign Up</h1>
            <p>
              <i className="fas fa-user" /> Create Your Account
            </p>
          </div>
          <div className="form__inner-container">
            <div className="form__section">
              <div className="form__group">
                <input type="email" name="email" value={email} onChange={onChange} maxLength={60} placeholder="myemail123@mail.com " aria-required="true" required/>
                <label htmlFor="email" className="form__label">
                  <span className="form__label-name">E-Mail Address</span>
                </label>
              </div>
              <div className="form__group">
                <input type="password" name="password" value={password} onChange={onChange}  maxLength={60} placeholder="Must be 6 or more characters. " aria-required="true" required/>
                <label htmlFor="password" className="form__label">
                  <span className="form__label-name">Password</span>
                </label>
              </div>
              <div className="form__group">
                <input type="password" name="password2" value={password2} onChange={onChange} maxLength={60} placeholder="Repeat password to confirm. " aria-required="true" required/>
                <label htmlFor="password2" className="form__label">
                  <span className="form__label-name">Confirm Password</span>
                </label>
              </div>
            </div>
            <div className="form__section section-two">
              <div className="form__group">
                <input type="text" name="username" value={username} onChange={onChange} maxLength={20} placeholder="White Owl-01 " aria-required="true" required/>
                <label htmlFor="username" className="form__label">
                  <span className="form__label-name">Username</span>
                </label>
              </div>
              <div className="form__group">
                <input type="text" name="firstName" value={firstName} onChange={onChange} maxLength={12} placeholder="Jose" aria-required="true" required/>
                <label htmlFor="firstName" className="form__label">
                  <span className="form__label-name">First Name</span>
                </label>
              </div>
              <div className="form__group">
                <input type="text" name="lastName" value={lastName} onChange={onChange} maxLength={20} placeholder="Price" aria-required="true" required/>
                <label htmlFor="lastName" className="form__label">
                  <span className="form__label-name">Last Name</span>
                </label>
              </div>
            </div>
          </div>
          <div className="form__footer">
            <input type="submit" className="btn btn-primary btn-full-width form__submit" value="Register" />
            <div className="form__footer-links">
              <p>
                Already have an account?{" "}<Link to="/login"><span className="form form__link">Login.</span></Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
};
export default Register;