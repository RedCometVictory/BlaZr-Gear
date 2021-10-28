import React from 'react';
import { Link } from 'react-router-dom';
import { FaRegEye } from 'react-icons/fa';

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
        {/* <div className="admImage__detail">
          <div className="admImage__detail-set one">
            <div className="admImage__set sm">ID#: {id}</div>
            <div className="admImage__set md">{product_image_filename}</div>
          </div>
          <div className="admImage__detail-set two">
            <div className="admImage__set ov-hd">
              {product_id ? (
                <div className="">Product ID#: {product_id}</div>
              ) : (
                <div className="">No Product Id</div>
              )}
            </div>
          </div>
          <div className="admImage__detail-set three">
            <div className="admImage__set">Created On: </div>
            <div className="admImage__set md">{created_at}</div>
          </div>
          <div className="admImage__detail-set four">
          </div>
        </div> */}
      </div>
    </div>
  )
}
export default AdminImageItem;

/*
<div className="admProdItem">
      <div className="admProdItem__list-item">
        <div className="admProdItem__image">
          <img className="admProdItem__img" src={product_image_url} alt="product view" />
        </div>
        <div className="admProdItem__detail">
          <div className="admProdItem__detail-set one">
            <div className="admProdItem__set sm">ID#: {id}</div>
            <div className="admProdItem__set md">{product_image_filename}</div>
          </div>
          <div className="admProdItem__detail-set two">
            <div className="admProdItem__set ov-hd">
              {product_id ? (
                <div className="">Product ID#: {product_id}</div>
              ) : (
                <div className="">No Product Id</div>
              )}
            </div>
          </div>
          <div className="admProdItem__detail-set three">
            <div className="admProdItem__set">Created On: </div>
            <div className="admProdItem__set md">{created_at}</div>
          </div>
          <div className="admProdItem__detail-set four">
          </div>
          <div className="admProdItem__detail-set five">
            <Link to={`/admin/image/${id}/detail`}>
              <div className="btn btn-primary">
                <span className="detail-eye"><FaRegEye/> View</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
*/