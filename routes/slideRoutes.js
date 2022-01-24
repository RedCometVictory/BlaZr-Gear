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
// const { createUpdateSlideValidator, validatorResult } = require('../middleware/validator');
const { getSlideShow, getSlideById, createSlide, updateSlide, deleteSlide } = require('../controllers/slideController');

// @route    GET /slides/all
// @desc     Get all slides. Used for slideshow on landing page
// @access   Public/Admin
router.get('/all', getSlideShow);

// @route    GET /slides/:slide_id
// @desc     Get slide by id. 
// @access   Public/Admin
router.get('/:slide_id', authJWT, admin, getSlideById);

// @route    POST /slides/add
// @desc     Create slide.
// @access   Private/Admin
router.post('/add', authJWT, admin, upload.single('image_url'), createSlide);

// @route    PUT /slides/:slide_id/update
// @desc     Admin updates content of slideshow.
// @access   Private/Admin
// router.put('/:slide_id', authJWT, admin, upload.single('image_url'), createSlideValidator, validatorResult, updateSlide);
router.put('/:slide_id/update', authJWT, admin, upload.single('image_url'), updateSlide);

// @route    DELETE /slides/:slide_id
// @desc     Admin deletes slides from slideshow. 
// @access   Private/Admin
router.delete('/:slide_id', authJWT, admin, deleteSlide);

module.exports = router;