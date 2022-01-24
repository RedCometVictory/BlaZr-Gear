const express = require('express');
const router = express.Router();
const { authJWT, admin } = require('../middleware/authenticator');
// const { createPostValidator, validatorResult } = require('../middleware/validator');

const { makeOrderPayment, getPaypalClientApiKey, getStripeApiKey, addCardToUser, singlePayment, addCardMakePayment, makePayment, deleteCard, getStripeCharge, refundCharge, makePayPalPayment, refundPayPalPayment } = require('../controllers/paymentController'); 
// const { singleCharge } = require('../client/src/redux/actions/stripeActions');

// @route    GET /payment/get-paypal-key
// @desc     Preload public stripe key.
// @access   Private
router.get('/get-paypal-key', authJWT, getPaypalClientApiKey);

// @route    GET /payment/get-stripe-key
// @desc     Preload public stripe key.
// @access   Private
router.get('/get-stripe-key', authJWT, getStripeApiKey);

// @route    POST /payment/add-user-card
// @desc     User preloads cards to account.
// @access   Private?
router.post("/add-user-card", authJWT, addCardToUser);

// @route    POST /payment/create-checkout-charge
// @desc     Guest checkout. No saving user or card info in db.
// @access   Private
router.post("/single-checkout-charge", authJWT, singlePayment);

// @route    POST /payment/save-card-charge
// @desc     User updates payment of order.
// @access   Private
router.post("/save-card-charge", authJWT, addCardMakePayment);

// @route    POST /payment/create-checkout-session/
// @desc     Make charge on user's existing card.
// @access   Private
router.post("/checkout-charge-card", authJWT, makePayment);

// @route    GET /payment/config-paypal
// @desc     Create / ready paypal order.
// @access   Private
// router.get("/config-paypal", configurePayPal);

// @route    POST /payment/paypal-checkout/
// @desc     Make paypal payment.
// @access   Private
router.post("/paypal-checkout", authJWT, makePayPalPayment);

// @route    POST /payment/delete-card
// @desc     User deletes an existing card.
// @access   Private?
router.post("/delete-card", authJWT, deleteCard);
// router.delete("/delete-card", authJWT, deleteCard);

// ADMIN---------------------------------------------
// ADMIN---------------------------------------------
// @route    POST /payment/list-stipe-users
// @desc     List users' using stripe.
// @access   Private / Admin
// router.post("/list-stripe-users", authJWT, admin, getAllStripeUsers);

// @route    POST /payment/show-stripe-charge
// @desc     Get info of particular charge made.
// @access   Private / Admin
router.post("/get-stripe-charge", authJWT, admin, getStripeCharge);

// @route    POST /payment/refund-charge/order/:order_id
// @desc     Refund a stripe charge.
// @access   Private / Admin
router.post("/refund-charge/order/:order_id/", authJWT, admin, refundCharge);

// @route    POST /payment/refund-paypal/order/:order_id
// @desc     Refund a stripe charge.
// @access   Private / Admin
router.post("/refund-paypal/order/:order_id/", authJWT, admin, refundPayPalPayment);

module.exports = router;