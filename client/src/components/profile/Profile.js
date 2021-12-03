import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile } from '../../redux/actions/userActions';
import ProfileUserForm from './ProfileUserForm';
import ProfileForm from './ProfileForm';
import Spinner from '../layouts/Spinner';

const Profile = () => {
  // const { user_id } = useParams();
  const myRef = useRef();
  const dispatch = useDispatch();
  const userDetail = useSelector(state => state.user);
  const { loading, userById } = userDetail;
  const [hasMounted, setHasMounted] = useState(false);
  const [confirmUserUpdate, setConfirmUserUpdate] = useState(false);
  const [confirmProfileCreate, setConfirmProfileCreate] = useState(false);
  const [confirmProfileUpdate, setConfirmProfileUpdate] = useState(false);

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);  

  useEffect(() => {
    if (confirmUserUpdate) {
      scrollToUpdateForm()
    }
    if (confirmProfileCreate) {
      scrollToUpdateForm()
    }
    if (confirmProfileUpdate) {
      scrollToUpdateForm()
    }
  }, [confirmUserUpdate, confirmProfileCreate, confirmProfileUpdate]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const scrollToUpdateForm = () => myRef.current.scrollIntoView({ behavior: 'smooth'});

  const userUpdateHandler = (value) => {
    if (value) {
      setConfirmProfileCreate(false)
      setConfirmProfileUpdate(false)
      setConfirmUserUpdate(true)
    } else {
      setConfirmProfileCreate(false)
      setConfirmProfileUpdate(false)
      setConfirmUserUpdate(false)
    }
  };
  
  const profileCreateHandler = (value) => {
    if (value) {
      setConfirmUserUpdate(false)
      setConfirmProfileCreate(true)
    } else {
      setConfirmUserUpdate(false)
      setConfirmProfileCreate(false)
    }
  };
  
  const profileUpdateHandler = (value) => {
    if (value) {
      setConfirmUserUpdate(false)
      setConfirmProfileUpdate(true)
    } else {
      setConfirmUserUpdate(false)
      setConfirmProfileUpdate(false)
    }
  };

  return (
    <>
    {loading ? (
      <Spinner />
    ) : (
      <section className="admProductDetail">
        <div className="admProductDetail__title">
          <h2>User Information</h2>
        </div>
        <div className="admProductDetail__details">
          <div className="admProductDetail__user">
            <div className="admProductDetail__user-section">
              <div className="admProductDetail__user-group">
                <div className="admProductDetail__user-label">
                  ID#: 
                </div>
                <div className="admProductDetail__user-info">
                  {userById.userData.id}
                </div>
              </div>
              <div className="admProductDetail__user-group">
                <div className="admProductDetail__user-label">
                  Username: 
                </div>
                <div className="admProductDetail__user-info">
                  {userById.userData.username}
                </div>
              </div>
              <div className="admProductDetail__user-group">
                <div className="admProductDetail__user-label">
                  Full Name:  
                </div>
                <div className="admProductDetail__user-info">
                  {userById.userData.f_name} {userById.userData?.l_name}
                </div>
              </div>
            </div>
            <div className="admProductDetail__user-section">
              <div className="admProductDetail__user-group">
                <div className="admProductDetail__user-label">
                  Joined: 
                </div>
                <div className="admProductDetail__user-info">
                  {userById.userData.created_at}
                </div>
              </div>
              <div className="admProductDetail__user-group">
                <div className="admProductDetail__user-label">
                  Email: 
                </div>
                <div className="admProductDetail__user-info">
                  {userById.userData.user_email}
                </div>
              </div>
            </div>
            <div className="admProductDetail__user-section">
              <div className="admProductDetail__btn-container user-item">
                {confirmUserUpdate ? (
                  <div className="btn btn-primary update-btn" onClick={() => userUpdateHandler(false)}>
                    Cancel Update
                  </div>
                ) : (
                  <div className="btn btn-primary update-btn" onClick={() => userUpdateHandler(true)}>
                    Update User
                  </div>
                )}
                {userById.myProfileInfo && !confirmProfileUpdate ? (
                  <div className="btn btn-primary update-btn" onClick={() => profileUpdateHandler(true)}>
                    Update Profile
                  </div>
                ) : userById.myProfileInfo && confirmProfileUpdate ? (
                  <div className="btn btn-primary update-btn" onClick={() => profileUpdateHandler(false)}>
                    Cancel Update
                  </div>
                ) : !confirmProfileCreate ? (
                  <div className="btn btn-primary update-btn" onClick={() => profileCreateHandler(true)}>
                    Create Profile
                  </div>
                ) : (
                  <div className="btn btn-primary update-btn" onClick={() => profileCreateHandler(false)}>
                    Cancel Create
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="admProductDetail__info-section three" ref={myRef}>
          {confirmUserUpdate && (
            <>
            <h2 className="info-header two">Update User Information</h2>
            <ProfileUserForm stateChanger={setConfirmUserUpdate} />
            </>
          )}
          {confirmProfileCreate && (
            <>
            <h2 className="info-header two">Create Profile</h2>
            <ProfileForm stateChanger={setConfirmProfileCreate} />
            </>
          )}
          {confirmProfileUpdate && (
            <>
            <h2 className="info-header two">Update Profile Information</h2>
            <ProfileForm stateChanger={setConfirmProfileUpdate} />
            </>
          )}
        </div>
      </section>
    )}
    </>
  )
}
export default Profile;