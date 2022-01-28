require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { refreshTokenString, resetTokenGenerator, accessTokenGenerator, refreshTokenGenerator, validateRefreshToken, validateResetToken, refreshTokenCookieOptions } = require('../middleware/jwtGenerator');
const { signedUpMail, forgotPasswordMail, PasswordResetSuccessMail, bannedAccountMail } = require('../middleware/emailService');

// req.user accessible via token (authJWT), used to access user id via state.auth.user.id
// *** Insomnia Tested / Passed / Works in App
// /auth/
// Private
exports.authTest = async (req, res, next) => {
  let { id, stripeCustId } = req.user; // passed via header
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1;', [id]);
    if (user.rowCount === 0 || !user.rows[0]) {
      return res.status(403).json({ errors: [{ msg: "Unauthorized. Failed to get user data." }] });
    };

    user.rows[0].user_password = undefined;
    let userRows = user.rows[0];

    if (!stripeCustId) stripeCustId = userRows.stripe_cust_id;

    return res.status(200).json({
      success: "Test successful!",
      data: {
        userInfo: userRows
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
};

// *** Insomnia Tested / Passed / Works in App
// NOTE: email service returns res as undefined, may be due to gmail security. If receiver email does not exist, sender inbox is told so via email
// /auth/register
// Public
exports.registerUser = async (req, res, next) => {
  // req.file produced by multer after uploading to cloudinary
  // path = secure_url / filename = public_id
  let { firstName, lastName, username, email, password, password2 } = req.body;

  if (!firstName || !lastName || !username || !email || !password) {
    return res.status(401).json({ errors: [{ msg: 'All fields are required.' }] });
  }

  try {
    // check if client provided info is not already present in db, to prevent repeated info
    let emailResult = await pool.query('SELECT user_email FROM users WHERE user_email = $1', [ email ]);
    let usernameResult = await pool.query('SELECT username FROM users WHERE username = $1', [ username ]);

    if (usernameResult.rowCount !== 0) {
      return res.status(400).json({ errors: [{ msg: 'The username already exists!' }] });
    }
    if (emailResult.rowCount !== 0) {
      return res.status(400).json({ errors: [{ msg: 'The user already exists!' }] });
    }

    if (password !== password2) {
      return res.status(400).json({ errors: [{ msg: 'Error. Passwords do not match.' }] });
    }

    if (username.length > 20) {
      return res.status(400).json({ errors: [{ msg: 'Error. Username must be less than 20 characters.' }] });
    }

    if (firstName.length > 12) {
      return res.status(400).json({ errors: [{ msg: 'Error. First name must be less than 12 characters.' }] });
    }

    if (lastName.length > 20) {
      return res.status(400).json({ errors: [{ msg: 'Error. Last name must be less than 20 characters.' }] });
    }

    // Generate new user - encrypt password
    const salt = await bcrypt.genSalt(11);
    const encryptedPassword = await bcrypt.hash(password, salt);

    let newUser = await pool.query(
      'INSERT INTO users (f_name, l_name, username, user_email, user_password) VALUES ($1, $2, $3, $4, $5) RETURNING *;', [firstName, lastName, username, email, encryptedPassword]
    );

    if (newUser.rowCount === 0 || !newUser) {
      return res.status(401).json({ errors: [{ msg: "Failed to register user." }] });
    }

    let newUserCart = await pool.query(
      'INSERT INTO carts(user_id) VALUES ($1) RETURNING *;', [newUser.rows[0].id]
    );

    const jwtToken = accessTokenGenerator(newUser.rows[0].id, newUser.rows[0].role, newUserCart.rows[0].id);

    await signedUpMail(email);
    // hide token from client (already added to db)
    newUser.rows[0].user_password = undefined;
    
    const refreshToken = refreshTokenString();
    // set refresh token "id" to db, used for matching to refresh cookie token, if matched create new ref token and save it to db, if no match, logout user, set reftoken in db to null & clear the reftoken cookie
    const setRefreshToken = await pool.query(
      'UPDATE users SET refresh_token = $1 WHERE user_email = $2 RETURNING *;', [refreshToken, newUser.rows[0].user_email]
    );

    if (!setRefreshToken.rows.length > 0) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized. Failed to update refresh token." }] });
    };
    // sign reftoken id, put into cookie, verify upon /refresh-token
    const signedRefreshToken = refreshTokenGenerator(newUser.rows[0].id, newUser.rows[0].role, refreshToken);

    const refreshOptions = refreshTokenCookieOptions();

    // generate refresh token cookie to client
    res.cookie('refresh', signedRefreshToken, refreshOptions);
    // return access token to client
    res.status(200).json({ 
      status: "Success! Account created.",
      data: {
        token: jwtToken
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error...');
  }
};

// *** Insomnia Tested / Passed / Works in App
// login user - successfully passed postman
// /auth/login
// Public
exports.authValidToken = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query(
      'SELECT U.*, C.id AS cart_id FROM users AS U JOIN carts AS C ON C.user_id = U.id WHERE U.user_email = $1;', [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ errors: [{ msg: "Invalid email or password."}] })
    }

    if (user.rows[0].role === 'banned') {
      await bannedAccountMail(user.rows[0].user_email);
      return res.status(400).json({ errors: [{ msg: "Account is banned / currently under review."}] });
    }

    const isMatch = await bcrypt.compare(
      password, user.rows[0].user_password
    );

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid email or password."}] });
    }

    // create access & refresh token, save refToken to db
    const jwtToken = accessTokenGenerator(user.rows[0].id, user.rows[0].role, user.rows[0].cart_id);

    const refreshToken = refreshTokenString();
    const setRefreshToken = await pool.query(
      'UPDATE users SET refresh_token = $1 WHERE user_email = $2 RETURNING *;', [refreshToken, user.rows[0].user_email]
    );

    if (!setRefreshToken.rows.length > 0) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized. Failed to update refresh token." }] });
    };

    // sign reftoken id, put into cookie, verify upon /refresh-token
    const signedRefreshToken = refreshTokenGenerator(user.rows[0].id, user.rows[0].role, refreshToken);

    const refreshOptions = refreshTokenCookieOptions();

    // keep password from client by 'overriding it'
    user.rows[0].user_password = undefined;

    // generate refresh token cookie to client
    res.cookie('refresh', signedRefreshToken, refreshOptions);

    return res.json({
      status: "Successful login!",
      data: {
        token: jwtToken, // signed, send to auth header save to LS
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
}

// *** Insomnia Tested / Passed / Works in App
// /auth/forgot-password
// Public
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const userInfo = await pool.query(
      'SELECT * FROM users WHERE user_email = $1;', [email]
    );

    if (userInfo.rowCount === 0 || !userInfo) {
      return res.status(403).json({ errors: [{ msg: 'User does not exists!' }] });
    }

    if (userInfo.rows[0].role === 'banned') {
      await bannedAccountMail(userInfo.rows[0].user_email);
      return res.status(400).json({ errors: [{ msg: "Account is banned / currently under review."}] });
    }

    let user_id = userInfo.rows[0].id;
    const resetToken = resetTokenGenerator(user_id, email);

    // create Reset Token
    await pool.query(
      'INSERT INTO reset_tokens (email_address, reset_token) VALUES ($1, $2);', [email, resetToken]
    );

    // token expires in 30mins, mail link to user email address:
    // send resetToken and email address in the email
    await forgotPasswordMail(resetToken, email);
    res.status(200).json({ 
      status: "Success! Email sent, be sure to check your spam folder.",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia Tested / Passed / Works in App
// /auth/verify-reset
// Public
exports.verifyResetToken = async (req, res, next) => {
  const { token, email } = req.query;
  let verifiedToken;
  try {
    verifiedToken = validateResetToken(token);
    if (!verifiedToken) {
      // update reset token has been used
      await pool.query(
        'UPDATE reset_tokens SET used = $1 WHERE email_address = $2;', [true, email]
      );

      let errMessage = 'Reset Token not found or expired. Please try password reset again.';
      return res.status(403).json({ errors: [{ msg: errMessage }] });
    }
    // get user info & user reset token, 'used' property ensures each reset attempt only works once
    const verifToken = await pool.query(
      'SELECT U.*, R.reset_token, R.email_address, R.used AS reset_email FROM users AS U JOIN reset_tokens AS R on R.email_address = U.user_email WHERE U.id = $1 AND U.user_email = $2 AND R.reset_token = $3 AND R.used = $4;', [verifiedToken.id, email, token, false]
    );

    if (verifToken.rowCount === 0 || !verifToken) {
      await pool.query(
        'UPDATE reset_tokens SET used = $1 WHERE email_address = $2;', [true, email]
      );
      // update used false to true; delete true tokens later
      let errMessage = "Reset Token not found. Please try password reset again.";
      return res.status(403).json({ errors: [{ msg: errMessage }] });
    };

    // const resetTokenFromDB = verifToken.rows[0].reset_token;
    // update reset token has been used
    await pool.query(
      'UPDATE reset_tokens SET used = $1 WHERE email_address = $2;', [true, email]
    );

    return res.status(200).json({
      status: "Success! Reset token valid.",
      data: {
        // validToken: verifiedToken.rows[0],
        allowReset: true
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia Tested / Passed / Works in App
// /auth/reset-password
// Public
exports.resetPassword = async (req, res, next) => {
  const { token, email } = req.query;
  const { password, password2 } = req.body;

  if (!password || !password2) {
    return res.status(403).json({ errors: [{ msg: 'Unauthorized! Passwords not submitted.' }] });
  }

  if (password !== password2) {
    return res.status(403).json({ errors: [{ msg: 'Error. Passwords do not match.' }] });
  }  
  try {
    const verifiedToken = validateResetToken(token);
    if (!verifiedToken) {
      return res.status(403).json({ errors: [{ msg: 'Reset token expired. Please try password reset again.' }] });      
    };

    // get user info & reset token, double check if token still exists in db
    // if used === true, then token has been previously verified/used & is no longer valid
    const verifToken = await pool.query(
      'SELECT U.*, R.reset_token, R.email_address, R.used AS reset_email FROM users AS U JOIN reset_tokens AS R on R.email_address = U.user_email WHERE U.id = $1AND U.user_email = $2 AND R.reset_token = $3 AND R.used = $4;', [verifiedToken.id, email, token, true]
    );

    if (verifToken.rowCount === 0 || !verifToken) {
      return res.status(403).json({ errors: [{ msg: 'Reset Token not found. Please try password reset again.' }] });
    };
    const salt = await bcrypt.genSalt(11);
    const encryptedPassword = await bcrypt.hash(password, salt);

    // update New Password
    await pool.query(
      'UPDATE users SET user_password = $1 WHERE user_email = $2 AND id = $3;', [encryptedPassword, verifiedToken.email, verifiedToken.id]
    );

    // delete reset token after successful use
    await pool.query(
      'DELETE FROM reset_tokens WHERE used = true AND email_address = $1;', [email]
    );
    await PasswordResetSuccessMail(email);

    res.status(200).json({
      status: "Success! Password reset. Please login using new password.",
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia Tested / Passed
// /auth/refresh-token
// Public
exports.authRefreshToken = async (req, res, next) => {
  const { refresh } = req.cookies;

  if (refresh === undefined || !refresh) {
    return res.status(401).json({ errors: [{ msg: "No refresh cookie exists!" }] });
  }
  // check if access token delivered via headers
  // verify token to get payload...
  const verifiedRefToken = await validateRefreshToken(refresh);

  if (verifiedRefToken === undefined || !verifiedRefToken) {
    res.status(401).send('Failed to verify refresh token.');
  }

  try {
    // find matching refresh token in users db table, if found then refresh token is still valid
    const refResult = await pool.query(
      'SELECT * FROM users WHERE refresh_token = $1;', [verifiedRefToken.refreshToken]
    );

    if (refResult.rowCount === 0) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized. Failed to find refresh token value." }] });
    }

    const userCart = await pool.query(
      'SELECT id FROM carts WHERE user_id = $1;', [verifiedRefToken.id]
    );
    
    if (!userCart.rows[0] || !userCart) {
      return res.status(401).json({ errors: [{ msg: 'Error. User cart not found.' }] });
    }

    refResult.rows[0].user_password = undefined;
    // generate & sign new access token, send to header to LS
    const userId = refResult.rows[0].id;
    const userRole = refResult.rows[0].role;
    const userCartId = userCart.rows[0].id;

    const newAccessToken = accessTokenGenerator(userId, userRole, userCartId);
    // if ref token matched ref token in database, generate new reftoken
    const newRefreshTokenId = refreshTokenString();
    const updateRefTokenInDb = await pool.query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2 RETURNING id, refresh_token;', [newRefreshTokenId, userId]
    );

    if (updateRefTokenInDb.rowCount === 0) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized. Failed to update refresh token." }] });
    }

    // sign new reftokne id and create/update cookie
    const signedRefreshToken = refreshTokenGenerator(userId, userRole, newRefreshTokenId);
        
    const refreshOptions = refreshTokenCookieOptions();

    res.cookie('refresh', signedRefreshToken, refreshOptions);
    res.json({
      status: "Sucessfully generated new access and refresh tokens!",
      data: {
        token: newAccessToken // save to LS clientside
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia Tested / Passed / Works in App
// logout - remove refresh token - sucessfully tested on postman!
// /auth/logout
// Public
exports.authLogout = async (req, res, next) => {
  const { refresh } = req.cookies; 
  // verify token to get payload...
  try {
    const verifiedRefToken = await validateRefreshToken(refresh);

    // clear existing cookies:
    if (verifiedRefToken) {
      // clear Refresh Token 
      await pool.query(
        'UPDATE users SET refresh_token = null WHERE refresh_token = $1 RETURNING *', [verifiedRefToken.refreshToken]
      );

      res.cookie('refresh', '', { expires: new Date(1) });
      // to effectively "delete" a cookie, one must set the expiration to essentially be maxAge=1
    };
    
    res.status(200).send({ "success": "Logged out successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed while attempting logout!");
  }
};

// *** Insomnia Tested / Passed
// /auth/remove
// Private / Admin ?
exports.authDelete = async (req, res, next) => {
  const { id, role } = req.user;
  try {
    const findUser = await pool.query(
      'SELECT id from users WHERE id = $1;', [id]
    );

    if (!findUser) {
      res.status(404).json({ errors: [{ msg: "Error. User not found." }] })
    }

    // if user role = admin || staff remove comments they made
    if (role === 'staff' || role === 'admin') {
      await pool.query('DELETE FROM comments WHERE user_id = $1;', [id]);
    }
    // delete All User Reviews
    await pool.query('DELETE FROM reviews WHERE user_id = $1;', [id]);

    const profileId = await pool.query('SELECT profiles.id FROM profiles WHERE profiles.user_id = $1', [id]);
    if (profileId) {
      // delete Profile
      await pool.query('DELETE FROM profiles WHERE user_id = $1;', [id]);
    }
    // delete User Cart
    await pool.query(
      "DELETE FROM carts WHERE user_id = $1;", [id]
    );
    // delete User
    await pool.query('DELETE FROM users WHERE id = $1;', [id]);
    return res.status(200).json({
      status: "User and associated data has been deleted."
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};