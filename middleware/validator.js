const { check, validationResult } = require('express-validator');

// authRoutes
// authenticate users already in db (login) an get token (used to make req to provate routes)
exports.signinAuthValidator = [
  check('email', 'Please include a valid email address.').isEmail().trim(),
  check('password', 'Password is required.').exists().isLength({min: 6, max: 16}).withMessage('Password must be between 6 to 16 characters.')
];

// postRoutes
// create a post
exports.createPostValidator = [
  check('description', 'Description text is required.').not().isEmpty()
];

// profileRoutes
// create / edit user profile - list all required fields
exports.createProfileValidator = [
  check('birthday', 'Birthdate is required.').not().isEmpty()
  // check('skills', 'Skills is required.').not().isEmpty()
];

// profileRoutes
// create / edit user profile - list all required fields
exports.editProfileValidator = [
  check('username', 'Please include a username.').not().isEmpty().trim().isLength({min: 1, max: 12}).withMessage('Username must be between 1 to 12 characters.'),
  check('tag_name', 'Please include a tag name.').not().isEmpty().trim().isLength({min: 4, max: 12}).withMessage('Tag name must be between 4 to 12 characters.'),
  check('user_email', 'Please include a valid email.').isEmail().trim(),
  check('birthday', 'Birthdate is required.').not().isEmpty()
  // check('skills', 'Skills is required.').not().isEmpty()
];

// userRoutes
// Register User - produce errs for err.array
exports.registerUserValidator = [
  check('username', 'Please create a username.').not().isEmpty().trim().isLength({min: 1, max: 12}).withMessage('Username must be between 1 to 12 characters.'),
  check('tagName', 'Please create a tag name.').not().isEmpty().trim().isLength({min: 4, max: 12}).withMessage('Tag name must be between 4 to 12 characters.'),
  check('email', 'Please include a valid email.').isEmail().trim(),
  check('password', 'Password must be at least 6 to 16 characters long.').exists().isLength({min: 6, max: 16})
  // min 8 char long.
  // At least one uppercase.
  // At least one lower case.
  // At least one special character.
  // check("password", "...").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i");
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

// exports.signupValidator = [
//   check('username').not().isEmpty().trim().withMessage('All fields required'),
//   check('email').isEmail().normalizeEmail().withMessage('Invalid email'),
//   check('password')
//     .isLength({ min: 6 })
//     .withMessage('Password must be at least 6 characters long'),
// ];

// exports.signinValidator = [
//   check('email').isEmail().normalizeEmail().withMessage('Invalid email'),
//   check('password')
//     .isLength({ min: 6 })
//     .withMessage('Password must be at least 6 characters long'),
// ];

// exports.validatorResult = (req, res, next) => {
//   const result = validationResult(req);
//   const hasErrors = !result.isEmpty();

//   if (hasErrors) {
//     const firstError = result.array()[0].msg;
//     return res.status(400).json({
//       errorMessage: firstError,
//     });

//     // console.log('hasErrors: ', hasErrors);
//     // console.log('result: ', result);
//   }

//   next();
// };
