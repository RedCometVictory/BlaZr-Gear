const express = require('express');
const router = express.Router();
const { authJWT, admin } = require('../middleware/authenticator');
// const { createPostValidator, validatorResult } = require('../middleware/validator');

const { makeOrderPayment, addCardToUser, singlePayment, addCardMakePayment, makePayment, deleteCard, getStripeCharge, refundCharge, makePayPalPayment } = require('../controllers/paymentController'); 
// const { singleCharge } = require('../client/src/redux/actions/stripeActions');

// @route    POST /payment/add-user-card
// @desc     User preloads cards to account.
// @access   Private?
router.post("/add-user-card", addCardToUser);

// @route    POST /payment/create-checkout-charge
// @desc     Guest checkout. No saving user or card info in db.
// @access   Private
router.post("/single-checkout-charge", singlePayment);

// @route    POST /payment/save-card-charge
// @desc     User updates payment of order.
// @access   Private
router.post("/save-card-charge", addCardMakePayment);

// @route    POST /payment/create-checkout-session/
// @desc     Make charge on user's existing card.
// @access   Private
router.post("/checkout-charge-card", makePayment);

// @route    GET /payment/config-paypal
// @desc     Create / ready paypal order.
// @access   Private
// router.get("/config-paypal", configurePayPal);

// @route    POST /payment/paypal-checkout/
// @desc     Make paypal payment.
// @access   Private
router.post("/paypal-checkout", makePayPalPayment);

// @route    POST /payment/delete-card
// @desc     User deletes an existing card.
// @access   Private?
router.post("/delete-card", deleteCard);

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

// @route    POST /payment/refund-stripe-charge
// @desc     Refund a stripe charge.
// @access   Private / Admin
router.post("/refund-charge/order/:order_id/", authJWT, admin, refundCharge);

module.exports = router;