require('dotenv').config();
const pool = require('../config/db');
const paypalSDK = require('@paypal/checkout-server-sdk')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {v4: uuidv4} = require('uuid');

// class="[`billy ${cartActive ? 'billy-active' : ''}`]"
exports.calculateTotalAmount = async (cartItems) => {
  console.log("receiving cartitems for stripe order")
  console.log(cartItems);
  let serverProdPayItems = [];
  if (cartItems.length === 0) {
    return res.status(404).json({ errors: [{ msg: "No cart items found." }] });
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

    for (let i = 0; i < cartItems.length; i++) {
      const productFromCart = 'SELECT P.id, P.price, P.name, P.count_in_stock FROM products AS P WHERE P.id = $1;';
      let prodItems = await queryPromise(productFromCart, cartItems[i].product.id);
      console.log('checking stock')
      if (prodItems.rows[0].count_in_stock === 0) {
        return res.status(404).json({ errors: [{ msg: `${prodItems.rows[0].name} not in stock. Please remove it from cart and checkout again.` }] });
      }
      console.log(`iteration ${i}:`)
      console.log(prodItems.rows[0]);
      console.log(`ADDING QUANTITY TO PRODUCT`)
      prodItems.rows[0].qty = cartItems[i].qty;
      console.log(prodItems.rows[0]);
      // push prodItems into serverProdPayItems array
      serverProdPayItems.push(prodItems.rows[0]);
    };

    console.log(`iteration finished`);
    console.log(`server products:`);
    console.log(serverProdPayItems);
    console.log("calculating totals")
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
    console.log("finished totals calc")
    console.log(price)
    console.log("-----------------------")
    console.dir(price)
    return price;
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// guest checkout - no user or card info saved
// users with accounts can use this option if they choose to not save card info
// /payment/single-checkout-charge
// private
exports.singlePayment = async (req, res, next) => {
  const { paymentData, description, orderFormData} = req.body;
  let { orderItems, shippingAddress } = orderFormData;

  try {
    let price = await calculateTotalAmount(orderItems);
    console.log("returned calculated price");
    console.log(price);

    // convert grandtotal into pennies for stripe
    const grandTotal = Math.round(price.grandTotal * 100);
    // token generated client side via:
    // let {token} = await stripe.createToken(cardElement)
    // create customer id for the payment to be more valid / secure by banks etc.
    let idempontencyKey = uuidv4();
    console.log("backend: single paylent idempontencyKey");
    console.log(idempontencyKey)
    console.log("shipping address");
    console.log(shippingAddress);

    const intent = await stripe.paymentIntents.create(
      {
        amount: grandTotal,
        currency: "usd",
        description: description,
        payment_method_types: ["card"],
        receipt_email: shippingAddress.email
      },
      { idempontencyKey }
    );
    // save resulting intent.id into the orders table as the 'stripePaymentId'
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

// user w/account adds card and pays once. User gets a stripe customer id added to their token
// /payment/save-card-charge
// private
exports.addCardMakePayment = async (req, res, next) => {
  const { id, stripeCustId } = req.user;
  // const {total, description, cart} = req.body;
  const { paymentData, description, orderFormData} = req.body;
  const { orderItems, shippingAddress } = orderFormData;
  let customer;

  console.log("shippingAddress");
  console.log(shippingAddress);

  try {
    // create unique stripe id per user
    if (!stripeCustId) {
      // customer = await stripe.customers.create({
      //   email: user.email, // optional
      //   name: user.fullname // optional
      // });
      customer = await stripe.customers.create();
      // req.user.stripeCustId = customer.id;
      stripeCustId = customer.id;
    }
    let price = await calculateTotalAmount(orderItems);
    console.log("returned calculated price");
    console.log(price);
    const grandTotal = Math.round(price.grandTotal * 100);
    
    // find all cart items from the products table, take the prices of the products and reduce their prices together
    let idempontencyKey = uuidv4();
    console.log("backend: single paylent idempontencyKey");
    console.log(idempontencyKey);

    // setup_future_usage: 'on_session' = reuse payment method only when the customer is in the checkout flow, logged in, card is saved to customer during client side confirmation, accessible later via stripe.paymentMethods.list({customer: customer.id, type: 'card })
    const intent = await stripe.paymentIntents.create(
      {
        amount: grandTotal,
        currency: "usd",
        description: description,
        // payment_method: 
        payment_method_types: ["card"],
        receipt_email: shippingAddress.email,
        customer: stripeCustId,
        setup_future_usage: 'on_session',
        // confirmation_method: "manual",
        confirm: true
      },
      { idempontencyKey }
    );
    console.log("backend: addcardmakingpayment, intent structure");
    console.log(intent);

    // TODO --- save resulting intent.id into the orders table as the 'stripePaymentId', also, check to see if the stripe payment id already exists, if not, assigne a newly generated customer id intent to the orders table when creating a new order, if so, assign the exsisting stripe payment id to the orders table, so pass the customer id generated here to the firnt end where it is passed to the create orders action
    if (intent.status === "succeeded") {
      console.log("Success. Charged add card to payment user account.")
    }

    // TODO look more into the migration docs. Attach payment method (paymentIntent.payment_method) to the customer.
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

// make payment with existing card
// /payment/checkout-charge-card
// Private
exports.makePayment = async (req, res, next) => {
  const { id, stripeCustId } = req.user;
  const { chosenCard, paymentData, description, orderFormData} = req.body;
  const { orderItems, shippingAddress } = orderFormData;
  // let customer;
  try {
    // create unique stripe id per user
    if (!stripeCustId) {
      return res.status(403).json({ errors: [{ msg: "Unauthorized. Failed to get user data." }] });
    }
    let price = await calculateTotalAmount(orderItems);
    console.log("returned calculated price");
    console.log(price);
    const grandTotal = Math.round(price.grandTotal * 100);

    // display customer's saved Cards / PaymentMethods, listing the payment methods. Refer to addCardToUser; it sends card list info client side for user to choose

    // set chosen card as the default, pass the card id to the default_payment_method as the paymentMethodId
    let defaultCard = await stripe.customers.update(stripeCustId, {
        default_cource: chosenCard.id,
        invoice_settings: {
          default_payment_method: chosenCard.id
          // default_payment_method: data.paymentMethodId
        }
      }
    );
    console.log("backend: default card structure info");
    console.log(defaultCard);

    console.log("-------------------------------")
    let idempontencyKey = uuidv4();
    console.log("backend: single pay idempontencyKey");
    console.log(idempontencyKey);

    const intent = await stripe.paymentIntents.create(
      {
        amount: grandTotal,
        currency: "usd",
        description: description,
        // payment_method: paymentMethods.data[0].id,
        payment_method: chosenCard.id,
        payment_method_types: ["card"],
        setup_future_usage: 'on_session',
        receipt_email: shippingAddress.email,
        customer: stripeCustId,
        confirm: true
      },
      { idempontencyKey }
    );
    console.log("backend: intent response structure")
    console.log("++++++++++++++++++")
    console.log(intent);

    if (intent.status === "succeeded") {
      console.log("Success. Charged card on_session.")
    }

    // if intent error, it is likely due to an authentications_required decline code, use the declines intent's client secret and payment method, sent to client, used for confirmCardPayment to allow the customer to authenticate the payment.
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

// Creating order
// /payment/config-paypal
// public
// exports.configurePayPal = (req, res, next) => {
//   res.send(process.env.PAYPAL_CLIENT_ID);
// };

exports.makePayPalPayment = async (req, res, next) => {
  // when in production (online) enable paypal to aquire actuall payments (testing turned off)
  // const environment = process.env.NODE_ENV === "production" ? paypalSDK.core.LiveEnvironment : paypalSDK.core.SandboxEnvironment;
  // keep paypal testing (sandbox) on, even online
  const Environment = process.env.NODE_ENV === "production" ? paypalSDK.core.SandboxEnvironment : paypalSDK.core.SandboxEnvironment;
  const paypalClient = new paypalSDK.core.PayPalHttpClient(
    new Environment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
  );

  let serverProdPayItems = [];
  const { cartItems } = req.body;
  console.log("initial cartitems")
  console.log(cartItems)
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

  // match each cart item with respective product item, verify the pay amount, send pay amount to client to verify with paypal. Then via client the cartitems are send to the create order controller to be added as order items, this is simply to verif item amounts server side.
  // on payment page load, the call to the paypal url to set up the client side id is initialized via useeffect
  for (let i = 0; i < cartItems.length; i++) {
    const productFromCart = 'SELECT P.id, P.price, P.name, P.count_in_stock FROM products AS P WHERE P.id = $1;';
    let prodItems = await queryPromise(productFromCart, cartItems[i].product.id);
    console.log('checking stock')
    if (prodItems.rows[0].count_in_stock === 0) {
      return res.status(404).json({ errors: [{ msg: `${prodItems.rows[0].name} not in stock. Please remove it from cart and checkout again.` }] });
    }
    console.log(`iteration ${i}:`)
    console.log(prodItems.rows[0]);
    console.log(`ADDING QUANTITY TO PRODUCT`)
    prodItems.rows[0].qty = cartItems[i].qty;
    console.log(prodItems.rows[0]);
    // push prodItems into serverProdPayItems array
    serverProdPayItems.push(prodItems.rows[0]);
  };

  console.log(`iteration finished`);
  console.log(`server products:`);
  console.log(serverProdPayItems);

  /*
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  price.subTotal = cartItems.reduce((acc, item) => acc += item.product.price * item.qty, 0).toFixed(2);
  */
  console.log("calculating totals")
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
  console.log("finished totals calc")
  console.log(price)
  console.log("-----------------------")
  console.dir(price)

  const request = new paypalSDK.orders.OrdersCreateRequest();
  // amount = grandtotal, breakdown.itemtotal = subtotal
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
          // const storeItemId = item.id;
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
  try {
    // must send order id to client
    // execute order and save order id into db along with payment method specified as paypal
    const order = await paypalClient.execute(request);
    console.log(order)
    console.log("^^^^^^^^^^^^^^^^")
    console.dir(order)
    return res.status(200).json({id: order.result.id});
    //    status: "Paypal payment successful!",
    //    data: {
    //      payPalResult: order.result.id
    //    }
    // });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// ##################################################
// ##################################################
// ##################################################
// retirieve card info belonging to user upon signing into account. This way card info is available during checkout.
// /payment/add-user-card
// private?
exports.addCardToUser = async (req, res, next) => {
  const { stripeCustId } = req.body;
  let resultStatus;
  try {
    // check if user exists
    if (!stripeCustId) {
      return res.status(404).json({ errors: [{ msg: "No card or user data found." }] });
    }

    // list all saved card details of customer
    // pass the card id used as the payment_method of the payment intent
    const cards = stripe.paymentMethods.list({
      customer: stripeCustId,
      type: "card"
    });
    
    // returns object with data attribute containing a list of user's stored card details. Pass to client where customer could pick one of the saved cards.

    // Once a card is picked, pass the card's id to an api call for a new paymentIntent. There the card id serves as the value of the payment_method of the paymentIntent.

    // A card can be set as the default payment method for a customer, it will be used whenever an invoice needs to be paid. Refer to defaultCard const in makePayment.

    console.log("card list belonging to user found")
    console.log(cards)
    if (cards) {
      if (cards.data.length === 0) {
        return res.status(404).json({ errors: [{ msg: "No card data found." }] });
      }
    }
    resultStatus = "User cards found!"

    return res.status(200).json({
      status: resultStatus,
      data: {
        cards
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// delete card from registered user
// /payment/delete-card
exports.deleteCard = async (req, res, next) => {
  const { paymentMethodId } = req.body;
  try {
    // via addCardToUser, payment method lists all cards, along w/each listed card, its id, acts as the payment method id, pass into paymentMethods.detach to remove the card (payment method from the user).

    console.log("backend: deleting payment method / card")
    console.log("paymentMethodId should be a stinrg");
    console.log(paymentMethodId);
    const deleted = await stripe.paymentMethods.detach(
      paymentMethodId
    );
    console.log("deleted")
    console.log(deleted)
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

exports.getStripeCharge = async (req, res, next) => {
  const {chargeId, stripeId} = req.body;
  try {
    const charge = await stripe.charges.retrieve(chargeId);
    // if (user.rowCount === 0 || !user.rows[0]) {
    //   return res.status(403).json({ errors: [{ msg: "Unauthorized. Failed to get user data." }] });
    // }
    console.log(charge);
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

exports.refundCharge = async (req, res, next) => {
  const {orderId, userId, stripePaymentId, amount} = req.body;
  // stripePaymentId is the paymentIntentId
  try {
    const refund = await stripe.refunds.create({
      amount: amount,
      payment_intent: stripePaymentId
    })

    console.log("refund")
    console.log(refund)

    // TODO generate email stating that user has their order refunded, pass order id, userId, stripepaymentId, and refund status = 'succeeded'
    return res.status(200).json({
      status: "Listing customers who use stripe.",
      data: {
        refund
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};