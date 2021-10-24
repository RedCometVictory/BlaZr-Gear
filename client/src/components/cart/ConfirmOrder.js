import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAlert } from '../../redux/actions/alertActions';
import { paymentMethodForCart } from '../../redux/actions/cartActions';

const ConfirmOrder = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const cartDetails = useSelector(state => state.cart);
  const userAuth = useSelector(state => state.auth);
  const { shippingAddress } = cartDetails;
  const { isAuthenticated } = userAuth;
  const [hasMounted, setHasMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(cartDetails.paymentMethod);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  if (!isAuthenticated) {
    dispatch(setAlert('Sign in to continue with checkout.', 'danger'));
    history.push('/login');
  }
  
  if(!shippingAddress.address || Object.keys(shippingAddress).length === 0 || !shippingAddress) {
    history.push('/shipping-address');
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(paymentMethodForCart(paymentMethod));
    history.push('/payment');
  };

  const onClickRadioSet = (payMethod) => {
    setPaymentMethod(payMethod);
  };

  return (
    <section>
      <h2>Payment Method</h2>
      <p>Select one.</p>
      <form className="admForm" onSubmit={onSubmit} >
        <div className="admForm__inner-container">
          <div className="admForm__section pay-layout">
            <div className="admForm__group pay-method" onClick={() => onClickRadioSet('Stripe')}>
              <label htmlFor="stripe" className="admForm__label">
                Credit / Debit Card:
              </label>
              <input
                type="radio"
                id="stripe"
                name="paymentMethod"
                className=""
                onChange={e => setPaymentMethod(e.target.value)}
                value="Stripe"
                checked={paymentMethod === 'Stripe'}
                required
              />
            </div>
            <div className="admForm__group pay-method" onClick={() => onClickRadioSet('PayPal')}>
              <label htmlFor="paypal" className="admForm__label">PayPal: </label>
              <input
                type="radio"
                id="paypal"
                name="paymentMethod"
                className=""
                onChange={e => setPaymentMethod(e.target.value)}
                value="PayPal"
                checked={paymentMethod === 'PayPal'}
                required
              />
            </div>
          </div>
        </div>
        <div className="admForm__section">
          <div className="admForm__submit-update">
            <input type="submit" className="btn btn-primary btn-full-width admForm__submit" value="Save Payment Method" />
          </div>
        </div>
      </form>
    </section>
  )
}
export default ConfirmOrder;