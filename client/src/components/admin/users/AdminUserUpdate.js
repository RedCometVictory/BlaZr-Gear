import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserAdmin } from '../../../redux/actions/userActions';
import Spinner from '../../layouts/Spinner';

const initialState = {f_name: '', l_name: '', username: '', user_email: '', role: ''};

const AdminUserUpdate = ({stateChanger}) => {
  const { user_id } = useParams();
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
      user_email: loading || !userById ? '' : userById.userData.user_email,
      role: loading || !userById ? '' : userById.userData.role
    });
  }, [dispatch, loading]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const { f_name, l_name, username, user_email, role } = formUserData;

  const onChange = e => setFormUserData({ ...formUserData, [e.target.name]: e.target.value });

  const onSubmit = e => {
    e.preventDefault();
    dispatch(updateUserAdmin(user_id, formUserData))
    stateChanger(false);
  }

  return loading ? (
    <Spinner />
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
              />
            </div>
          </div>
          <div className="admForm__section">
            <div className="admForm__group">
              <label htmlFor="role" className="admForm__label">User Role: </label>
              <select name="role" value={role} onChange={e => onChange(e)}>
                <option value="visitor">Visitor</option>
                <option value="banned">Banned</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>
        </div>
        <div className="admForm__section">
          <div className="admForm__submit-update">
            <input type="submit" className="btn btn-primary btn-full-width admForm__submit" value="Submit Profile Update" />
          </div>
        </div>
      </form>
    </section>
  )
}
export default AdminUserUpdate;