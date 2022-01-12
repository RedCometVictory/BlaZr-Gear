const express = require('express');
const router = express.Router();
const { authJWT, admin } = require('../middleware/authenticator');
const { createPostValidator, validatorResult } = require('../middleware/validator');
const { getAllOrders, getMyOrders, getOrderById, getOrderByIdAdmin, createOrder, orderPayment, updateOrderToPaid, updateOrderDeliveredStatus, updateOrderRefund, deleteOrder, updateOrderToShipped } = require('../controllers/orderController'); 

// @route    GET /orders
// @desc     Get all orders, review.
// @access   Private/Admin
router.get('/', authJWT, admin, getAllOrders);

// @route    GET /orders/my-orders
// @desc     Get all orders, review.
// @access   Private
router.get('/my-orders', authJWT, getMyOrders);

// @route    GET /orders/:order_id
// @desc     Get individual order to view detail. 
// @access   Private 
router.get('/:order_id', authJWT, getOrderById);

// @route    GET /orders/admin/:order_id
// @desc     Get individual order to view detail. 
// @access   Private/Admin 
router.get('/admin/:order_id', authJWT, admin, getOrderByIdAdmin);

// @route    POST /orders/
// @desc     User adds items to order (creates order). 
// @access   Private TODO need validation on inputss
router.post('/', authJWT, createOrder);

// TODO: consider removing
// @route    POST /orders/:order_id/payment
// @desc     User updates payment of order.
// @access   Private
router.get('/:order_id/pay', authJWT, createPostValidator, validatorResult, updateOrderToPaid);
// router.put('/:order_id/payment', authJWT, orderPayment);

// @route    GET /orders/:order_id/status-to-shipped
// @desc     Admin updates delivery status of order.
// @access   Private/Admin
router.get('/:order_id/status-to-shipped', authJWT, admin, updateOrderToShipped);

// @route    GET /orders/:order_id/deliver
// @desc     Admin updates delivery status of order.
// @access   Private/Admin
router.get('/:order_id/deliver', authJWT, admin, updateOrderDeliveredStatus);

// @route    GET /orders/:order_id/refund
// @desc     Admin updates delivery status of order.
// @access   Private/Admin
router.get('/:order_id/refund', authJWT, admin, updateOrderRefund);

// @route    DELETE /orders/:order_id/remove
// @desc     Admin deletes order, if err detected.
// @access   Private/Admin
router.delete('/:order_id/remove', authJWT, admin, deleteOrder);

module.exports = router;