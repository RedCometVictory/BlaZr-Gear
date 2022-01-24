import React, { useState, useEffect } from 'react';
import { useLocation, useHistory, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAlert } from '../../redux/actions/alertActions';
import { verifyPassword, resetPassword } from '../../redux/actions/authActions';
import Spinner from '../layouts/Spinner';
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const query = useQuery();
  const email = query.get("email");
  const token = query.get("token");
  const resetStatus = useSelector(state => state.auth);
  const { loading, allowReset } = resetStatus;
  const [passwordSent, setPasswordSent] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [formData, setFormData] = useState({
    password: '', password2: ''
  })

  // TODO --- get token and email as query values
  useEffect(() => {
    dispatch(verifyPassword(token, email, history))
  }, [dispatch]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const { password, password2 } = formData;
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      dispatch(setAlert('Passwords do not match.', 'danger'));
    } else {
      dispatch(resetPassword(token, email, formData, history));
    }
    setPasswordSent(true)
  }

  return loading ? (
    <Spinner />
  ) : !allowReset ? (
    <section className="form-page-wrapper">
      <div className="form-container">
        <div className="form__section-header">
          <h1 className="form__header">Reset Password</h1>
          <p>
            <i className="fas fa-user" /> Token has expired. Please attempt to reset password again.
          </p>
          <Link to="/forgot-password" className="forgot-password-container">
            <div className="btn btn-secondary forgot-password-btn">Forgot Password</div>
          </Link>
        </div>
      </div>
    </section>
  ) : (
    <section className="form-page-wrapper">
      <div className="form-container">
        <form className="form" onSubmit={onSubmit}>
          <div className="form__section-header">
            <h1 className="form__header">Reset Password</h1>
            <p>
              <i className="fas fa-user" /> Provide password and confirm to reset password.
            </p>
          </div>
          <div className="form__inner-container">
            <div className="form__section">
              <div className="form__group">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  placeholder="Must be 6 or more characters. "
                  aria-required="true"
                  minLength="6"
                  maxLength="16"
                  required/>
                <label htmlFor="password" className="form__label">
                  <span className="form__label-name">New Password</span>
                </label>
              </div>
              <div className="form__group">
                <input
                  type="password"
                  name="password2"
                  value={password2}
                  onChange={onChange}
                  placeholder="Must be 6 or more characters." 
                  aria-required="true"
                  minLength="6"
                  maxLength="16"
                  required/>
                <label htmlFor="password2" className="form__label">
                  <span className="form__label-name">Confirm Password</span>
                </label>
              </div>
            </div>
          </div>
          <div className="form__footer">
            <input type="submit" className="btn btn-primary btn-full-width form__submit" value="Reset Password" />
          </div>
        </form>
      </div>
    </section>
  )
}
export default ResetPassword;