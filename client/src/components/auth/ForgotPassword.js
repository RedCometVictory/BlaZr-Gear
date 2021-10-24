import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../redux/actions/authActions';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false);

  const onChange = (e) => {
    setEmail( e.target.value );
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(forgotPassword(email));
    setEmailSent(true);
  }
  return (
    <section className="form-page-wrapper">
      <div className="form-container">
        <form className="form" onSubmit={onSubmit}>
          <div className="form__section-header">
            <h1 className="form__header">Forgot Password</h1>
            <p>
              <i className="fas fa-user" /> Provide email to reset password.
            </p>
          </div>
          <div className="form__inner-container">
            <div className="form__section">
              <div className="form__group">
                <input type="email" name="email" value={email} onChange={onChange} placeholder="myemail123@mail.com " aria-required="true" disabled={emailSent} required/>
                <label htmlFor="email" className="form__label">
                  <span className="form__label-name">E-Mail Address</span>
                </label>
              </div>
            </div>
          </div>
          <div className="form__footer">
            {!emailSent ? (
              <>
              <input type="submit" className="btn btn-primary btn-full-width form__submit" value="Reset Password" />
              <div className="form__footer-links">
                <p>
                  <Link to="/login"><span className="form form__link">I remember my account!</span></Link>
                </p>
              </div>
              </>
            ) : (
              <div className="form__footer-links">
                <p>
                  Link to reset password has been sent to your email. If an error occurred, refresh the page and try again.
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
export default ForgotPassword;