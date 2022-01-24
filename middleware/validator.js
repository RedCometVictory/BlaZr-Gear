const { check, validationResult } = require('express-validator');

// authRoutes, authenticate users already in db (login) an get token (used to make req to private routes)
exports.signinAuthValidator = [
  check('email', 'Please include a valid email address.').exists().isEmail().trim(),
  check('password', 'Password is required.').exists().isLength({min: 6, max: 16}).withMessage('Password must be between 6 to 16 characters.')
];

// userRoutes
// Register User - produce errs for err.array
exports.registerUserValidator = [
  check('email', 'Please include a valid email.').exists().isEmail().trim(),
  check('password', 'Password must be at least 6 to 16 characters long.').exists().isLength({min: 6, max: 16}),
  check('password2', 'Password must be at least 6 to 16 characters long.').exists().isLength({min: 6, max: 16}),
  check('username', 'Please create a username between 1 to 20 characters.').not().isEmpty().trim().isLength({min: 1, max: 20}).withMessage('Username must be between 1 to 20 characters.'),
  check('firstName', "Please include first name. Max 12 characters.").not().isEmpty().isLength({min: 1, max: 12}),
  check('lastName', "Please include last name. Max 20 characters.").not().isEmpty().isLength({min: 1, max: 20})
  // min 8 char long.
  // At least one uppercase.
  // At least one lower case.
  // At least one special character.
  // check("password", "...").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i");
];

exports.forgotPasswordValidator = [
  check('email', 'Please include a valid email address.').exists().isEmail().trim()
];

exports.resetPasswordValidator = [
  check('email', 'Please include a valid email.').exists().isEmail().trim(),
  check('password', 'Password must be at least 6 to 16 characters long.').exists().isLength({min: 6, max: 16}),
  check('password2', 'Password must be at least 6 to 16 characters long.').exists().isLength({min: 6, max: 16}),
];

// profileRoutes
// edit user table info - list all required fields
exports.editUserInfoValidator = [
  check('user_email', 'Please include a valid email.').exists().isEmail().trim(),
  check('username', 'Please create a username.').not().isEmpty().trim().isLength({min: 1, max: 120}).withMessage('Username must be between 1 to 12 characters.'),
  check('f_name', "Please include first name.").not().isEmpty().isLength({min: 1, max: 60}),
  check('l_name', "Please include last name.").not().isEmpty().isLength({min: 1, max: 60})
];

// profileRoutes
// create / edit user profile - list all required fields
exports.createUpdateProfileValidator = [
  check('address', 'Address is required.').not().isEmpty(),
  // check('phone', 'Phone number is required.').exists().isMobilePhone(),
  check('phone', 'Phone number is required.').exists().isNumeric(),
  check('city', 'City is required.').not().isEmpty(),
  check('state', 'State is required.').not().isEmpty().isLength({min: 2}),
  check('country', 'Country is required.').not().isEmpty().isLength({min: 2}),
  check('zipcode', 'Zipcode is required.').not().isEmpty().isLength({min: 2, max: 5})
];

// slideRoutes
// create / edit slides - list all required fields
exports.createUpdateSlideValidator = [
  check('image_url', 'Image is required.').not().isEmpty(),
  check('title', 'Title should be under 40 characters.').isLength({max: 40}),
  check('theme', 'Theme should be under 40 characters.').isLength({max: 40}),
  check('description', 'Description text is required.').isLength({max: 120})
];

// user/cartRoutes
// create user shipping info
exports.createShippingInfoValidator = [
  check('address', 'Address is required.').not().isEmpty(),
  check('zipcode', 'Zipcode is required.').not().isEmpty().isLength({min: 2, max: 5}),
  check('city', 'City is required.').not().isEmpty(),
  check('state', 'State is required.').not().isEmpty().isLength({min: 2}),
  check('country', 'Country is required.').not().isEmpty().isLength({min: 2})
];

exports.adminEditsUserValidator = [
  check('f_name', 'Please create a first name at least 2 characters long.').not().isEmpty().trim().isLength({min: 2, max: 60}),
  check('l_name', 'Please create a last name at least 2 characters long.').not().isEmpty().trim().isLength({min: 2, max: 60}),
  check('username', 'Please create a username (1 - 12 chars).').not().isEmpty().trim().isLength({min: 1, max: 12}).withMessage('Username must be between 1 to 12 characters.'),
  check('user_email', 'Please include a valid email.').exists().isEmail().trim(),
  check('role', 'Please include a role for the user.').not().isEmpty()
  // min 8 char long.
  // At least one uppercase.
  // At least one lower case.
  // At least one special character.
  // check("password", "...").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i");
];

exports.createUpdateProductValidator = [
  check('image_url', 'Image is required.').not().isEmpty(),
  check('name', 'Product name is required.').not().isEmpty(),
  check('brand', 'Brand is required.').not().isEmpty(),
  check('category', 'Category is required.').not().isEmpty(),
  check('price', 'Price is required.').not().isEmpty(),
  check('count_in_stock', 'Count in stock is required.').not().isEmpty(),
  check('description', 'Description text is required.').not().isEmpty()
];

// postRoutes
// create a review post for product
exports.createPostValidator = [
  check('title', 'Title limit should be under 120 characters.').isLength({max: 120}),
  check('description', 'Description text is required.').not().isEmpty()
];

// validation Result - may need async
exports.validatorResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // if there are errors - execute bad request
    return res.status(400).json({
      errors: errors.array()
    });
  }
  next();
}


/* function phonenumber(inputtxt) {
  // var phoneno = /^\d{10}$/;
  let phoneno = /^((\+1|1)?( |-)?)?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})( |-)?([2-9][0-9]{2}( |-)?[0-9]{4})$/
  if(inputtxt.value.match(phoneno)) {
    return true;
  } else {
    // alert("message");
    return false;
  }
}

console.log(phonenumber('111-111-2355')); 
let phone = '111-123-4567';
console.log(phone.value.match(/^((\+1|1)?( |-)?)?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})( |-)?([2-9][0-9]{2}( |-)?[0-9]{4})$/))
*/