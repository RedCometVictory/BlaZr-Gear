import React, { useState, useEffect } from 'react';
// import Spinner from '../../layouts/Spinner';
import { useDispatch, useSelector } from 'react-redux';
import { createUserProfile, updateUserProfile } from '../../redux/actions/userActions';
import { shippingAddressForCart } from '../../redux/actions/cartActions';
import Spinner from '../layouts/Spinner';

const initialState = {address: '', address2: '', phone: '', city: '', state: '', country: '', zipcode: '', company: ''};

const ProfileUserForm = ({stateChanger}) => {
  const dispatch = useDispatch();
  const userDetail = useSelector(state => state.user);
  const { loading, errors, userById } = userDetail;
  const [hasMounted, setHasMounted] = useState(false);
  const [formUserData, setFormUserData] = useState(initialState);

  // if !myProfileInfo then create a profile instead
  useEffect(() =>{
    if (userById.myProfileInfo) {
      setFormUserData({
        address: loading || !userById ? '' : userById.myProfileInfo.address,
        address2: loading || !userById ? '' : userById.myProfileInfo.address2,
        phone: loading || !userById ? '' : userById.myProfileInfo.phone,
        city: loading || !userById ? '' : userById.myProfileInfo.city,
        state: loading || !userById ? '' : userById.myProfileInfo.state,
        country: loading || !userById ? '' : userById.myProfileInfo.country,
        zipcode: loading || !userById ? '' : userById.myProfileInfo.zipcode,
        company: loading || !userById ? '' : userById.myProfileInfo.company
      });
    }
  }, [dispatch, loading]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const { address, address2, phone, city, state, country, zipcode, company } = formUserData;

  const onChange = e => setFormUserData({ ...formUserData, [e.target.name]: e.target.value });

  const onSubmitCreateHandler = e => {
    e.preventDefault();
    if (userById.userData.f_name && userById.userData.l_name) {
      let fullname = `${userById.userData.f_name} ${userById.userData.l_name}`;
      let email = userById.userData.user_email;
      dispatch(shippingAddressForCart({ fullname, email,address, zipcode, city, state, country }));
    };
    dispatch(createUserProfile(formUserData));
    stateChanger(false);
  }

  const onSubmitUpdateHandler = e => {
    e.preventDefault();
    
    if (userById.userData.f_name && userById.userData.l_name) {
      let fullname = `${userById.userData.f_name} ${userById.userData.l_name}`;
      let email = userById.userData.user_email;
      dispatch(shippingAddressForCart({ fullname, email,address, zipcode, city, state, country }));
    };
    
    dispatch(updateUserProfile(formUserData));
    stateChanger(false);
  }

  return (
    <>
    {loading ? (
      <Spinner />
    ) : (
      <section className="">
        <form className="admForm" onSubmit={userById.myProfileInfo && userById.myProfileInfo.user_id === userById.userData?.id ? (onSubmitUpdateHandler) : (onSubmitCreateHandler)} >
          <div className="admForm__inner-container">
            <div className="admForm__section">
              <div className="admForm__group">
                <label htmlFor="address" className="admForm__label">Primary Shipping Address: </label>
                <input
                  type="text"
                  placeholder="111 N. Broadway Str."
                  className=""
                  name="address"
                  onChange={e => onChange(e)}
                  value={address}
                  required
                />
              </div>
              <div className="admForm__group">
                <label htmlFor="address2" className="admForm__label">Shipping Addr. 2 (Optional): </label>
                <input
                  type="text"
                  placeholder="3400 W. Allburn Ave."
                  className=""
                  name="address2"
                  onChange={e => onChange(e)}
                  value={address2}
                />
              </div>
            </div>
            <div className="admForm__section">
              <div className="admForm__group">
                <label htmlFor="phone" className="admForm__label">Phone: </label>
                <input
                  type="tel"
                  placeholder="1112345678"
                  className=""
                  name="phone"
                  onChange={e => onChange(e)}
                  value={phone}
                  minLength="10"
                  maxLength="10"
                  // pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
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
                  onChange={e => onChange(e)}
                  value={zipcode}
                  required
                />
              </div>
              <div className="admForm__group">
                <label htmlFor="company" className="admForm__label">Company (Optional): </label>
                <input
                  type="text"
                  placeholder="Company Name"
                  className=""
                  name="company"
                  onChange={e => onChange(e)}
                  value={company}
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
                  onChange={e => onChange(e)}
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
                  onChange={e => onChange(e)}
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
                  onChange={e => onChange(e)}
                  value={country}
                  required
                />
              </div>
            </div>
          </div>
          {userById.myProfileInfo && userById.myProfileInfo?.user_id === userById.userData.id ? (
            <div className="admForm__section">
              <div className="admForm__submit-update">
                <input type="submit" className="btn btn-primary btn-full-width admForm__submit" value="Update Profile" />
              </div>
            </div>
          ) : (
            <div className="admForm__section">
              <div className="admForm__submit-update">
                <input type="submit" className="btn btn-primary btn-full-width admForm__submit" value="Create Profile" />
              </div>
            </div>
          )}
        </form>
      </section>
    )}
    </>
  )
}
export default ProfileUserForm;