const express = require('express');
const router = express.Router();
const { authJWT, admin } = require('../middleware/authenticator');

const { getImages, getImageById, deleteImage } = require('../controllers/imageController');

// @route    GET /images/all
// @desc     Get all images.
// @access   Public/Admin
router.get('/all', authJWT, admin, getImages);

// @route    GET /images/:image_id
// @desc     Get image by id. 
// @access   Public/Admin
router.get('/:image_id', authJWT, admin, getImageById);

// @route    DELETE /images/:image_id
// @desc     Admin deletes image from order items, order history and existing products, if product exists, then a new image is applied in product update. 
// @access   Private/Admin
router.delete('/:image_id', authJWT, admin, deleteImage);

module.exports = router;