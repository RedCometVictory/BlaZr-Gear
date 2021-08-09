const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../middleware/cloudinary');
// const upload = multer({ storage, limits: { fieldSize: 3 * 1024 * 1024 } }); //3MB
const { authJWT, admin } = require('../middleware/authenticator');
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
const { authTest, registerUser, authValidToken, authLogout, forgotPassword, resetPassword, authRefreshToken, authDelete, verifyResetToken } = require('../controllers/authController');
const { registerUserValidator, signinAuthValidator, validatorResult } = require('../middleware/validator');

// @route    GET /auth/ (endpoint: auth)
// @desc     Test route / verify / backend / user_loaded
// @access   Private
router.get('/', authJWT, authTest);

// @route    POST auth/login
// @desc     Authenticate users already in db (login) and get token (to make req to private routes)
// @access   Public
router.post('/login', signinAuthValidator, validatorResult, authValidToken);
// router.post('/login', authValidToken);

// @route    POST auth/register
// @desc     register a user
// @access   Public
router.post('/register', upload.single('avatar'), registerUserValidator, validatorResult, registerUser);

// @route    POST auth/forgot-password
// @desc     forgot password, send email link to renew
// @access   Public
router.post('/forgot-password', forgotPassword);

// @route    POST auth/verify-reset
// @desc     verify reset token is not expired
// @access   Public
router.post('/verify-reset', verifyResetToken);

// @route    POST auth/login
// @desc     verify reset token, create new password
// @access   Public
router.post('/reset-password', resetPassword);

// @route    POST auth/refresh-token
// @desc     Generate new access (upon expiration) & refresh token
// @access   Public
router.post('/refresh-token', authRefreshToken);

// @route    POST auth/logout
// @desc     Logout, destroy or 'null' refresh token from db belonging to user
// @access   Public
router.post('/logout', authLogout);

// @route    DELETE auth/remove
// @desc     User can delete their own profile, Admin can delete or blacklist any user profile upon user request or violation of policy
// @access   Private, Admin Private
router.delete('/remove', authJWT, authDelete);
// router.delete('/remove', authJWT, admin, authDelete);

module.exports = router;