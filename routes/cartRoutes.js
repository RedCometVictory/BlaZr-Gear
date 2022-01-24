const express = require('express');
const router = express.Router();
const { authJWT, admin } = require('../middleware/authenticator');
const { getCart, addCartItem, deleteCartItem, updateCartQuantity, increaseCartQTY, decreaseCartQTY } = require('../controllers/cartController'); 

// @route    GET /cart/me
// @desc     user gets their cart items.
// @access   Private
router.get('/me', authJWT, getCart);

// @route    GET /cart/:user_id
// @desc     user gets their cart items.
// @access   Private / Admin
// router.get('/', authJWT, getCartByUserId);

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