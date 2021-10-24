const express = require('express');
const router = express.Router();
const { authJWT, admin } = require('../middleware/authenticator');

// import validators
const { adminEditsUserValidator, editUserInfoValidator, createUpdateProfileValidator, createShippingInfoValidator, validatorResult } = require('../middleware/validator');
const { getUserProfile, getAllUsers, getUserById, createUserProfile, createUserShippingInfo, updateUserInfo, updateUserProfile, updateUser } = require('../controllers/userController.js');

// @route    GET users/me ~ settings page...
// @desc     Get current users profile (by user id token), leads to dashboard for editing profile via settings
// @access   Private
router.get('/me', authJWT, getUserProfile);

// @route    GET users/
// @desc     Get all profiles
// @access   Private / Admin
router.get('/', authJWT, admin, getAllUsers);

// @route    GET api/users/:user_id
// @desc     Get profile by user ID
// @access   Private / Admin
router.get('/:user_id', authJWT, admin, getUserById);

// @route    POST users/profile
// @desc     Create user profile - use auth & check/validation middlewares
// @access   Private
router.post('/profile', authJWT, createUpdateProfileValidator, validatorResult, createUserProfile);

// @route    POST users/shipping-address
// @desc     Create shipping info if not exist
// @access   Private
router.post('/shipping-address', authJWT, createShippingInfoValidator, validatorResult, createUserShippingInfo);

// @route    PUT users/profile
// @desc     Update user profile - use validation middlewares
// @access   Private
router.put('/info', authJWT, editUserInfoValidator, validatorResult, updateUserInfo);

// @route    PUT users/profile
// @desc     Update user profile - use validation middlewares
// @access   Private
router.put('/profile', authJWT, createUpdateProfileValidator, validatorResult, updateUserProfile);

// @route    PUT users/:user_id
// @desc     Admin updates user profile, change role of user, can delete user (if profile abandoned or violation)
// @access   Private / Admin
router.put('/:user_id', authJWT, admin, adminEditsUserValidator, validatorResult, updateUser);

module.exports = router;