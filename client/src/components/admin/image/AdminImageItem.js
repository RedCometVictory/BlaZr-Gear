import React from 'react';
import { Link } from 'react-router-dom';

const AdminImageItem = ({
  image: {
    id, product_image_url, product_image_filename, product_id, created_at
  }
}) => {
  return (
    <div className="admImage__tile">
      <div className="admImage__list-item">
        <div className="admImage__image">
          <img className="admImage__img" src={product_image_url} alt="product view" />
        </div>
        <div className="admImage__view">
          <Link to={`/admin/image/${id}/detail`}>
            <div className="btn btn-primary view-btn">
              <span className="detail-eye">View</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
export default AdminImageItem;