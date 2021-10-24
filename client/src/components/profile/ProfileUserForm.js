import React, { useState, useEffect } from 'react';
// import Spinner from '../../layouts/Spinner';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserInfo } from '../../redux/actions/userActions';

const initialState = {f_name: '', l_name: '', username: '', user_email: ''};

const ProfileUserForm = ({stateChanger}) => {
  const dispatch = useDispatch();
  const userDetail = useSelector(state => state.user);
  const { loading, userById } = userDetail;
  const [hasMounted, setHasMounted] = useState(false);
  const [formUserData, setFormUserData] = useState(initialState);

  useEffect(() =>{
    setFormUserData({
      f_name: loading || !userById ? '' : userById.userData.f_name,
      l_name: loading || !userById ? '' : userById.userData.l_name,
      username: loading || !userById ? '' : userById.userData.username,
      user_email: loading || !userById ? '' : userById.userData.user_email
    });
  }, [dispatch, loading, userById]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const { f_name, l_name, username, user_email } = formUserData;

  const onChange = e => setFormUserData({ ...formUserData, [e.target.name]: e.target.value });

  const onSubmit = e => {
    e.preventDefault();
    dispatch(updateUserInfo(formUserData))
    stateChanger(false);
  }

  return (
    <>
    {loading ? (
      <div className="">Loading update page...</div>
    ) : (
      <section className="">
        <form className="admForm" onSubmit={onSubmit} >
          <div className="admForm__inner-container">
            <div className="admForm__section">
              <div className="admForm__group">
                <label htmlFor="f_name" className="admForm__label">First Name: </label>
                <input
                  type="text"
                  placeholder="Jose"
                  className=""
                  name="f_name"
                  onChange={e => onChange(e)}
                  value={f_name}
                  required
                />
              </div>
              <div className="admForm__group">
                <label htmlFor="l_name" className="admForm__label">Last Name: </label>
                <input
                  type="text"
                  placeholder="Henriquez"
                  className=""
                  name="l_name"
                  onChange={e => onChange(e)}
                  value={l_name}
                  required
                />
              </div>
            </div>
            <div className="admForm__section">
              <div className="admForm__group">
                <label htmlFor="username" className="admForm__label">Username: </label>
                <input
                  type="text"
                  placeholder="JollyRancher11"
                  className=""
                  name="username"
                  onChange={e => onChange(e)}
                  value={username}
                  required
                />
              </div>
              <div className="admForm__group">
                <label htmlFor="user_email" className="admForm__label">E-mail: </label>
                <input
                  type="text"
                  placeholder="myemail@mail.com"
                  className=""
                  name="user_email"
                  onChange={e => onChange(e)}
                  value={user_email}
                  required
                />
              </div>
            </div>
          </div>
          <div className="admForm__section">
            <div className="admForm__submit-update">
              <input type="submit" className="btn btn-primary btn-full-width admForm__submit" value="Update User Info" />
            </div>
          </div>
        </form>
      </section>
    )}
    </>
  )
}
export default ProfileUserForm;