import React from 'react';
import { Link } from 'react-router-dom';
import { FaRegEye } from 'react-icons/fa';

const AdminSlideItem = ({
  slide: {
    id, title, image_url, description, theme, category, created_at
  }
}) => {
  return (
    <div className="admProdItem">
      <div className="admProdItem__list-item">
        <div className="admProdItem__image">
          <img className="admProdItem__img" src={image_url} alt="product view" />
        </div>
        <div className="admProdItem__detail slide-item">
          <div className="admProdItem__detail-set one slide-item">
            <div className="admProdItem__set sm">ID#: {id}</div>
            <div className="admProdItem__set md">{category}</div>
          </div>
          <div className="admProdItem__detail-set two slide-item">
            <div className="admProdItem__set ov-hd">
              {title ? (
                <div className="">{title}</div>
              ) : (
                <div className="">No Title</div>
              )}
            </div>
          </div>
          <div className="admProdItem__detail-set three slide-item">
            <div className="admProdItem__set">Created On: </div>
            <div className="admProdItem__set md">{created_at}</div>
          </div>
          <div className="admProdItem__detail-set four slide-item">
          </div>
          <div className="admProdItem__detail-set five slide-item">
            <Link to={`/admin/slide/${id}/detail`}>
              <div className="admProdItem__view-btn">
                <div className="btn btn-primary">
                  <span className="detail-eye"><FaRegEye/> View</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdminSlideItem;