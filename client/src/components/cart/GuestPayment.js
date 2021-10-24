// TODO --- condiering getting rid of this page
import React, { useEffect, useState } from 'react';
import { Link, useHistory, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useStripe, useElements, Elements, ElementsConsumer, CardElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from 'axios';
import { setAlert } from '../../redux/actions/alertActions';
import { createOrder, payOrder } from '../../redux/actions/orderActions';
import { singleCharge } from '../../redux/actions/stripeActions';
// import CartItem from './CartItem';
// TODO need a cardsList component, it lists the available ccards that the user has used previously, also the user can delete cards from the list\

const Payment = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const stripe = useStripe();
  const elements = useElements();
  let description;

  // stripe.confirmcard
  const userAuth = useSelector(state => state.auth);
  const cartDetails = useSelector(state => state.cart);
  const orderDetails = useSelector(state => state.order);
  const paymentDetails = useSelector(state => state.stripe);
  const { userInfo } = userAuth;
  const { cartItems, shippingAddress, paymentMethod } = cartDetails;
  const { loading, errors, order } = orderDetails;
  const { intent, cards } = paymentDetails;
  const [hasMounted, setHasMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [guestCheckout, setGuestCheckout] = useState(true);
  const [chargeError, setChargeError] = useState();

  const stripePromise = loadStripe(`${process.env.REACT_APP_STRIPE_PUBLIC_KEY}`);

  // this variable is a placeholder
  // const customerStripeId = userInfo.stripeCustId;
  useEffect(() => {
    if (!paymentMethod) {
      console.log("Pyament: redirecting to confirm-order")
      dispatch(setAlert('Please confirm method of payment.', 'danger'));
      // return <Redirect to="/confirm-order" />
    }
  }, [dispatch]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  if (!shippingAddress.address || Object.keys(shippingAddress).length === 0 || !shippingAddress) {
    dispatch(setAlert('Please provide an shipping address. Primary address is considered shipping address.', 'danger'));
    console.log("Payment: redirecting to confirm-order")
    history.push("/shipping-address");
  }

  let price = {};
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
  console.log(userInfo)

  const orderFormData = {
    // itemsPrice: itemsPrice.toFixed(2),
    orderItems: cartItems,
    subTotal: price.subTotal,
    shippingPrice: price.shippingTotal,
    taxPrice: price.tax,
    totalPrice: price.grandTotal,
    shippingAddress: shippingAddress
  }

  const paymentData = {
    amount: Math.round(orderFormData.totalPrice * 100)
  };

  const cardStyle = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#32325d"
        }
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    }
  };

  // no saving card
  const guestCheck = () => {
    setGuestCheckout(true);
  };

  const orderPaymentHandler = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const { fullname, email, zipcode, address, city, state, country } = shippingAddress;
    let paymentResult;

    try {
      setIsProcessing(true);
      if (guestCheckout) {
        console.log("guest checkout");
        // paymentResult = await axios.post('/payment/single-checkout-charge');
        description = "Guest purchase. No card Saved.";
        paymentResult = dispatch(singleCharge(paymentData, description, orderFormData));
      }

      console.log("***********************")
      console.log("paymentResult");
      console.log(paymentResult);
      // TODO --- payment result may have to come from the stripestate
      // const clientSecret = paymentResult.data.client_secret;
      console.log("clientSecret");
      console.log(paymentResult);

      const card = elements.getElement(CardElement);
      const stripeResult = await stripe.createPaymentMethod({
        type: "card",
        card,
        billing_details: {
          name: fullname,
          email,
          address: {
            city,
            postal_code: zipcode,
            line1: address,
            state,
            country  // may remove
          }
        }
      })
// actvid
      if (stripeResult.error) {
        dispatch(setAlert(`Error: ${stripeResult.error}`, 'danger'));
        setIsProcessing(false);
        setChargeError(stripeResult.error);
      }

      // paymentInfo.id is saved as the stripe_payment_id
      if (stripeResult.paymentIntent.status === 'succeeded') {
        orderFormData.paymentInfo = {
          id: stripeResult.paymentIntent.id,
          status: stripeResult.paymentIntent.status
        }
      }

      // complete payment, connect intent w/pay method
      const finalPaymentResult = await stripe.confirmCardPayment(paymentResult.client_secret, {
        receipt_email: email,
        setup_future_usage: 'on_session',
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: fullname
          }
        }
      });

      // check for error or stsatus success
      // use for confirming payment from card that already exists, even if there is an error
      if (finalPaymentResult.error) {
        dispatch(setAlert(`${finalPaymentResult.error.message}`, 'danger'));
      }
      if (finalPaymentResult.paymentIntent.status === "succeeded") {
        dispatch(setAlert("Success. Payment complete!", 'danger'));
        // history.push('/shop');
      }

      dispatch(createOrder(orderFormData));
      isProcessing(false); // disables btn
      history.push('/success')
    } catch (err) {
      isProcessing(false); // disables btn
      dispatch(setAlert(`There was an issue in processing your payment. Error: ${err} Try again.`));
    }
  }

  return (
  <>
  {paymentMethod ? (
    <Elements stripe={stripePromise}>
      <ElementsConsumer>
        {({stripe, elements}) => (
          <form onSubmit={(e) => orderPaymentHandler(e)}>
            <div className="carts__header">
              <h2 className="carts__title">Make Payment</h2>
              <div className="carts__total-items">
                {cartItems.reduce((qty, item) => Number(item.qty) + qty, 0)} Items
              </div>
            </div>
            <div className="carts__header-information edit-btns">
              <div className="option">
                <Link to="/shipping-address">
                  <div className="btn btn-primary">
                    Edit Shipping
                  </div>
                </Link>
              </div>
              <div className="option">
                <Link to="/confirm-order">
                  <div className="btn btn-primary">
                    Edit Payment
                  </div>
                </Link>
              </div>
            </div>
            <div className="carts__header-information">
              <div className="carts__header-set flex-position-1">
                <h3>Shipping Information</h3>
                <div className="">Name: {shippingAddress.fullname}</div>
                <div className="">Shipping Address: {shippingAddress.address}</div>
                <div className="">
                  {`${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country}`}
                </div>
                <div className="">Zipcode: {shippingAddress.zipcode}</div>
              </div>
              <div className="carts__header-set flex-position-2">
                <h3>Payment Method</h3>
                <div className="">{paymentMethod}</div>
              </div>
            </div>
            <div className="carts__content">
              <div className="carts__list-content">
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
                  cartItems.map(cart => (
                    <div className="carts" key={cart.id}>
                      <div className="carts__list">
                        <div className="carts__list-item">
                          <div className="carts__image">
                            <img src={cart.product.product_image_url} alt="" className="carts__img" />
                          </div>
                          <div className="carts__detail">
                            <div className="carts__detail-name">
                              <h3 className="carts__item-name">
                                <Link to={`/product/${cart.product.id}`}>{cart.product.name}</Link>
                              </h3>
                            </div>
                            <div className="carts__detail-qty">
                              <div className="carts__item-price">
                                $ {cart.product.price}
                              </div>
                              <div className="carts__qty-counter">
                                <div className="carts__qty">
                                  <input type="number" className="carts__qty-input-count" value={cart.qty} readOnly/>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="carts__total">
                <h4 className="carts__total-header">Order Summary</h4>
                <div className="carts__totals">
                  <div className="carts__subtotal">
                    Sub-Total: $ {price.subTotal}
                  </div>
                  <div className="carts__tax-total">
                    Tax: $ {price.tax}
                  </div>
                  <div className="carts__shipping-total">
                    Shipping: $ {price.shippingTotal}
                  </div>
                  <div className="carts__grand-total">
                    <span>Grand Total: </span>
                    <span>$ {price.grandTotal}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="carts__pay-container">
              <div className="carts__card-elem">
                <CardElement options={cardStyle}></CardElement>
              </div>
              <div className="">
                <button className="carts__btn-checkout checkout btn btn-primary" disabled={!stripe || isProcessing}>
                  {isProcessing ? (
                    <div className="">Processing Payment</div>
                  ) : (
                    `Pay $${price.grandTotal}`
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </ElementsConsumer>
    </Elements>
  ) : (
    <Redirect to='/confirm-order'/>
  )}
  </>
  )  
}
export default Payment;