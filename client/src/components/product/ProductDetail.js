import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ReactStars from 'react-rating-stars-component';
import { listProductDetails } from '../../redux/actions/productActions';
import { addItemToCartGuest } from '../../redux/actions/cartActions';
import ReviewForm from '../review/ReviewForm';
import Review from '../review/Review';
import Spinner from '../layouts/Spinner';

const ProductDetail = () => {
  const { prod_id } = useParams();
  const dispatch = useDispatch();
  const productDetails = useSelector(state => state.product);
  const { loading, errors, productById } = productDetails;
  const [hasMounted, setHasMounted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  let initialQuantity;

  useEffect(() => {
    dispatch(listProductDetails(prod_id));
  }, [dispatch, prod_id]);  

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  if (productById) {
    initialQuantity = productById.productInfo.count_in_stock;
  }

  const addToCartHandler = () => {
    dispatch(addItemToCartGuest(prod_id, quantity));
  };
  const increaseQty = () => {
    if (quantity === initialQuantity) { return; }
    if (quantity > initialQuantity) {
      return setQuantity(quantity === initialQuantity);
    }
    setQuantity(quantity + 1);
  }
  const decreaseQty = () => {
    if (quantity === 1) { return; }
    if (quantity < 0) { return setQuantity(1); }
    setQuantity(quantity - 1);
  }

  return (
    <>
    {loading ? (
      <Spinner />
    ) : (
      <section className="product">
        <div className="product__title">
          <h2>{productById.productInfo.name}</h2>
        </div>
        <div className="product__details">
          <div className="product__image">
            <img className="product__img" src={productById.productInfo.product_image_url} alt="product view" />
          </div>
          <div className="product__info-sec">
            <div className="product__info">
              <div className="product__detail">
                <div className="product__price">$ {productById.productInfo.price}</div>
                <ReactStars
                  className="product__rating"
                  count={5}
                  size={18}
                  edit={false}
                  value={Number(productById?.productRating?.review)}
                  activeColor='#e4d023'
                />
                <div className="product__review">{productById.productReviews?.length} Reviews</div>
                {/* <div className="product__id">Product ID# {prod_id}</div> */}
                <div className="product__stock">
                  {productById.productInfo.count_in_stock > 0 ? `${productById.productInfo.count_in_stock} in stock` : 'Out of Stock'}
                </div>
              </div>
              <div className="product__qty-counter">
                <div className="product__qty-incrementor set-qty btn-left" onClick={decreaseQty}>
                  <span className="sign">-</span>
                </div>
                <div className="product__qty">
                  <input type="number" className="product__qty-input-count" value={quantity} readOnly/>
                </div>
                <div className="product__qty-incrementor set-qty btn-right" onClick={increaseQty}>
                  <span className="sign">+</span>
                </div>
              </div>
            </div>
            <div className="product__buttons">
              {productById.productInfo.count_in_stock > 0 ? (
                <>
                <div className="btn btn-cart-card btn-primary" onClick={() => addToCartHandler()}>Add to Cart</div>
                <Link to={`/cart`}>
                  <div className="btn btn-secondary">Go to Cart</div>
                </Link>
                </>
              ) : (
                <div className="btn btn-cart-card btn-primary">
                  <div>Out of Stock</div>
                </div>    
              )}
            </div>
          </div>
        </div>
        <div className="product__section">
          <div className="product__description">
            {productById.productInfo.description}
          </div>
          <ReviewForm prodId={prod_id} />
          <Review reviews={productById.productReviews} />
        </div>
      </section>
    )}
    </>
  )
}
export default ProductDetail;