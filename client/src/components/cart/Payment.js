import React, { useEffect, useState, useRef } from 'react';
import { Link, useHistory, Redirect } from 'react-router-dom';
import api from '../../utils/api';
import { useDispatch, useSelector } from 'react-redux';
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { setAlert } from '../../redux/actions/alertActions';
import { createOrder } from '../../redux/actions/orderActions';
import CardSelect from '../layouts/CardSelect';

const Payment = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const stripe = useStripe();
  const elements = useElements();
  // let paypalRef = useRef();
  let description;

  const userAuth = useSelector(state => state.auth);
  const cartDetails = useSelector(state => state.cart);
  const paymentDetails = useSelector(state => state.stripe);
  const { isAuthenticated, userInfo } = userAuth;
  const { cartItems, shippingAddress, paymentMethod } = cartDetails;
  const { cardToUse } = paymentDetails;
  const [hasMounted, setHasMounted] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [guestCheckout, setGuestCheckout] = useState(true);
  const [addCardAndPay, setAddCardAndPay] = useState(false);
  const [singlePay, setSinglePay] = useState(false);
  let [chargeError, setChargeError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(setAlert('Please sign in to continue with payment.', 'danger'));
      history.push('/login');
    }
    if (!paymentMethod) {
      console.log("Payment: redirecting to confirm-order")
      dispatch(setAlert('Please confirm method of payment.', 'danger'));
      // return <Redirect to="/confirm-order" />
    }
  }, [dispatch]);

  // *** PAYPAL INTEGRATION ***
  useEffect(() => {
    if (paymentMethod === 'PayPal' && hasMounted && !sdkReady) {
      setSdkReady(true);
      window.paypal.Buttons({
        createOrder: async function () {
          return await api.post('/payment/paypal-checkout', { cartItems })
          .then(res => {
              return res.data.id;
          })
          .catch(e => {
            console.error(e.error)
          })
        },
        onApprove: async function (data, actions) {
        /*
        onApprove: function(data, actions) {
          return actions.order.capture()
            .then(function(details) {
              console.log(JSON.stringify(details.purchase_units[0].payments.captures[0].id));

              var transid = JSON.stringify(details.purchase_units[0].payments.captures[0].id)
            });
            6EX817436K7560255
            8P54499175939881C
        },
        */
          return await actions.order.capture()
            .then((orderData) => {
              console.log("orderData");
              console.log(orderData);
              console.log("orderData.purchase_units[0].payments.captures[0].id");
              console.log(orderData.purchase_units[0].payments.captures[0].id);

              orderFormData.paymentInfo = {
                id: orderData.id,
                captureId: orderData.purchase_units[0].payments.captures[0].id,
                status: orderData.status,
                orderType: "PayPal"
              }
              dispatch(createOrder(orderFormData));
              history.push('/success')
            })
        },
      })
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
    history.push("/shipping-address");
  }

  // *** CALCULATE TOTALS ***
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

  const singleChargePI = async (total, description, cart) => {
    try {
      const chargeData = { total, description, cart };

      const res = await api.post('/payment/single-checkout-charge', chargeData);
      let result = res.data.data.clientSecret;

      dispatch(setAlert('Charge successful.', 'success'));
      return result;
    } catch (err) {
      dispatch(setAlert('Failed to charge card.', 'danger'));
      const errors = err.response.data.errors;

      if (errors) {
        errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
      }
    }
  };

  const singleChargeCardPI = async (chosenCard, total, description, cart) => {
    try {
      const chargeData = { chosenCard, total, description, cart };
      const res = await api.post('/payment/checkout-charge-card', chargeData);
      let result = res.data.data.clientSecret;

      dispatch(setAlert('Charge successful.', 'success'));
      return result;
    } catch (err) {
      dispatch(setAlert('Failed to charge card.', 'danger'));
      const errors = err.response.data.errors;

      if (errors) {
        errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
      }
    }
  };

  const saveCardAndChargePI = async (total, description, cart) => {
    try {
      const chargeData = {total, description, cart};

      const res = await api.post('/payment/save-card-charge', chargeData);
      let result = res.data.data.clientSecret;

      dispatch(setAlert('Charge successful.', 'success'));
      return result;
    } catch (err) {
      dispatch(setAlert('Failed to charge card.', 'danger'));
      const errors = err.response.data.errors;

      if (errors) {
        errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
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

  // const successPayPalPaymentHandler = (paymentResult) => {
    // console.log(paymentResult);
    // dispatch(payPayPalOrder(orderId, paymentResult));
  // };

  const orderPaymentHandler = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const { fullname, email, zipcode, address, city, state, country } = shippingAddress;
    let paymentResult;

    try {
      setIsProcessing(true);
      // paymentResult = dispatch(payOrder(paymentData));
      if (guestCheckout && !addCardAndPay && !singlePay) {
        description = "Guest purchase. No card Saved.";
        paymentResult = await singleChargePI(paymentData, description, orderFormData);
        // paymentResult = dispatch(singleCharge(paymentData, description, orderFormData));
      }
      if (addCardAndPay && !guestCheckout && !singlePay) {
        if (!isAuthenticated) {
          dispatch(setAlert('Login or create account in order to save card and complete order.','danger'));
          return history.push('/login');
        }
        description = "Card saved. Single purchase.";
        // paymentResult = dispatch(saveCardAndCharge(paymentData, description, orderFormData));
        paymentResult = await saveCardAndChargePI(paymentData, description, orderFormData);
      }
      // charge existing card
      if (singlePay && !guestCheckout && !addCardAndPay) {
        if (!isAuthenticated) {
          dispatch(setAlert('Login or create account in order to save card and complete order.','danger'));
          return history.push('/login');
        }
        if (!cardToUse) {
          dispatch(setAlert('Login or create account in order to save card and complete order.','danger'));
          return history.push('/login');
        };
        description = "Purchase made with saved card.";
        paymentResult = await singleChargeCardPI(cardToUse, paymentData, description, orderFormData);
        // paymentResult = dispatch(singleChargeCard(chosenCard, paymentData, description, orderFormData));

        const finalPaymentResult = await stripe.confirmCardPayment(paymentResult, {
          receipt_email: email,
          setup_future_usage: 'on_session',
          payment_method: cardToUse
        });

        // if (finalPaymentResult.paymentIntent.status === "succeeded") dispatch(setAlert("Success. Payment complete!", 'success'));
        
        orderFormData.paymentInfo = {
          // id: stripeResult.paymentIntent.id,
          id: finalPaymentResult.paymentIntent.id,
          orderType: "Stripe"
        }

        dispatch(createOrder(orderFormData));
        setIsProcessing(false); // enables btn
        return history.push('/success')
      }
      const cardElem = elements.getElement(CardElement);
      
      const stripeResult = await stripe.createPaymentMethod({
        type: "card",
        card: cardElem,
        billing_details: {
          name: fullname,
          email: email,
          address: {
            // city: city,
            postal_code: zipcode,
            // line1: address,
            // state: state,
            // country: country  // may remove
          }
        }
      })

      if (stripeResult.error) {
        setIsProcessing(false);
        dispatch(setAlert(`Error: ${stripeResult.error}`, 'danger'));
        // setChargeError(stripeResult.error);
      }

      // complete payment, connect intent w/pay method
      // paymentSecret = clientSecret
      const finalPaymentResult = await stripe.confirmCardPayment(paymentResult, {
      // payment_method: stripeResult.paymentMethod.id
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
      // confirm payment for existing card, even if error
      // if (finalPaymentResult.error) {
      //   dispatch(setAlert(`${finalPaymentResult.error.message}`, 'danger'));
      // }
      
      // if (finalPaymentResult.paymentIntent.status === "succeeded") {
      //   dispatch(setAlert("Success. Payment complete!", 'success'));
      // }
      orderFormData.paymentInfo = {
        // id: stripeResult.paymentIntent.id,
        id: finalPaymentResult.paymentIntent.id,
        orderType: "Stripe"
      }

      dispatch(createOrder(orderFormData));
      setIsProcessing(false); // enables btn
      history.push('/success')
    } catch (err) {
      setIsProcessing(false); // enables btn
      console.error(`Error Message: ${err}.`);
      // setChargeError(`There was an issue in processing your payment. Error: ${err} Try again.`);
      dispatch(setAlert(`There was an issue in processing your payment. Try again.`, 'danger'));
      // dispatch(setAlert(`There was an issue in processing your payment. Error: ${err} Try again.`, 'danger'));
    }
  }

  return (
  <form onSubmit={(e) => orderPaymentHandler(e)}>
    <div className="payments__header">
      <h2 className="payments__title">Make Payment</h2>
      <div className="payments__total-items">
        {cartItems.reduce((qty, item) => Number(item.qty) + qty, 0)} Items
      </div>
    </div>
    <div className="payments__container">
      {isAuthenticated && (
        <div className="payments__header-information edit-btns">
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
      <div className="payments__header-information sidebar">
        <div className="payments__header-set flex-position-1">
          <h3>Shipping Information</h3>
          <div className="">Name: {shippingAddress.fullname}</div>
          <div className="">Shipping Address: {shippingAddress.address}</div>
          <div className="">
            {`${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country}`}
          </div>
          <div className="">Zipcode: {shippingAddress.zipcode}</div>
        </div>
        <div className="payments__header-set flex-position-2">
          <h3>Payment Method</h3>
          <div className="">{paymentMethod}</div>
        </div>
        <div className="payments__total pay-screen set-one">
          <h4 className="payments__total-header">Order Summary</h4>
          <div className="payments__totals">
            <div className="payments__subtotal">
              Sub-Total: $ {price.subTotal}
            </div>
            <div className="payments__tax-total">
              Tax: $ {price.tax}
            </div>
            <div className="payments__shipping-total">
              Shipping: $ {price.shippingTotal}
            </div>
            <div className="payments__grand-total">
              <span>Grand Total: </span>
              <span>$ {price.grandTotal}</span>
            </div>
          </div>
        </div>
        <div className="payments__pay-container">
          {isAuthenticated && paymentMethod === 'Stripe' && (
            <div className="payments__set-card">
              <div className="payments__card-setting">
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
              <div className="payments__card-setting">
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
              <div className="payments__card-setting">
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
          <section className="payments__card-list">
            {!singlePay ? (
              <></>
            ) : (
              <>
              <h3 className="payments__card-list header">Cards:</h3>
              <CardSelect guest={guestCheck} />
              </>
            )}
            
          </section>
          <div className="payments__card-elem">
            <>
            {paymentMethod === 'Stripe' && !singlePay ? (
              <div className={`show ${singlePay ? 'active' : ''}`}>
                <CardElement options={cardStyle}></CardElement>
              </div>
            
            ) : (
              <div className={`show ${singlePay ? 'active' : ''}`}>
              <div className="payments__pay-display">
                Pay ${price.grandTotal}
              </div>
              <div className="payments__paypal-container">
                <div id="paypal"></div>
              </div>
              </div>
            )}
            </>
          </div>
          {paymentMethod === 'Stripe' ? (
            <div className="">
              <button className="payments__btn-checkout checkout btn btn-primary" type="submit" disabled={!stripe || isProcessing || sdkReady}>
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
          {chargeError && (
            <div className="payments__charge-err">{chargeError}</div>
          )}
        </div>
      </div>
      {/* Cart content list */}
      <div className="payments__content">
        <div className="payments__list-content">
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
            cartItems.map((cart, index) => (
              <div className="payments" key={index}>
                <div className="payments__list">
                  <div className="payments__list-item">
                    <div className="payments__image">
                      <img src={cart.product.product_image_url} alt="" className="payments__img" />
                    </div>
                    <div className="payments__detail">
                      <div className="payments__detail-name">
                        <h3 className="payments__item-name">
                          <Link to={`/product/${cart.product.product_id}`}>{cart.product.name}</Link>
                        </h3>
                      </div>
                      <div className="payments__detail-qty">
                        <div className="payments__item-price">
                          $ {cart.product.price}
                        </div>
                        <div className="payments__qty-counter">
                          <div className="payments__qty">
                            <input type="number" className="payments__qty-input-count" value={cart.qty} readOnly/>
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
      </div>
    </div>
  </form>
  )
}
export default Payment;