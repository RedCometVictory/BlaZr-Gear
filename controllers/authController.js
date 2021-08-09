require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { refreshTokenString, resetTokenGenerator, accessTokenGenerator, refreshTokenGenerator, getAccessTokenFromHeaders, validateRefreshToken, validateResetToken, refreshTokenCookieOptions } = require('../middleware/jwtGenerator');
const { signedUpMail, forgotPasswordMail, PasswordResetSuccessMail } = require('../middleware/emailService');

// req.user accessible via token (authJWT)
// used to access user id via state.auth.user.id
// *** Insomnia Tested / Passed
// /auth/
// Private
exports.authTest = async (req, res, next) => {
  // console.log("loading user data...")
  const { id } = req.user; // passed via header
  try {
    // select all but password
    const user = await pool.query(
      'SELECT * FROM users WHERE id = $1', [id]
    );
    if (!user.rows[0] > 0) {
      return res.status(403).json({ errors: [{ msg: "Unauthorized. Failed to get user data." }] });
    }
    // do not send the password to the client
    // console.dir(user.rows[0]);
    user.rows[0].user_password = undefined;
    
    res.status(200).json({
      success: "Test successful!",
      data: {
        user: user.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
};

// *** Insomnia Tested / Passed
// NOTE: email service returns res as undefined (likely because receiver email does not exist), still recieved email in sender inbox
// /auth/register
// Public
exports.registerUser = async (req, res, next) => {
  // req.file produced by multer after uploading to cloudinary
  // path = secure_url / filename = public_id
  let { firstName, lastName, username, email, password, password2 } = req.body;

  if (!firstName || !lastName || !username || !email || !password) {
    return res.status(401).json({ errors: [{ msg: 'All fields are required.' }] });
  }

  let defaultAvatar = `https://res.cloudinary.com/${process.env.CLDNAME}/image/upload/v1621492034/social-uploads/Default-welcomer_zvjurb.png`;
  let confirmedAvatar = defaultAvatar;
  let confirmedAvatarFilename = '';

  try {
    if (req.file && req.file.path) {
      if (req.file.path) {
        confirmedAvatar = req.file.path;
        confirmedAvatarFilename = req.file.filename;
      }
    }
    if (confirmedAvatar.startsWith('dist\\')) {
      let editAvatarUrl = confirmedAvatar.slice(4);
      confirmedAvatar = editAvatarUrl;
    }

    // check if client provided info is not already present in db, to prevent repeated info
    let emailResult = await pool.query('SELECT user_email FROM users WHERE user_email = $1', [ email ]);
    let usernameResult = await pool.query('SELECT username FROM users WHERE username = $1', [ username ]);

    // if (user.rowCount !== 0) {
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

    console.log('===================');
    console.log("inserting user");
    // Insert new registered user to table:
    // avatar created later after login process...
    let newUser = await pool.query(
      'INSERT INTO users (f_name, l_name, username, user_email, user_password, user_avatar, user_avatar_filename) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [firstName, lastName, username, email, encryptedPassword, confirmedAvatar, confirmedAvatarFilename]
    );
    if (!newUser) {
      console.log("user does not exist")
    }
    console.log(`user id: ${newUser.rows[0].id}`)
    console.log('===================');
    console.log('===================');
    console.log("user created, now creating cart");
    // create individual cart_id for user
     let newUserCart = await pool.query(
       'INSERT INTO carts(user_id) VALUES ($1) RETURNING *;', [newUser.rows[0].id]
     );


    const jwtToken = accessTokenGenerator(newUser.rows[0].id, newUser.rows[0].role, newUserCart.rows[0].id);
    
    // TODO: Fix this error: likely issue with transporter setup (email servuce)
    // user created, now creating cart
    // res is not defined - error caused by user registering email address does not officially exist on any service
    await signedUpMail(email);
    // hide token from client (already added to db)
    // newUser.rows[0].user_password = undefined;
    // return access jetToken to client, so that they may use it to login right away
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

// *** Insomnia Tested / Passed
// login user - successfully passed postman
// /auth/login
// Public
exports.authValidToken = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // const user = await pool.query(
    //   'SELECT * FROM users WHERE user_email = $1', [email]
    // );
    console.log(email);
    console.log(password);
    const user = await pool.query(
      'SELECT U.*, C.id AS cart_id FROM users AS U JOIN carts AS C ON C.user_id = U.id WHERE U.user_email = $1;', [email]
    );

    // if no user - nothing returned...
    if (user.rows.length === 0) {
      return res.status(400).json({ errors: [{ msg: "Invalid email or password."}] })
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
        user: user.rows[0]
      }
    });
    // check user via email exists in db
    // user found - match password input val w/ encrypted password (db)
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
}

// *** Insomnia Tested / Passed
// /auth/forgot-password
// Public
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  console.log("----forgot----password----");
  console.log(email);
  console.log("----forgot----password----");
  try {
    const userInfo = await pool.query(
      'SELECT * FROM users WHERE user_email = $1;', [email]
    );

    if (!userInfo) {
      return res.status(400).json({ errors: [{ msg: 'User does not exists!' }] });
    }

    // generate reset token
    // 'INSERT INTO users (f_name, l_name, username, user_email, user_password, user_avatar, user_avatar_filename) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
    // const resetToken = crypto.randomBytes(64).toString('hex');
    
    // reset token
    // let resetSecret = crypto.randomBytes(64).toString('hex');
    let user_id = userInfo.rows[0].id;
    // console.log();
    console.log(user_id);
    // *** ***
    // *** ***
    const resetToken = resetTokenGenerator(user_id, email);
    // const resetToken = resetTokenGenerator(resetSecret, email);
    // *** ***
    // *** ***
    console.log("ooooooooo");
    console.log(resetToken);
    const createResetToken = await pool.query(
    //   // 'INSERT INTO reset_tokens (email_address, reset_token, used) VALUES ($1, $2, $3);', [email, resetToken, true]
      'INSERT INTO reset_tokens (email_address, reset_token) VALUES ($1, $2);', [email, resetToken]
    );
      
      // token expires in 30mins
      // 
    // date.getTime() = current time
    // const date = new Date();
    // const minutes = 30;
    // minutes * seconds * milliseconds
    // date.setTime(date.getTime() + (minutes * 60 * 1000));
    // const tokenExpiration = date;

    // const createResetToken = await pool.query(
      // 'INSERT INTO reset_tokens (email, token, used, expiration) VALUES ($1, $2, $3, $4);' [email, resetToken, true, tokenExpiration]
    // );

    // mail link to user email address:
    // send resetToken and email address in the email
    await forgotPasswordMail(resetToken, email);
    res.status(200).json({ 
      status: "Success! Email sent, be sure to check your spam folder.",
      // data: {
        // token: jwtToken
      // }
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia Tested / Passed
// via useefeect on the front end first verify the reset token is not xpired, if so user must restart the process of resetitng for an ew password. Front end povides the token and the email in the url params for comparison for reset token verif and resetting the password confirmation
// /auth/verify-reset
// Public
exports.verifyResetToken = async (req, res, next) => {
  // const { token, email } = req.params;
  const { token, email } = req.query;
  let verifiedToken;
  // let currentTime = new Date();
  // const compareCurrentDate = currentTime.setTime(Date.getTime());

  // console.log(token);
  // console.log("--------------");
  // console.log(email);
  try {
    verifiedToken = validateResetToken(token);

    // console.log("==token verified / validated==");
    if (!verifiedToken) {
      // update reset token has been used
      // console.log("verified as false");
      await pool.query(
        'UPDATE reset_tokens SET used = $1 WHERE email_address = $2;', [true, email]
      );

      // console.log("reset token verified as false, updated used status to true");
      return res.status(401).json({
        status: "Warning! Reset Token has expired. Please apply for a new password again.",
        data: {
          allowReset: false
        }
      })
    }
    // get user info and user reset token
    // used property ensures that each reset attempt only works once
    // console.log("-+-+-+-+-+-+-+-+-+-");
    const verifToken = await pool.query(
      // 'SELECT U.*, R.reset_token, R.email_address, R.used AS reset_email FROM users AS U JOIN reset_tokens AS R on R.email_address = U.user_email WHERE U.user_email = $1 AND R.reset_token = $2 AND R.used = $3;', [email, token, false]
      'SELECT U.*, R.reset_token, R.email_address, R.used AS reset_email FROM users AS U JOIN reset_tokens AS R on R.email_address = U.user_email WHERE U.id = $1 AND U.user_email = $2 AND R.reset_token = $3 AND R.used = $4;', [verifiedToken.id, email, token, false]
    );

    if (!verifToken.rows[0] || !verifToken) {
      await pool.query(
        'UPDATE reset_tokens SET used = $1 WHERE email_address = $2;', [true, email]
      );
      // update used to false OR tryu to delete the used reset token row
      return res.status(404).json({
        status: "Error. Reset Token not found. Please apply for a new password again.",
        data: {
          allowReset: false
        }
      });
    };
    // console.log("=888-+-+-+-+-+-+-+-+-+-888=");
    // console.log(verifToken.rows);
    // console.log("=888-+-+-+-+-+-+-+-+-+-888=");
    // console.log("-+-+-+-+-+-+-+-+-+-");

    const resetTokenFromDB = verifToken.rows[0].reset_token;
    // console.log(resetTokenFromDB);
    // console.log("----token verification begins----");

    // if (verifToken.rows[0].email_address === email && resetTokenFromDB === token) {
      // verify reset from db with reset token from email
      // verifiedToken = validateResetToken(token, resetTokenFromDB);
    // }

    // console.log("reset verified as true")
    // update reset token has been used
    await pool.query(
      'UPDATE reset_tokens SET used = $1 WHERE email_address = $2;', [true, email]
    );

    return res.json({
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

// *** Insomnia Tested / Passed
// /auth/reset-password
// Public
exports.resetPassword = async (req, res, next) => {
  // user passed in token & email (must match with backend before new passwords confirmed)
  // password 1 & 2 must match in order for the form to submit
  // const { resetToken, email } = req.params;
  // reset token from req.query
  const { token, email } = req.query;
  // const { resetToken, email, password, password2 } = req.body;
  const { password, password2 } = req.body;

  // token id is from the url, so as a param from the front end it is passed into req.body then submitted
  if (!password || !password2) {
    return res.status(400).json({
      status: "Unauthorized! Passwords not submitted."
    })
  }

  if (password !== password2) {
    return res.status(400).json({
      status: "Unauthorized! Passwords do not match."
    })
  }  
  try {
    const verifiedToken = validateResetToken(token);
    // console.log("========verifiedtoken.id========")
    // console.log(verifiedToken.id)
    // console.log("========verifiedtoken.email========")
    // console.log(verifiedToken.email)
    if (!verifiedToken) {
      // update used to false OR tryu to delete the used reset token row
      return res.status(401).json({
        status: "Warning! Reset Token has expired. Please apply for a new password again.",
        data: {
          allowReset: false
        }
      });
    };
    // console.log("beginning to veriftoken from db")
    // get user info and user reset token, also double checking if the token still exists in db
    // if used === true, then token has been previously verified
    const verifToken = await pool.query(
      'SELECT U.*, R.reset_token, R.email_address, R.used AS reset_email FROM users AS U JOIN reset_tokens AS R on R.email_address = U.user_email WHERE U.id = $1AND U.user_email = $2 AND R.reset_token = $3 AND R.used = $4;', [verifiedToken.id, email, token, true]
    );
    
    console.log(verifToken.rows)
    if (!verifToken.rows[0] || !verifToken) {
      // update used to false OR tryu to delete the used reset token row
      return res.status(404).json({
        status: "Error. Reset Token not found. Please apply for a new password again.",
        data: {
          allowReset: false
        }
      });
    };
    const resetTokenIDFromDB = verifToken.rows[0].id;
    const resetTokenFromDB = verifToken.rows[0].reset_token;
    // console.log("---resetTokenIDFromDB===")
    // console.log(resetTokenIDFromDB)
    // console.log("---resetTokenFromDB===")
    // console.log(resetTokenFromDB)

    // Generate new user - encrypt password
    const salt = await bcrypt.genSalt(11);
    // not storing as a obj, but in psqldb
    const encryptedPassword = await bcrypt.hash(password, salt);

    // console.log("---saving new password into db---")
    const updateNewPassword = await pool.query(
      'UPDATE users SET user_password = $1 WHERE user_email = $2 AND id = $3;', [encryptedPassword, verifiedToken.email, verifiedToken.id]
    );
    // console.log("---password saved---")
    // delete reset token after successful use
    await pool.query(
      'DELETE FROM reset_tokens WHERE used = true AND email_address = $1;', [email]
    );
    await PasswordResetSuccessMail(email);

    res.status(200).json({
      status: "Success! Password reset. Please login using new password.",
      // data: {
      //  validToken: validatedToken.rows[0],
      //  allowReset: true
      // }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia Tested / Passed
// successfully tested on postman
// call this route via client usseffect with settimeout to expire before access token actually expires
// refreh-token, call via front end redux or context, not yet working / implemented
// /auth/refresh-token
// Public
exports.authRefreshToken = async (req, res, next) => {
  // res.send("this is the refresh route!");
  // get ref coookie!
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

// *** Insomnia Tested / Passed
// logout - remove refresh token - sucessfully tested on postman!
// /auth/logout
// Public
exports.authLogout = async (req, res, next) => {
  const { refresh } = req.cookies;
  // remove access token from localstorage:
  // console.log("attempting logout of user")
  if (!refresh) return "logout: no refresh cookie exists!"; 
  // verify token to get payload...
  // try {
  //   res.send("you have a cookie!")
  // } catch (err) {
  //   res.send("no cookie");
  // }
  const verifiedRefToken = validateRefreshToken(refresh);

  if (verifiedRefToken === null) {
    res.status(403).send('Failed to verify refresh token.');
    return; // maybe redirect / call logout (handles bu authJWT middleware)
  }
  console.log("logging out:");
  console.log(verifiedRefToken);
  console.log("==============");
  // console.log(verifiedRefToken.refreshTokenId);
  console.log(verifiedRefToken.refreshToken);

  try {
    console.log("refresh token cookie has been verified!");
    // res.send("you have a cookie!")
    // clear existing cookies:
    const clearRefreshToken = await pool.query(
      'UPDATE users SET refresh_token = null WHERE refresh_token = $1 RETURNING *', [verifiedRefToken.refreshToken]
    );
    if (clearRefreshToken.rows[0].refresh_token !== null) {
      return res.status(403).json({ errors: [{ msg: "Unauthorized. Failed to nullify refresh token." }] });
    }

    // console.log(clearRefreshToken.rows[0].refresh_token);
    // res.send("successfully nulled refresh token");
    // res.clearCookie('refresh'); // instead of deleting, override
    res.cookie('refresh', '', { expires: new Date(1) });
    // to effectively "delete" a cookie, one must set the expiration to essentially be maxAge=1
    
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
    //* Foreign keys create constraints that prevent us from deleting parent tables right away, thus delete all child tables (that have foreign keys) first, or give foreign keys null values, then delete parent tables last, another option is to use ON DELETE CASCADE, which seems to do this process automatically but it may lead to errors?
    const findUser = await pool.query(
      'SELECT id from users WHERE id = $1;', [id]
    );

    if (!findUser) {
      res.status(404).json({
        status: "Error. User not found."
      })
    }

    console.log("user found");
    
    //     }
    //   }
    //   await Promise.all(promises);
    // };
    console.log("attempting to delete background image for profile");
    // temporarily comment out this background image section
    let backgroundImageFilename = await pool.query(
      'SELECT background_image_filename FROM profiles WHERE user_id = $1;', [id]
    );
    // if (backgroundImageFilename.rows[0].background_image_filename) {
    if (backgroundImageFilename) {
      console.log("deleting cloudinary background image");
    //   await cloudinary.uploader.destroy(backgroundImageFilename.rows[0].background_image_filename);
    }
    
    // does not select url, thus default image url will not be deleted
    let avatarImageFilename = await pool.query(
      'SELECT user_avatar_filename FROM users WHERE id = $1;', [id]
    );
    if (avatarImageFilename.rows[0].user_avatar_filename) {
      console.log("deleting avatar image from cloudinary");
      // await cloudinary.uploader.destroy(avatarImageFilename.rows[0].user_avatar_filename);
    }

    // if user role = admin || staff remove comments they made
    if (role === 'staff' || role === 'admin') {
      // const deleteAllComments = await pool.query('DELETE FROM comments WHERE user_id = $1;', [id]);
      await pool.query('DELETE FROM comments WHERE user_id = $1;', [id]);
      // if (!deleteAllComments) {
      // res.status(404).json({
      //   status: "Error. User comments  found."
      // })
      // }
    }
    const deleteAllUserReviews = await pool.query('DELETE FROM reviews WHERE user_id = $1;', [id]);
    // const deleteAllPosts = await pool.query('DELETE FROM posts WHERE user_id = $1;', [id]);

    const profileId = await pool.query('SELECT profiles.id FROM profiles WHERE profiles.user_id = $1', [id]);

    // if (profileId.rows[0]) {
    if (profileId) {
      console.log("deleting form user profiles");
      // delete all user profile data
      const deleteProfile = await pool.query('DELETE FROM profiles WHERE user_id = $1;', [id]);
    }

    console.log("deleting useer cart");
    const deleteUserCart = await pool.query(
      "DELETE FROM carts WHERE user_id = $1;", [id]
    );
      
    console.log("deleting user from users");
    // delete user account // deleteUsersTable(id);
    const deleteUser = await pool.query('DELETE FROM users WHERE id = $1;', [id]);

    return res.status(200).json({ msg: "User and associated data has been deleted." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};