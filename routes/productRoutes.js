const express = require('express');
const router = express.Router();
const { authJWT, admin } = require('../middleware/authenticator');
const multer = require('multer');
const { storage } = require('../middleware/cloudinary');
const upload = multer({
  storage,
  limits: { fieldSize: 3 * 1024 * 1024 },
  fileFilter(req,file, cb) {
    if (!file.originalname.match(/\.(gif|jpe?g|png)$/i)) {
      return cb(new Error("file must be an image"));
    }
    return cb(null, true);
  }
}); //3MB
const { createPostValidator, validatorResult } = require('../middleware/validator');

const { getAllProducts, createProductReview, getTopProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController'); 

// @route    GET /products/ 
// @desc     Get all products. This is central page
// @access   Public
router.get('/', getAllProducts);

// @route    POST /products/:prod_id/reviews
// @desc     Post review of product.
// @access   Private
router.get('/:prod_id/reviews', authJWT, createProductReview);

// @route    GET /products/top
// @desc     Get best selling items. 
// @access   Public
router.get('/top', getTopProducts);

// @route    GET /products/:prod_id
// @desc     Get product by id. 
// @access   Public
router.get('/:prod_id', getProductById);

// @route    POST /products/ 
// @desc     Create product.
// @access   Private/Admin
router.post('/', authJWT, admin, createProduct);

// @route    PUT /products/:prod_id
// @desc     Admin updates content of a product.
// @access   Private/Admin
router.put('/:prod_id', authJWT, admin, upload.single('image_url'), createPostValidator, validatorResult, updateProduct);

// @route    DELETE /products/:prod_id
// @desc     Admin deletes product from store. 
// @access   Private/Admin
router.delete('/:prod_id', authJWT, admin, deleteProduct);

module.exports = router;