require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { refreshTokenString, resetTokenGenerator, accessTokenGenerator, refreshTokenGenerator, getAccessTokenFromHeaders, validateRefreshToken, validateResetToken, refreshTokenCookieOptions } = require('../middleware/jwtGenerator');
const { signedUpMail, forgotPasswordMail, PasswordResetSuccessMail, bannedAccountMail } = require('../middleware/emailService');

// req.user accessible via token (authJWT), used to access user id via state.auth.user.id
// *** Insomnia Tested / Passed / Works in App
// /auth/
// Private
exports.authTest = async (req, res, next) => {
  let { id, stripeCustId } = req.user; // passed via header
  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE id = $1;', [id]
    );
    if (user.rowCount === 0 || !user.rows[0]) {
      return res.status(403).json({ errors: [{ msg: "Unauthorized. Failed to get user data." }] });
    }
    // do not send the password to the client
    user.rows[0].user_password = undefined;
    let userRows = user.rows[0];
    if (!stripeCustId) stripeCustId = "";
    userRows.stripeCustId = stripeCustId;

    return res.status(200).json({
      success: "Test successful!",
      data: {
        // userInfo: user.rows[0]
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

    // Generate new user - encrypt password
    const salt = await bcrypt.genSalt(11);
    // not storing as a obj, but in psqldb
    const encryptedPassword = await bcrypt.hash(password, salt);

    let newUser = await pool.query(
      'INSERT INTO users (f_name, l_name, username, user_email, user_password) VALUES ($1, $2, $3, $4, $5) RETURNING *', [firstName, lastName, username, email, encryptedPassword]
    );

    if (newUser.rowCount === 0 || !newUser) {
      return res.status(401).json({ errors: [{ msg: "Failed to register user." }] });
    }

    let newUserCart = await pool.query(
      'INSERT INTO carts(user_id) VALUES ($1) RETURNING *;', [newUser.rows[0].id]
    );

    const jwtToken = accessTokenGenerator(newUser.rows[0].id, newUser.rows[0].role, newUserCart.rows[0].id);

    // Fix nodemailer error: likely issue with transporter setup (email servuce)
    // user created, now creating cart
    // res is not defined - error caused by user registering email address does not officially exist on any service
    await signedUpMail(email);
    // hide token from client (already added to db)
    newUser.rows[0].user_password = undefined;
    // return access jetToken to client
    res.status(200).json({ 
      status: "Success! Account created.",
      data: {
        token: jwtToken,
        // userInfo: newUser.rows[0]
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

    // create access and refresh token, store both in cookies, save refToken to db
    const jwtToken = accessTokenGenerator(user.rows[0].id, user.rows[0].role, user.rows[0].cart_id);

    // create refresh token "id", store into the db of the user
    const refreshToken = refreshTokenString();
    
    // set refresh to db, this is for later matching the token from the cookie to the reftoken stored in the db, if matched create new ref token and save it to do, if no match, logout user (ultimately setting this value to null) also clear the reftoken cookie
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
        // userInfo: user.rows[0]
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

    const createResetToken = await pool.query(
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

    const resetTokenFromDB = verifToken.rows[0].reset_token;
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
  // user passed in token & email (must match with backend before new passwords confirmed)
  const { token, email } = req.query;
  const { password, password2 } = req.body;

  // token id from url, a param, it's passed into req.body
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

    // get user info and reset token, double check if token still exists in db
    // if used === true, then token has been previously verified and is no longer valid
    const verifToken = await pool.query(
      'SELECT U.*, R.reset_token, R.email_address, R.used AS reset_email FROM users AS U JOIN reset_tokens AS R on R.email_address = U.user_email WHERE U.id = $1AND U.user_email = $2 AND R.reset_token = $3 AND R.used = $4;', [verifiedToken.id, email, token, true]
    );

    if (verifToken.rowCount === 0 || !verifToken) {
      return res.status(403).json({ errors: [{ msg: 'Reset Token not found. Please try password reset again.' }] });
    };
    const resetTokenIDFromDB = verifToken.rows[0].id;
    const resetTokenFromDB = verifToken.rows[0].reset_token;
    // Generate new user - encrypt password
    const salt = await bcrypt.genSalt(11);
    // not storing as a obj, but in psqldb
    const encryptedPassword = await bcrypt.hash(password, salt);

    const updateNewPassword = await pool.query(
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

// TODO --- finish refresh token section
// *** Insomnia Tested / Passed
// successfully tested on postman
// call this route via client usseffect with settimeout to expire before access token actually expires
// refreh-token, call via front end redux or context, not yet working / implemented
// /auth/refresh-token
// Public
exports.authRefreshToken = async (req, res, next) => {
  const { refresh } = req.cookies;

  // check for access token - may not need to send headers for refresh...
  // const accessToken = getAccessTokenFromHeaders(req.headers);
  console.log(refresh);

  if (!refresh) {
    return res.send("no refresh cookie exists!").json({token: ''});
  }
  // check if access token delivered via headers
  // if (!accessToken) {
    // res.status(401).send("Token not valid!");
  // }
  // verify token to get payload...
  const verifiedRefToken = validateRefreshToken(refresh);
  console.log("---verifieded refresh token---");
  console.log(verifiedRefToken);
  if (!verifiedRefToken || verifiedRefToken === null) {
    res.status(403).send('Failed to verify refresh token.');
    return; // maybe redirct / call logout
  }
  // console.log("-----------------------");
  // console.log("current access token");
  // console.log();
  // console.log();
  // console.log("Verified (current) refresh token");
  // console.log(verifiedRefToken);

  try {
    // then find a matching refresh token in the users db table, if one is found then the refresh token is still valid
    const refResult = await pool.query(
      'SELECT * FROM users WHERE refresh_token = $1;', [verifiedRefToken.refreshToken]
    );

    if (refResult.rowCount === 0) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized. Failed to find refresh token value." }] });
    }

    const userCart = await pool.query(
      // 'SELECT id FROM carts WHERE user_id = $1;', [refResult.rows[0].id]
      'SELECT id FROM carts WHERE user_id = $1;', [verifiedRefToken.id]
    );
    
    if (!userCart.rows[0] || !userCart) {
      return res.status(400).json({ errors: [{ msg: 'Error. User cart not found.' }] });
    }

    refResult.rows[0].user_password = undefined;
    // generate & sign a new access token, then send to header to LS
    const userId = refResult.rows[0].id;
    const userRole = refResult.rows[0].role;
    // TODO -- need to get cart.id of the user
    const userCartId = userCart.rows[0].id;

    const newAccessToken = accessTokenGenerator(userId, userRole, userCartId);
    // if ref token matched ref token in database, generate a ne ref token
    const newRefreshTokenId = refreshTokenString();
    // update the db with the new reftoken
    const updateRefTokenInDb = await pool.query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2 RETURNING *;', [newRefreshTokenId, userId]
    );

    // console.log("==========================");
    // console.log("newly created ref token, updated in db");
    // console.log("new access token");
    // console.log(newAccessToken);
    
    // console.log("new refresh token");
    // console.log(newRefreshTokenId);
    // console.log("#############################");

    if (updateRefTokenInDb.rowCount === 0) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized. Failed to update refresh token." }] });
    }

    updateRefTokenInDb.rows[0].user_password = undefined;
    // sign new reftokne id and create/update cookie
    const signedRefreshToken = refreshTokenGenerator(userId, userRole, newRefreshTokenId);
        
    const refreshOptions = refreshTokenCookieOptions();

    // get the access token data via axios as:
    // res.data.data.token
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

// refesh token, call this route from the App.js comp
// used for refresh token
// called by frontend login context
// router.get("/loggedIn", (req, res) => {
//   try {
//     const token = req.cookies.token;
//     if (!token) return res.json(false);

//     jwt.verify(token, process.env.JWT_SECRET);

//     res.send(true);
//   } catch (err) {
//     res.json(false);
//   }
// });

// *** Insomnia Tested / Passed / Works in App
// logout - remove refresh token - sucessfully tested on postman!
// /auth/logout
// Public
exports.authLogout = async (req, res, next) => {
  const { refresh } = req.cookies;
  // remove access token from localstorage:
  // console.log("attempting logout of user")
  // if (!refresh) return "logout: no refresh cookie exists!"; 
  // verify token to get payload...
  // try {
  //   res.send("you have a cookie!")
  // } catch (err) {
  //   res.send("no cookie");
  // }
  const verifiedRefToken = validateRefreshToken(refresh);

  // if (verifiedRefToken === null) {
  //   res.status(403).send('Failed to verify refresh token.');
  //   return; // maybe redirect / call logout (handles bu authJWT middleware)
  // }
  // console.log("logging out:");
  // console.log(verifiedRefToken);
  // console.log("==============");
  // console.log(verifiedRefToken.refreshTokenId);
  // console.log(verifiedRefToken.refreshToken);

  try {
    // console.log("refresh token cookie has been verified!");
    // res.send("you have a cookie!")
    // clear existing cookies:
    if (verifiedRefToken) {
      const clearRefreshToken = await pool.query(
        'UPDATE users SET refresh_token = null WHERE refresh_token = $1 RETURNING *', [verifiedRefToken.refreshToken]
      );
      // if (clearRefreshToken.rows[0].refresh_token !== null) {
      //   return res.status(403).json({ errors: [{ msg: "Unauthorized. Failed to nullify refresh token." }] });
      // }
        
      // console.log(clearRefreshToken.rows[0].refresh_token);
      // res.send("successfully nulled refresh token");
      // res.clearCookie('refresh'); // instead of deleting, override
      res.cookie('refresh', '', { expires: new Date(1) });
      // to effectively "delete" a cookie, one must set the expiration to essentially be maxAge=1
    };
    
    res.send({ "success": "Logged out successfully!" });
    // implement login redirects later
    // return res.status(200).redirect("/login");
  } catch (err) {
    // res.send("no cookie?????");
    console.error(err.message);
    res.status(500).send("Failed while attempting logout!");
  }
};

// *** Insomnia Tested / Passed
// /auth/remove
// Private / Admin ?
exports.authDelete = async (req, res, next) => {
  const { id, role, cartID } = req.user;
  try {
    const findUser = await pool.query(
      'SELECT id from users WHERE id = $1;', [id]
    );

    if (!findUser) {
      res.status(404).json({ errors: [{ msg: "Error. User not found." }] })
    }

    // if user role = admin || staff remove comments they made
    if (role === 'staff' || role === 'admin') {
      // const deleteAllComments = await pool.query('DELETE FROM comments WHERE user_id = $1;', [id]);
      await pool.query('DELETE FROM comments WHERE user_id = $1;', [id]);
      // if (!deleteAllComments) {
        // res.status(404).json({ errors: [{ msg: "Error. User comments found." }] });
      // }
    }
    const deleteAllUserReviews = await pool.query('DELETE FROM reviews WHERE user_id = $1;', [id]);

    const profileId = await pool.query('SELECT profiles.id FROM profiles WHERE profiles.user_id = $1', [id]);
    // if (profileId.rows[0]) {
    if (profileId) {
      const deleteProfile = await pool.query('DELETE FROM profiles WHERE user_id = $1;', [id]);
    }
    const deleteUserCart = await pool.query(
      "DELETE FROM carts WHERE user_id = $1;", [id]
    );
    const deleteUser = await pool.query('DELETE FROM users WHERE id = $1;', [id]);
    return res.status(200).json({
      status: "User and associated data has been deleted."
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};