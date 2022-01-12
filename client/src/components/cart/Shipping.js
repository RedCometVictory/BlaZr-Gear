import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setAlert } from '../../redux/actions/alertActions';
import { shippingAddressForCart } from '../../redux/actions/cartActions';
import { getUserProfile } from '../../redux/actions/userActions';

const Shipping = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const userAuth = useSelector(state => state.auth);
  const userDetail = useSelector(state => state.user);
  const cartDetails = useSelector(state => state.cart);
  const { userInfo, isAuthenticated } = userAuth;
  const { userById } = userDetail;
  const { shippingAddress } = cartDetails;
  const [hasMounted, setHasMounted] = useState(false);
  let [fullname, setFullName] = useState(shippingAddress.fullname || '');
  let [fName, setFName] = useState('');
  let [lName, setLName] = useState('');
  let [email, setEmail] = useState(shippingAddress.email || '');
  const [address, setAddress] = useState(shippingAddress.address || userById?.myProfileInfo?.address || '');
  const [zipcode, setZipcode] = useState(shippingAddress.zipcode || userById?.myProfileInfo?.zipcode || '');
  const [city, setCity] = useState(shippingAddress.city || userById?.myProfileInfo?.city || '');
  const [state, setState] = useState(shippingAddress.state || userById?.myProfileInfo?.state || '');
  const [country, setCountry] = useState(shippingAddress.country || userById?.myProfileInfo?.country || '');

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch((setAlert('Please login / create account to continue with checkout.', 'danger')));
      return history.push('/login');
    }
    if(isAuthenticated && (!shippingAddress.address || Object.keys(shippingAddress).length === 0 || !shippingAddress)) {
      dispatch(getUserProfile());
    };
  }, [dispatch]);

  useEffect(() => {
    setHasMounted(true);
  }, [dispatch]); 

  if (!hasMounted) {
    return null;
  }

  const submitHandler = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      if (fullname === '' || !fullname) {
        let fullName = `${userInfo.f_name} ${userInfo.l_name}`;
        setFullName(fullname = fullName);
      }
      if (!email) {
        setEmail(email = userInfo.user_email);
      }
    }
    if (!isAuthenticated) {
      if (fullname === '' || !fullname) {
        let fullName = `${fName} ${lName}`;
        setFullName(fullname = fullName);
      }
    }

    dispatch(shippingAddressForCart({ fullname, email, address, zipcode, city, state, country }));
    history.push('/confirm-order');
  };

  return (
    <section className="">
      <form className="admForm" onSubmit={submitHandler}>
        <div className="admForm__inner-container">
          {!isAuthenticated && (
            <div className="admForm__section">
              <div className="admForm__group">
                <label htmlFor="firstName" className="admForm__label">First name: </label>
                <input
                  type="text"
                  placeholder="Timothy"
                  className=""
                  name="firstName"
                  onChange={e => setFName(e.target.value)}
                  value={fName}
                  maxLength={60}
                  required
                />
              </div>
              <div className="admForm__group">
                <label htmlFor="lastName" className="admForm__label">Last Name: </label>
                <input
                  type="text"
                  placeholder="McDillin"
                  className=""
                  name="lastName"
                  onChange={e => setLName(e.target.value)}
                  value={lName}
                  maxLength={60}
                  required
                />
              </div>
              <div className="admForm__group">
                <label htmlFor="email" className="admForm__label">Last E-Mail: </label>
                <input
                  type="email"
                  placeholder="myemail@mail.com"
                  className=""
                  name="email"
                  onChange={e => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </div>
            </div>
          )}
          <div className="admForm__section">
            <div className="admForm__group">
              <label htmlFor="address" className="admForm__label">Primary Shipping Address: </label>
              <input
                type="text"
                placeholder="111 N. Broadway Str."
                className=""
                name="address"
                onChange={e => setAddress(e.target.value)}
                value={address}
                required
              />
            </div>
            <div className="admForm__group">
              <label htmlFor="zipcode" className="admForm__label">Zipcode: </label>
              <input
                type="text"
                placeholder="52103"
                className=""
                name="zipcode"
                minLength="2"
                maxLength="5"
                pattern='[0-9]*'
                onChange={e => setZipcode(e.target.value)}
                value={zipcode}
                required
              />
            </div>
          </div>
          <div className="admForm__section">
            <div className="admForm__group">
              <label htmlFor="city" className="admForm__label">City: </label>
              <input
                type="text"
                placeholder="Atlanta"
                className=""
                name="city"
                onChange={e => setCity(e.target.value)}
                value={city}
                required
              />
            </div>
            <div className="admForm__group">
              <label htmlFor="state" className="admForm__label">State: </label>
              <input
                type="text"
                placeholder="Georgia"
                className=""
                name="state"
                minLength="2"
                onChange={e => setState(e.target.value)}
                value={state}
                required
              />
            </div>
            <div className="admForm__group">
              <label htmlFor="country" className="admForm__label">Country: </label>
              <input
                type="text"
                placeholder="United States"
                className=""
                name="country"
                minLength="2"
                onChange={e => setCountry(e.target.value)}
                value={country}
                required
              />
            </div>
          </div>
        </div>
        <div className="admForm__section">
          <div className="admForm__submit-update">
            <input type="submit" className="btn btn-primary btn-full-width admForm__submit" value="Submit Shipping Info" />
          </div>
        </div>
      </form>
    </section>
  )
}
export default Shipping;