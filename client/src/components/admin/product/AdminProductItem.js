import React from 'react';
import { Link } from 'react-router-dom';
import { FaRegEye } from 'react-icons/fa';

// id is image.id
const AdminProductItem = ({
  product: {
    id, name, product_image_url, brand, category, description, price, count_in_stock, created_at, review_avg, count, product_id
  }
}) => {
  return (
    <div className="admProdItem">
      <div className="admProdItem__list-item">
        <div className="admProdItem__image">
          <img className="admProdItem__img" src={product_image_url} alt="product view" />
        </div>
        <div className="admProdItem__detail">
          <div className="admProdItem__detail-set one">
            <div className="admProdItem__set sm">ID#: {product_id}</div>
            <div className="admProdItem__set md">{brand}</div>
            <div className="admProdItem__set md">{category}</div>
          </div>
          <div className="admProdItem__detail-set two">
            <div className="admProdItem__set ov-hd">{name}</div>
          </div>
          <div className="admProdItem__detail-set three">
            <div className="admProdItem__set">Reviews</div>
            <div className="admProdItem__set md">AVG: {review_avg}</div>
            <div className="admProdItem__set md">Count: {count}</div>
            <div className="admProdItem__set md">{created_at}</div>
          </div>
          <div className="admProdItem__detail-set four">
            <div className="admProdItem__set md">Stock Total: {count_in_stock}</div>
            <div className="admProdItem__set md">Grand Total: ${price}</div>
          </div>
          <div className="admProdItem__detail-set five">
            <Link to={`/admin/product/${product_id}/detail`}>
              <div className="btn btn-primary">
                <span className="detail-eye"><FaRegEye/> View</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdminProductItem;