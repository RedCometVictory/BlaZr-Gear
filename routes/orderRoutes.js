const express = require('express');
const router = express.Router();
const { authJWT, admin } = require('../middleware/authenticator');
const { createPostValidator, validatorResult } = require('../middleware/validator');

const { getAllOrders, getMyOrders, getOrderById, createOrder, orderPayment, updateOrderToDelivered } = require('../controllers/orderController'); 

// @route    GET /orders/ 
// @desc     Get all orders, review.
// @access   Private/Admin 
router.get('/', authJWT, admin, getAllOrders);

// @route    GET /orders/myorders
// @desc     User reviews orders / order history.
// @access   Private ***
router.get('/myorders', authJWT, getMyOrders);

// @route    GET /orders/:order_id
// @desc     Get individual order to view detail. 
// @access   Private 
router.get('/:order_id', authJWT, getOrderById);

// @route    POST /orders/
// @desc     User adds items to order (creates order). 
// @access   Private TODO need validation on inputss
router.post('/', authJWT, createOrder);

// @route    POST /orders/:order_id/payment
// @desc     User updates payment of order.
// @access   Private***
// router.put('/:order_id/pay', authJWT, createPostValidator, validatorResult, updateOrderToPaid);
router.put('/:order_id/payment', authJWT, orderPayment);

// @route    PUT /orders/:order_id/deliver
// @desc     Admin updates delivery status of order.
// @access   Private/Admin ***
// router.put('/:order_id/deliver', authJWT, admin, createPostValidator, validatorResult, updateOrderToDelivered);

module.exports = router;