import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItemToCartGuest, removeFromCartGuest } from '../../redux/actions/cartActions';

const CartItem = ({
  cart: {
    qty,
    product: {
      id, name, price, count_in_stock, product_image_url, product_id
    }
  }
}) => {
  const dispatch = useDispatch();
  const [hasMounted, setHasMounted] = useState(false);
  
  let stockQuantity = count_in_stock;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const increaseQty = (prod_id, currQuantity) => {
    if (qty === stockQuantity) return;
    if (qty > stockQuantity) return qty === stockQuantity;
    const newQty = currQuantity + 1;
    dispatch(addItemToCartGuest(prod_id, newQty));
  }
  const decreaseQty = (prod_id, currQuantity) => {
    if (qty <= 1) return qty === 1;
    const newQty = currQuantity - 1;
    dispatch(addItemToCartGuest(prod_id, newQty));
  }

  const deleteItemFromCartHandler = () => {
    dispatch(removeFromCartGuest(id));
  };

  return (
    <div className="cart">
      <div className="cart__list">
        <div className="cart__list-item">
          <div className="cart__image">
            <img src={product_image_url} alt="" className="cart__img" />
          </div>
          <div className="cart__detail">
            <div className="cart__detail-name">
              <h3 className="cart__item-name">
                <Link to={`/product/${product_id}`}>{name}</Link>
              </h3>
            </div>
            <div className="cart__detail-qty">
              <div className="cart__item-price">
                $ {price}
              </div>
              <div className="cart__qty-counter">
                <div className="cart__qty-incrementor btn-qty" onClick={() => decreaseQty(product_id, qty)}>
                  <span className="sign">-</span>
                </div>
                <div className="cart__qty">
                  <input type="number" className="cart__qty-input-count" value={qty} readOnly/>
                </div>
                <div className="cart__qty-incrementor btn-qty" onClick={() => increaseQty(product_id, qty)}>
                  <span className="sign">+</span>
                </div>
              </div>
              <div className="cart__btn-remove" onClick={() => deleteItemFromCartHandler()}>X</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default CartItem;