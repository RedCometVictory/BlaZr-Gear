import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfileAdmin } from '../../../redux/actions/userActions';
import AdminUserUpdate from './AdminUserUpdate';

const AdminUserDetail = () => {
  const { user_id } = useParams();
  const myRef = useRef();
  const dispatch = useDispatch();
  const userDetail = useSelector(state => state.user);
  const { loading, errors, userById } = userDetail;
  const [hasMounted, setHasMounted] = useState(false);
  const [confirmUpdate, setConfirmUpdate] = useState(false);

  useEffect(() => {
    dispatch(getUserProfileAdmin(user_id));
  }, [dispatch, user_id]);  

  useEffect(() => {
    if (confirmUpdate) {
      scrollToUpdateForm()
    }
  }, [confirmUpdate]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const scrollToUpdateForm = () => myRef.current.scrollIntoView({ behavior: 'smooth'});

  return (
    <>
    {loading ? (
      <div className="">Loading Information</div>
    ) : errors ? (
      <div className="">{errors}</div>
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
              <div className="admProductDetail__user-group">
                <div className="admProductDetail__user-label">
                  Current Role: 
                </div>
                <div className="admProductDetail__user-info">
                  {userById.userData.role}
                </div>
              </div>
            </div>
            <div className="admProductDetail__user-section">
              <div className="admProductDetail__btn-container user-item">
                {confirmUpdate ? (
                  <div className="btn btn-primary update-btn" onClick={() => setConfirmUpdate(false)}>
                    Cancel Update
                  </div>
                ) : (
                  <div className="btn btn-primary update-btn" onClick={() => setConfirmUpdate(true)}>
                    Update User
                  </div>
                )}
                <Link to='/admin/user-list'>
                  <div className="btn btn-primary update-btn">
                      Users List
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="admProductDetail__info-section three" ref={myRef}>
          {confirmUpdate && (
            <>
            <h2 className="info-header two">Update User Information</h2>
            <AdminUserUpdate stateChanger={setConfirmUpdate} />
            </>
          )}
        </div>
      </section>
    )}
    </>
  )
}
export default AdminUserDetail;