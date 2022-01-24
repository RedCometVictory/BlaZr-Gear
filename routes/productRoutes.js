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

const { getProductIds, getCategories, getAllProducts, createProductReview, getTopProducts, getProductById, createProduct, updateProduct, updateProductReview, deleteProduct, deleteProductReview } = require('../controllers/productController'); 

// @route    GET /products/product-ids
// @desc     Get all product ids, compare to cartItems on checkout.
// @access   Public
router.get('/product-ids', getProductIds);

// @route    GET /products/categories
// @desc     Get all product categories.
// @access   Public
router.get('/categories', getCategories);

// @route    GET /products/ 
// @desc     Get all products. This is central page
// @access   Public
router.get('/', getAllProducts);

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
router.post('/', authJWT, admin, upload.single('image_url'), createProduct);

// @route    POST /products/:prod_id/reviews
// @desc     Post review of product.
// @access   Private
router.post('/:prod_id/reviews', authJWT, createPostValidator, validatorResult, createProductReview);
// router.post('/:prod_id', authJWT, createProductReview);

// @route    PUT /products/:prod_id
// @desc     Admin updates content of a product.
// @access   Private/Admin
router.put('/:prod_id', authJWT, admin, upload.single('image_url'), updateProduct);

// @route    PUT /products/:prod_id/reviews/:review_id
// @desc     Admin updates content of a product.
// @access   Private
router.put('/:prod_id/reviews/:review_id', authJWT, createPostValidator, validatorResult, updateProductReview);

// @route    DELETE /products/:prod_id
// @desc     Admin deletes product from store. 
// @access   Private/Admin
router.delete('/:prod_id', authJWT, admin, deleteProduct);

// @route    DELETE /products/:prod_id/reviews/:review_id
// @desc     Admin deletes product from store. 
// @access   Private
router.delete('/:prod_id/reviews/:review_id', authJWT, deleteProductReview);

module.exports = router;