import React, { useEffect, useState, useRef } from 'react';
import { Link, useHistory, Redirect } from 'react-router-dom';
import api from '../../utils/api';
import { useDispatch, useSelector } from 'react-redux';
import { useStripe, useElements, Elements, ElementsConsumer, CardElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { setAlert } from '../../redux/actions/alertActions';
import { createOrder, payOrder } from '../../redux/actions/orderActions';
import { singleCharge, saveCardAndCharge, singleChargeCard, deleteCard } from '../../redux/actions/stripeActions';
// import CartItem from './CartItem';
// TODO need a cardsList component, it lists the available ccards that the user has used previously, also the user can delete cards from the list

const Payment = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const stripe = useStripe();
  const elements = useElements();
  let paypal = useRef();
  let description;

  const userAuth = useSelector(state => state.auth);
  const cartDetails = useSelector(state => state.cart);
  const orderDetails = useSelector(state => state.order);
  const paymentDetails = useSelector(state => state.stripe);
  const { isAuthenticated, userInfo } = userAuth;
  const { cartItems, shippingAddress, paymentMethod } = cartDetails;
  const { loading, errors, order } = orderDetails;
  const { cards, clientSecret } = paymentDetails;
  const [hasMounted, setHasMounted] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [guestCheckout, setGuestCheckout] = useState(true);
  const [addCardAndPay, setAddCardAndPay] = useState(false);
  const [singlePay, setSinglePay] = useState(false);
  const [chosenCard, setChosenCard] = useState('');
  const [chargeError, setChargeError] = useState();

  const stripePromise = loadStripe(`${process.env.REACT_APP_STRIPE_PUBLIC_KEY}`);
  // this variable is a placeholder
  // const customerStripeId = userInfo.stripeCustId;
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(setAlert('Please sign in to continue with payment.', 'danger'));
      history.push('/login');
    }
    if (!paymentMethod) {
      console.log("Pyament: redirecting to confirm-order")
      dispatch(setAlert('Please confirm method of payment.', 'danger'));
      // return <Redirect to="/confirm-order" />
    }
  }, [dispatch]);

  useEffect(() => {
    if (paymentMethod === 'PayPal' && hasMounted && !sdkReady) {
      setSdkReady(true);
      window.paypal.Buttons(
        {
          createOrder: function () {
            // return api.post('/payment/paypal-checkout', { cartItems})
            return fetch("http://localhost:5000/api/payment/paypal-checkout", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                cartItems
              }),
            })
            .then(res => {
              if (res.ok) {
                console.log("res")
                console.log(res)
                return res.json()
              }
              // if err, reject json
              return res.json().then(json => Promise.reject(json))
            })
            .then(({ id }) => {
              console.log("id");
              console.log(id);
              return id
            })
            .catch(e => {
              console.error(e.error)
            })
          },
          onApprove: function (data, actions) {
            // return actions.order.capture()
            return actions.order.capture()
              .then((orderData) => {
                // send paypal to ordercreate, there calc totals
                console.log("orderData");
                console.log(orderData);
                console.log("orderFomData");
                console.log(orderFormData);
                orderFormData.paymentInfo = {
                  id: orderData.id,
                  status: orderData.status,
                  orderType: "PayPal"
                }
                dispatch(createOrder(orderFormData));
                history.push('/success')
              })
          },
        }
      )
      .render("#paypal")
    }
  }, [paymentMethod, cartItems, hasMounted]);

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

  // confirm price totals securely client side
  const orderFormData = {
    orderItems: cartItems,
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
    setAddCardAndPay(false);
    setSinglePay(false);
  };
  // use saved card for payment
  const displaySavedCardsCheck = () => {
    setGuestCheckout(false);
    setAddCardAndPay(false);
    setSinglePay(true);
    if (!isAuthenticated) {
      dispatch(setAlert('Login to use card.', 'danger'));
      guestCheck();
    }
  };
  // add card to list w/payment
  const saveCardCheck = () => {
    setGuestCheckout(false);
    setAddCardAndPay(true);
    setSinglePay(false);
    if (!isAuthenticated) {
      dispatch(setAlert('Login to use card.', 'danger'));
      guestCheck();
    }
  };

  const successPayPalPaymentHandler = (paymentResult) => {
    console.log(paymentResult);
    // dispatch(payPayPalOrder(orderId, paymentResult));
  };

  const orderPaymentHandler = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const { fullname, email, zipcode, address, city, state, country } = shippingAddress;
    let paymentResult;

    try {
      setIsProcessing(true);
      // TODO --- pending payment type chosen, via usestate will direct which payment url to send data to. Such as a single payment (guest checkout), adding a card and then a payment charge, or charging a payment on a card already saved into the user's account.
      // TODO paymentResult generates the stripe_payment_id stored in the orders table for each order created. Use it, paymentResult.id, to generate refunds.
      // paymentResult = dispatch(payOrder(paymentData));
      //fi state is true
      if (guestCheckout && !addCardAndPay && !singlePay) {
        console.log("guest checkout");
        // paymentResult = await axios.post('/payment/single-checkout-charge');
        description = "Guest purchase. No card Saved.";
        paymentResult = dispatch(singleCharge(paymentData, description, orderFormData));
      }
      if (addCardAndPay && !guestCheckout && singlePay) {
        console.log("add card and pay");
        if (!isAuthenticated) {
          dispatch(setAlert('Login or create account in order to save card and complete order.','danger'));
          history.push('/login');
        }
        // paymentResult = await axios.post('/payment/save-and-charge');
        description = "Card saved. Single purchase.";
        paymentResult = dispatch(saveCardAndCharge(paymentData, description, orderFormData));
      }
      if (singlePay && !guestCheckout && !addCardAndPay) {
        console.log("charge existing card");
        if (!isAuthenticated) {
          dispatch(setAlert('Login or create account in order to save card and complete order.','danger'));
          history.push('/login');
        }
        // paymentResult = await axios.post('/payment/checkout-charge-card');
        description = "Purchase made with saved card.";
        paymentResult = dispatch(singleChargeCard(chosenCard, paymentData, description, orderFormData));
      }
      console.log("***********************")
      console.log("paymentResult");
      console.log(paymentResult);
      if (!paymentResult) {
        console.log("Error: failed to create intent.")
        return;
      }
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
          status: stripeResult.paymentIntent.status,
          orderType: "Stripe"
        }
      }

      // add new card to owned cards list
      // client secret from payment intent
      // const addCardToCustomerHandler = async (e) => {
      //   // let addedCards = await stripe.confirmCardSetup(setUpIntent.userInfo.stripeCustId, {
      //   let addedCards = await stripe.confirmCardSetup(clientSecret, {
      //     payment_method: {
      //       card: card,
      //       billing_detail: { email: email }
      //     }
      //   });
      // };

      // complete payment, connect intent w/pay method
      const finalPaymentResult = await stripe.confirmCardPayment(clientSecret, {
      // payment_method: stripeResult.paymentMethod.id
      // const finalPaymentResult = await stripe.confirmCardPayment(paymentResult.client_secret, {
      // const finalPaymentResult = await stripe.confirmCardPayment(paymentResult, {
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

      /*
      const orderFormData = {
        orderItems: cartItems,
        shippingAddress: shippingAddress,
        paymentInfo = {
              id: stripeResult.paymentIntent.id, // payment method
              status: stripeResult.paymentIntent.status
        }
      }
      */
      
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
      {/* <ElementsConsumer> */}
        {/* {({stripe, elements}) => ( */}
          <form onSubmit={(e) => orderPaymentHandler(e)}>
            <div className="carts__header">
              <h2 className="carts__title">Make Payment</h2>
              <div className="carts__total-items">
                {cartItems.reduce((qty, item) => Number(item.qty) + qty, 0)} Items
              </div>
            </div>
            {isAuthenticated && (
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
            )}
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
              {/* {isAuthenticated && (
                <div className="carts__header-set flex-position-3">
                  
                </div>
              )} */}
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
              <div className="carts__total pay-screen">
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
              {isAuthenticated && paymentMethod === 'Stripe' && (
                <div className="carts__set-card">
                  <div className="carts__card-setting">
                    <label htmlFor="cardChoice">
                      Don't Save Card
                    </label>
                    <input
                      type="radio"
                      id="cardChoice"
                      name="paymentMethod"
                      className=""
                      onChange={() => guestCheck()}
                      // value=""
                      checked={guestCheckout}
                      required
                    />
                  </div>
                  <div className="carts__card-setting">
                    <label htmlFor="cardChoice">
                      Use Saved Card
                    </label>
                    <input
                      type="radio"
                      id="cardChoice"
                      name="paymentMethod"
                      className=""
                      onChange={() => displaySavedCardsCheck()}
                      // value=""
                      checked={singlePay}
                      required
                    />
                  </div>
                  <div className="carts__card-setting">
                    <label htmlFor="cardChoice">
                      Save Card
                    </label>
                    <input
                      type="radio"
                      id="cardChoice"
                      name="paymentMethod"
                      className=""
                      onChange={() => saveCardCheck()}
                      // value=""
                      checked={addCardAndPay}
                      required
                    />
                  </div>
                </div>
              )}
              <div className="carts__card-list-container">
                {!singlePay ? (
                  <></>
                ) : cards.length > 0 ? (
                  <>
                  <h3>Cards:</h3>
                  <ul className="carts__card-list">
                  {cards.map((indivCard, index) => (
                    <li className="carts__card-list-item" key={index}>
                      <div className="carts__card-name">
                        {indivCard.brand}
                      </div>
                      <div className="carts__card-digits">
                        {indivCard.last4}
                      </div>
                      <div className="carts__card-choice" onClick={() => setChosenCard(indivCard)}>Use Card</div>
                      <div className="carts__card-choice" onClick={() => dispatch(deleteCard(indivCard.id))}>Remove</div>
                    </li>
                  ))}
                  </ul>
                  </>
                ) : (
                  <div className="">No cards found.</div>
                )}
              </div>
              <div className="carts__card-elem">
                <>
                {paymentMethod === 'Stripe' ? (
                  <CardElement options={cardStyle}></CardElement>
                ) : (
                  <>
                  <div className="carts__pay-display">
                    Pay ${price.grandTotal}
                  </div>
                  <div className="carts__paypal-container">
                    <div id="paypal"></div>
                  </div>
                  </>
                )}
                </>
              </div>
              {paymentMethod === 'Stripe' ? (
                <div className="">
                  <button className="carts__btn-checkout checkout btn btn-primary" type="submit" disabled={!stripe || isProcessing || sdkReady}>
                  {isProcessing ? (
                    <div className="">Processing Payment</div>
                  ) : (
                    `Pay $${price.grandTotal}`
                  )}
                  </button>
                </div>
              ) : (
                <></>
              )}
            </div>
          </form>
        {/* )} */}
      {/* </ElementsConsumer> */}
    </Elements>
  ) : (
    <Redirect to='/confirm-order'/>
  )}
  </>
  )  
}
export default Payment;