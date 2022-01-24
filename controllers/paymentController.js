require('dotenv').config();
const pool = require('../config/db');
const paypalSDK = require('@paypal/checkout-server-sdk')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {v4: uuidv4} = require('uuid');
const { purchaseRefundMail } = require('../middleware/emailService');

// LiveEnvironment = poduction build
// SandboxEnvironment = testing build
const Environment = process.env.NODE_ENV === "production" ? paypalSDK.core.SandboxEnvironment : paypalSDK.core.SandboxEnvironment;
const paypalClient = new paypalSDK.core.PayPalHttpClient(
  new Environment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET)
);

// class="[`billy ${cartActive ? 'billy-active' : ''}`]"
// *** tested / works in App
const calculateTotalAmount = async (cartItems) => {
  if (cartItems.length === 0) {
    return ['error', `cartItems length is ${cartItems.length}. Please add items to cart to proceed with an order.`];
  };

  try {
    const queryPromise = (query, ...values) => {
      return new Promise((resolve, reject) => {
        pool.query(query, values, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        })
      });
    };

    let cartItemProdIds = []
    for (let i = 0; i < cartItems.length; i++) {
      cartItemProdIds.push(cartItems[i].product.product_id);
    }

    let prodItems =  [];
    let serverProdPayItems = [];
    for (let i = 0; i < cartItemProdIds.length; i++) {
      let productFromCart = 'SELECT id, price, name, count_in_stock FROM products WHERE id = $1;';

      const productConfirm = await queryPromise(productFromCart, cartItemProdIds[i]);
      prodItems = productConfirm.rows[0];
      serverProdPayItems[i] = {...serverProdPayItems[i], ...prodItems};
    }

    // confirm product stock is not 0
    for (let i = 0; i < serverProdPayItems.length; i++) {
      if (serverProdPayItems[i].count_in_stock === 0) {
        return ['error', `${serverProdPayItems[i].name} not in stock. Please remove it from cart and checkout again.`]
      }

      serverProdPayItems[i].qty = cartItems[i].qty;
    }

    let price = {};
    price.subTotal = serverProdPayItems.reduce((acc, item) => acc += item.price * item.qty, 0).toFixed(2);
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
    return price;
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** tested / works in app
// GET /payment/get-stripe-key
// Preload public stripe key.
// Private
exports.getPaypalClientApiKey = async (req, res, next) => {
  res.status(200).json({
    paypalApiKey: process.env.PAYPAL_CLIENT_ID
  });
};

// *** tested / works in app
// GET /payment/get-stripe-key
// Preload public stripe key.
// Private
exports.getStripeApiKey = async (req, res, next) => {
  res.status(200).json({
    stripeApiKey: process.env.STRIPE_PUBLIC_KEY
  });
};

// *** tested / Works in App
// guest checkout - no user or card info saved
// users with accounts can use this option if they choose to not save card info
// /payment/single-checkout-charge
// private
exports.singlePayment = async (req, res, next) => {
  const { total, description, cart} = req.body;
  try {
    let price = await calculateTotalAmount(cart.orderItems);
    if (price.length > 1 && price[0] === 'error') {
      // TODO: consider making this message appear on page
      return res.status(404).json({ errors: [{ msg: `${price[1]}` }] });
    }

    // convert grandtotal into pennies for stripe
    const grandTotal = Math.round(price.grandTotal * 100);
    // create customer id for payment to be more valid / secure by banks etc.
    let idempotencyKey = uuidv4();

    const intent = await stripe.paymentIntents.create(
      {
        amount: grandTotal,
        currency: "usd",
        description: description,
        payment_method_types: ["card"],
        receipt_email: cart.shippingAddress.email
      },
      { idempotencyKey }
    );
    // save intent.id into orders table as'stripePaymentId'

    return res.status(200).json({
      status: "Single payment successful!",
      data: {
        clientSecret: intent.client_secret
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  } 
};

// *** Tested / Works in App
// user w/account adds card and pays once. User gets a stripe customer id added to their token
// /payment/save-card-charge
// private
exports.addCardMakePayment = async (req, res, next) => {
  // authTest assigns value to stripeCustId, however it is not saved, likely due to jwt strictly forbidding token editing, value should be added during token creation
  let { id, stripeCustId } = req.user;
  let {description, cart} = req.body;
  let user;
  let customer;
  let currentStripeId;

  try {
    if (stripeCustId === undefined || !stripeCustId) { 
      user = await pool.query('SELECT id, user_email, stripe_cust_id FROM users WHERE id = $1;', [id]);

      currentStripeId = user.rows[0].stripe_cust_id;

      if (currentStripeId) {
        stripeCustId = currentStripeId;
      } else {
        // create a stripe id if one doesnt exist
        customer = await stripe.customers.create({
          email: user.email, // optional
          //  name: user.fullname // optional
        });
      }

      if (customer) {
        // req.user.stripeCustId = customer.id;
        stripeCustId = customer.id;
      }
    }

    let price = await calculateTotalAmount(cart.orderItems);
    if (price.length > 1 && price[0] === 'error') {
      return res.status(404).json({ errors: [{ msg: `${price[1]}` }] });
    }

    let grandTotal = Math.round(price.grandTotal * 100);
    let idempotencyKey = uuidv4();

    const intent = await stripe.paymentIntents.create(
      {
        amount: grandTotal,
        currency: "usd",
        description: description,
        // payment_method_types: ["card"],
        receipt_email: cart.shippingAddress.email,
        customer: stripeCustId,
        setup_future_usage: 'on_session',
        // confirmation_method: "automatic",
        // confirmation_method: "manual",
        // confirm: true
      },
      { idempotencyKey: idempotencyKey }
    );

    // save stripe user customer id
    if (customer) {
      await pool.query(
        'UPDATE users SET stripe_cust_id = $1 WHERE id = $2;', [stripeCustId, id]
      )
    }

    return res.status(200).json({
      status: "Single payment successful!",
      data: {
        clientSecret: intent.client_secret
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** tested / works in App
// make payment with existing card
// /payment/checkout-charge-card
// Private
exports.makePayment = async (req, res, next) => {
  const { id, stripeCustId } = req.user;
  const { chosenCard, description, cart} = req.body;
  let user;
  let customer;
  let customerId;

  try {
    customerId = stripeCustId;
    // create unique stripe id per user
    if (!stripeCustId || striptCustId === '') {
      user = await pool.query(
        'SELECT id, user_email, stripe_cust_id FROM users WHERE id = $1;', [id]
      );

      if (user.rows.length === 0) {
        return res.status(403).json({ errors: [{ msg: "Unauthorized. Failed to get user data." }] });
      }

      currentStripeId = user.rows[0].stripe_cust_id;

      if (currentStripeId === '' || !currentStripeId) {
        return res.status(403).json({ errors: [{ msg: "Unauthorized. Failed to get user data." }] });
      }
      customerId = currentStripeId;
    }

    let price = await calculateTotalAmount(cart.orderItems);
    if (price.length > 1 && price[0] === 'error') {
      return res.status(404).json({ errors: [{ msg: `${price[1]}` }] });
    }

    const grandTotal = Math.round(price.grandTotal * 100);

    // Create and confirm a PaymentIntent with the order amount, currency, 
    let idempotencyKey = uuidv4();
    // Customer and PaymentMethod ID
    const intent = await stripe.paymentIntents.create(
      {
        amount: grandTotal,
        currency: "usd",
        description: description,
        payment_method: chosenCard,
        // payment_method_types: ["card"],
        setup_future_usage: 'on_session',
        receipt_email: cart.shippingAddress.email,
        customer: currentStripeId,
        // confirm: true
      },
      { idempotencyKey }
    );

    return res.status(200).json({
      status: "Single payment successful!",
      data: {
        clientSecret: intent.client_secret
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// ##################################################
// ##################################################
// PAYPAL PAYMENTS, Create Order & Capturing ORDER
// ##################################################

// *** tested / works in app
// /payment/paypal-checkout
// Take cart items (qty) compare with backend products for accurate price info generation
exports.makePayPalPayment = async (req, res, next) => {
  // when in production (online) enable paypal to aquire actual payments (testing turned off)
  // keep paypal testing (sandbox) on, even online
  const { cartItems } = req.body;

  try {
    if (cartItems.length === 0) {
      return res.status(404).json({ errors: [{ msg: "No cart items found." }] });
    };

    const queryPromise = (query, ...values) => {
      return new Promise((resolve, reject) => {
        pool.query(query, values, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        })
      });
    };

    let prodPayPalItems;
    let serverProdPayItems = [];
    for (let i = 0; i < cartItems.length; i++) {
      const productFromCartQuery = 'SELECT P.id, P.price, P.name, P.count_in_stock FROM products AS P WHERE P.id = $1;';
      prodPayPalItems = await queryPromise(productFromCartQuery, cartItems[i].product.product_id);

      let prodItems = prodPayPalItems.rows[0];
      serverProdPayItems[i] = {...serverProdPayItems[i], ...prodItems};
      serverProdPayItems[i].qty = cartItems[i].qty;
    };

    let price = await calculateTotalAmount(cartItems);
    if (price.length > 1 && price[0] === 'error') {
      return res.status(404).json({ errors: [{ msg: `${price[1]}` }] });
    }

    const request = new paypalSDK.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: price.grandTotal,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: price.subTotal
              },
              shipping: {
                currency_code: "USD",
                value: price.shippingTotal
              },
              tax_total: {
                currency_code: "USD",
                value: price.tax
              }
            }
          },
          items: serverProdPayItems.map(item => {
            return {
              name: item.name,
              unit_amount: {
                currency_code: "USD",
                value: item.price
              },
              quantity: item.qty
            }
          })
        }
      ]
    })
    // send order id to client, execute & save order id into db along with payment method specified as paypal
    const order = await paypalClient.execute(request);

    return res.status(200).json({id: order.result.id});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// /payment/refund-paypal/order/:order_id
// private / Admin
exports.refundPayPalPayment = async (req, res, next) => {
  let {orderId, userId, paypalPaymentId, paypalCaptureId, amount } = req.body;
  try {
    const refundedAtDate = new Date().toString().slice(0,10);

    let request = new paypalSDK.payments.CapturesRefundRequest(paypalCaptureId);
    request.requestBody({
      amount: {
        value: amount,
        currency_code: "USD"
      }
    });

    // refund
    await paypalClient.execute(request);

    let orderRefund = await pool.query(
      'UPDATE orders SET is_refunded = $1, refunded_at = $2, order_status = $3 WHERE id = $4 RETURNING *;', [true, refundedAtDate, 'refunded', orderId]
    );

    if (orderRefund.rowCount === 0 || !orderRefund) {
      return res.status(404).json({
        errors: [{ msg: "No order found." }]
      });
    };

    let userEmail = await pool.query(
      'SELECT f_name, user_email FROM users WHERE id = $1;', [userId]
    );

    let firstName = userEmail.rows[0].f_name;
    let email = userEmail.rows[0].user_email;
    await purchaseRefundMail(email, orderId, firstName);

    res.status(200).json({ 
      status: "Success. Paypal order refunded.",
      data: {
        orderInfo: orderRefund.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// ##################################################
// ##################################################
// ##################################################
// *** tested / works in app
// /payment/add-user-card
// retirieve card info belonging to user upon signing into account. This way card info is available during checkout.
exports.addCardToUser = async (req, res, next) => {
  let { stripeId } = req.body;
  let resultStatus;
  let cards;

  try {
    if (stripeId === '' || !stripeId) {
      return res.status(404).json({ errors: [{ msg: "No card or user data found." }] });
    }

    // list all saved card details of customer
    // pass card id used as the payment_method of the payment intent
    cards = await stripe.paymentMethods.list({
      customer: stripeId,
      type: "card"
    });

    if (cards) {
      if (cards.data.length === 0) {
        return res.status(404).json({ errors: [{ msg: "No card data found." }] });
      }
    }
    resultStatus = "User cards found."
    if (!cards) resultStatus = "No cards found."
    return res.status(200).json({
      status: resultStatus,
      data: {
        cards: cards,
        clientSecret: stripeId
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** tested / works in app
// delete card from registered user
// /payment/delete-card
exports.deleteCard = async (req, res, next) => {
  const { cardId } = req.body;
  try {
    const deleted = await stripe.paymentMethods.detach(
      cardId
    );

    return res.status(200).json({
      status: "Card deleted.",
      data: {
        deleted
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};


// --------------------------------------------------
// ##################################################
// ADMIN
// exports.getStripeUser = async (req, res, next) => {
//   const {stripeCustId} = req.body;
//   try {
//     const customers = await stripe.customers.retrieve(stripeCustId)
//     return res.status(200).json({
//       status: "Listing customers who use stripe.",
//       data: {
//         customers
//       }
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error...");
//   }
// };

// TODO: consider removing / not used
// /payment/show-stripe-charge
// get stripe info of particular charge made
// Private / Admin
exports.getStripeCharge = async (req, res, next) => {
  const {chargeId, stripeId} = req.body;
  try {
    const charge = await stripe.charges.retrieve(chargeId);

    return res.status(200).json({
      status: "Listing customers who use stripe.",
      data: {
        charge
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// /payment/refund-stripe-charge
// Private / Admin
exports.refundCharge = async (req, res, next) => {
  const {orderId, userId, stripePaymentId, amount} = req.body;
  // stripePaymentId is the paymentIntentId
  try {
    let roundedAmount = Math.round(amount * 100);
    const refund = await stripe.refunds.create({
      amount: roundedAmount,
      payment_intent: stripePaymentId
    });

    let userEmail = await pool.query(
      'SELECT f_name, user_email FROM users WHERE id = $1;', [userId]
    );

    let firstName = userEmail.rows[0].f_name;
    let email = userEmail.rows[0].user_email;

    await purchaseRefundMail(email, orderId, firstName);

    // if successful set is_refunded to true and refunded to a date and order status to refunded
    // const refundedAtDate = new Date().toString();
    // const refundOrder = await pool.query(
    //   'UPDATE orders SET is_refunded = $1, refunded_at = $2, order_status = $3 WHERE id = $4 RETURNING *;', [true, refundedAtDate, 'refunded', order_id]
    // );
    // TODO generate email stating that user has their order refunded, pass order id, userId, stripepaymentId, and refund status = 'succeeded'
    return res.status(200).json({
      status: "Listing customers who use stripe.",
      data: {
        refund,
        // order: refundOrder.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};