const express = require('express');
const router = express.Router();
const { authJWT, admin } = require('../middleware/authenticator');
const { createPostValidator, validatorResult } = require('../middleware/validator');

const { getCart, addCartItem, deleteCartItem, updateCartQuantity, increaseCartQTY, decreaseCartQTY } = require('../controllers/cartController'); 

// @route    GET /cart/ 
// @desc     Get cart items.
// @access   Private
router.get('/', authJWT, getCart);

// @route    POST /cart/add
// @desc     User adds items to cart. 
// @access   Private
router.post('/add', authJWT, addCartItem);

// @route    PUT /cart/update-quantity
// @desc     Update quantity of item in cart.
// @access   Private
router.put('/update-quantity', authJWT, updateCartQuantity);

// @route    POST /cart/delete
// @desc     User deletes an item from cart.
// @access   Private
router.delete('/delete', authJWT, deleteCartItem);

module.exports = router;