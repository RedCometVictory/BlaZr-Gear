import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsersAdmin } from '../../../redux/actions/userActions';
import AdminUserItem from './AdminUserItem';

const AdminUserList = () => {
  const dispatch = useDispatch();
  const usersDetail = useSelector(state => state.user);
  const { loading, errors, users } = usersDetail;
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    dispatch(getUsersAdmin())
  }, [dispatch]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <>
    {loading ? (
      <div className="">Loading Info</div>
    ) : errors ? (
      <div className="">{errors}</div>
    ) : (
      <section className="admProducts">
        <div className="admProducts__header">
          <h2 className="admProducts__title">Users</h2>
          <div className="admProducts__header-options">
            <div className="admProducts__total-items">
              {users.length} Users
            </div>
          </div>
        </div>
        <div className="admProducts__content">
          <div className="admProducts__list">
            {users.map(user => (
              <AdminUserItem key={user.id} user={user} />
            ))}
          </div>
        </div>
      </section>
    )}
    </>
  )
}
export default AdminUserList;