import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCartGuest, resetCartOnProductDelete } from '../../redux/actions/cartActions';
import { getUserProfile } from '../../redux/actions/userActions'
import { setAlert } from '../../redux/actions/alertActions';
import { getAllProductIds } from '../../redux/actions/productActions';
import CartItem from '../../components/cart/CartItem';
import Spinner from '../layouts/Spinner';
import useClickOutside from '../../hooks/useClickOutside';

// TODO: considering implementation in future update.
const CartList = ({showCart, setShowCart, cartItems}) => {
// const CartList = forwardRef((props, ref)) => {
// const CartList = () => {
  // const { prod_id } = useParams();
  const sideBarRef = useRef();
  const dispatch = useDispatch();
  const history = useHistory();
  const userAuth = useSelector(state => state.auth);
  // const productDetails = useSelector(state => state.product);
  const cartDetails = useSelector(state => state.cart);
  const [hasMounted, setHasMounted] = useState(false);
  // const [showCart, setShowCart] = useState(false);
  // const [updatingCart, setUpdatingCart] = useState(true);
  const [updatingCart, setUpdatingCart] = useState(false);
  const { isAuthenticated } = userAuth;
  // let { productIds } = productDetails;
  // let { loading, cartItems, shippingAddress } = cartDetails;
  let { loading, shippingAddress } = cartDetails;
  let price = {};

  useClickOutside(sideBarRef, () => setShowCart(false));
  
  useEffect(() => {
    dispatch(getAllProductIds());

    // if (isAuthenticated) return dispatch(getCart());
    if (!isAuthenticated) return dispatch(getCartGuest());
    if (isAuthenticated) {
      dispatch(getUserProfile());
      return dispatch(getCartGuest()); 
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    setHasMounted(true);
  }, [dispatch]); 

  if (!hasMounted) {
    return null;
  }

  // ------------------------------------
  // check/compare states of cartItems and products. The purpose is to replace cart if products where removed from the shop, while such a process takes place, disable the checkout btn, so that the process may complete (work in process)
  // let match = [];
  // let currentLS = localStorage.getItem('__cart');
  // let currentLocalStorage;
  // if (currentLS) currentLocalStorage = JSON.parse(currentLS);
  // if (productIds?.length > 0 && cartItems?.length > 0 && hasMounted) {
  //   for(let i = 0; i < cartItems.length; i++) {
  //     for(let j = 0; j < productIds.length; j++) {
  //       if (cartItems[i].product.product_id === productIds[j].id) {
  //         match.push(cartItems[i]);
  //         break;
  //       }
  //     }
  //   };
  //   // setUpdatingCart(true);
  //   if (currentLocalStorage.length > 0) {
  //     if (match.length !== currentLocalStorage.length) {
  //       dispatch(resetCartOnProductDelete(match));
  //     };
  //   };
  //   // setUpdatingCart(false);
  // }

  // if (updatingCart) setUpdatingCart(false);
  // ------------------------------------
  const showCartHandler = () => {
    dispatch(setAlert(`Show Cart = ${showCart}`, 'success'));
    if (showCart) setShowCart(false);
  };

  const checkoutHandler = () => {
    // if (updatingCart) return;
    if (showCart) setShowCart(false);
    if (!isAuthenticated) {
      dispatch((setAlert('Please login / create account to continue with checkout.', 'danger')));
      return history.push('/login');
    }

    if (Object.keys(shippingAddress).length === 0 || !shippingAddress) {
      history.push("/shipping-address");
    } else {
      history.push("/payment");
    }
  };

  price.subTotal = cartItems.reduce((acc, item) => acc += item.product.price * item.qty, 0).toFixed(2);
  price.tax = Number(price.subTotal * 0.11).toFixed(2);
  price.shippingTotal = 
    price.subTotal < 50 && price.subTotal > 0.01 ? (
      3.00
    ) : price.subTotal > 50 && price.subTotal < 100 ? (
      Number(price.subTotal * 0.069).toFixed(2)
    ) : (
      0
    );
  price.grandTotal = (Number(price.subTotal) + Number(price.tax) + Number(price.shippingTotal)).toFixed(2);

  return loading ? (
    <Spinner />
  ) : (
    <section className={`cartLists ${showCart ? "expand" : ""}`} ref={sideBarRef}>
      <div className="cartLists__header">
        <h2 className="cartLists__title">Your Cart</h2>
        <div className="cartLists__total-items">{cartItems.reduce((qty, item) => Number(item.qty) + qty, 0)} Items</div>
        <div className="cartLists__close" onClick={() => showCartHandler()}><span>X</span></div>
      </div>
      <div className="cartLists__content">
        <div className="cartLists__list">
          {cartItems.length === 0 || !cartItems ? (
            <div className="">
              <div className="">Cart is Empty</div>
              <Link to="/shop">
                <div className="">
                  Continue Shopping
                </div>
              </Link>
            </div>
          ) : (
            cartItems.map((cart, i) => <CartItem cart={cart} key={i}/>)
          )}
        </div>
        <div className="cartLists__total">
          <h4 className="cartLists__total-header">Order Summary</h4>
          <div className="cartLists__totals">
            <div className="cartLists__subtotal">
              Sub-Total: $ {price.subTotal}
            </div>
            <div className="cartLists__tax-total">
              Tax: $ {price.tax}
            </div>
            <div className="cartLists__shipping-total">
              Shipping: $ {price.shippingTotal}
            </div>
            <div className="cartLists__grand-total">
              <span>Grand Total: </span>
              <span>$ {price.grandTotal}</span>
            </div>
            {cartItems.length !== 0 && updatingCart ? (
              <div className="cartLists__btn-checkout">
                Calculating
              </div>
            ) : (
              <div className="cartLists__btn-checkout" onClick={() => checkoutHandler()}>
                Checkout
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
export default CartList;