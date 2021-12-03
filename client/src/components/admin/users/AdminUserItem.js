import React from 'react';
import { Link } from 'react-router-dom';

const AdminUserItem = ({
  user: {
    id, f_name, l_name, user_email, username, role, created_at
  }
}) => {
  return (
    <div className="admProdItem">
      <div className="admProdItem__list-item user-item">
        <div className="admProdItem__detail user-item">
          <div className="admProdItem__detail-set one user-item">
            <h3>{username}</h3>
            <div className="admProdItem__set sm">{created_at}</div>
          </div>
          <div className="admProdItem__detail-set two user-item">
            <div className="admProdItem__set">{f_name} {l_name}</div>
          </div>
          <div className="admProdItem__detail-set three user-item">
            <div className="admProdItem__set md">{user_email}</div>
          </div>
          <div className="admProdItem__detail-set four user-item">
            <div className="admProdItem__set ov-hd">{role}</div>
          </div>
          <div className="admProdItem__detail-set five user-item">
            <Link to={`/admin/user/${id}`}>
              <div className="btn btn-primary">
                View
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdminUserItem;