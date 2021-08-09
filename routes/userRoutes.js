const express = require('express');
const router = express.Router();
const { authJWT, admin } = require('../middleware/authenticator');
const multer = require('multer');
const { storage } = require('../middleware/cloudinary');
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter(req,file, cb) {
    if (!file.originalname.match(/\.(gif|jpe?g|png)$/i)) {
      return cb(new Error("file must be an image"));
    }
    return cb(null, true);
  }
});

// import validators
const { adminEditsUserValidator, createProfileValidator, editProfileValidator, validatorResult } = require('../middleware/validator');
const { getUserProfile, getAllUsers, getUserById, createUserProfile, updateUserProfile, updateUser } = require('../controllers/userController.js');

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
router.post('/profile', authJWT, upload.single('background_image'), createProfileValidator, validatorResult, createUserProfile);

// @route    PUT users/profile
// @desc     Update user profile - use validation middlewares
// @access   Private
router.put('/profile', authJWT, upload.fields([{name: 'user_avatar'}, {name: 'background_image'}]), editProfileValidator, validatorResult, updateUserProfile);

// @route    PUT users/:user_id
// @desc     Admin updates user profile, change role of user, can delete user (if profile abandoned or violation)
// @access   Private / Admin
router.put('/:user_id', authJWT, admin, adminEditsUserValidator, validatorResult, updateUser);

module.exports = router;
/*
UPLOAD ROUTES
import path from 'path'
import express from 'express'
import multer from 'multer'
const router = express.Router()

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    )
  },
})

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb('Images only!')
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  },
})

router.post('/', upload.single('image'), (req, res) => {
  res.send(`/${req.file.path}`)
})

export default router

*/