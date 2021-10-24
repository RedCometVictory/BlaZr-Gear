import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactStars from 'react-rating-stars-component';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCartGuest } from '../../redux/actions/cartActions';

// Product Card
// id refers to img id
const ProductItem = ({
  product: {
    id, name, product_image_url,
    brand, category, description,
    price, review_avg, count, product_id
  }
}) => {
  const dispatch = useDispatch();
  const userAuth = useSelector(state => state.auth);
  const cartDetails = useSelector(state => state.cart);
  const { cartItems } = cartDetails;
  const [itemInCart, setItemInCart] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { isAuthenticated } = userAuth;

  useEffect(() => {
    let inCart = cartItems.find(item => item.product.id === id);
    if (!inCart) return setItemInCart(false);
    if (inCart) return setItemInCart(true);
  }, [id, cartItems]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const addToCart = (prod_id, qty = 1, cartItems) => {
    if (!isAuthenticated) {
      dispatch(addItemToCartGuest(prod_id, qty));
      // console.log("guest: checking if item is in cart")
      // itemIsInCart(prod_id, cartItems)
    }
    if (isAuthenticated) {
      dispatch(addItemToCartGuest(prod_id, qty));
      // dispatch(addItemToCart(prod_id, qty));
      // itemIsInCart(prod_id, cartItems)
    }
  };

  return (
    <article className="products__card">
      <div className="products__image-cont">
        <Link to={`/product/${product_id}`}>
          <img src={product_image_url} className="products__img" alt="product goes here"/>
        </Link>
      </div>
      <div className="products__card-title">
        <h3 className="products__title">
          <Link to={`/product/${product_id}`}>
            {name}
          </Link>
        </h3>
      </div>
      <div className="products__card-body">
        <div className="products__card-info">
          <ReactStars
            count={5}
            size={18}
            edit={false}
            value={Number(review_avg)}
            activeColor='#e4d023'
            className='products__ratings'
          />
          <div className="products__review-count">Total Reviews: {count}</div>
          <div className="products_price">$ {price}</div>
        </div>
        <div className="products__buttons">
          {!itemInCart ? (
            <div
            className="btn btn-cart-card btn-primary"
            onClick={() => addToCart(product_id, 1)}
            >
              Add to Cart
            </div>
          ) : (
            <Link to="/cart">
              <div className="btn btn-cart-card btn-primary">Go to Cart</div>
            </Link>
          )}
          <Link to={`/product/${product_id}`}>
            <div className="btn btn-secondary">View Details</div>
          </Link>
        </div>
      </div>
    </article>
  )
}
export default ProductItem;