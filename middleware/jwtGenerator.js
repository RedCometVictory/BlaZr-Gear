require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET;
const NODE_ENV = process.env.NODE_ENV;

const refreshTokenString = () => {
  // for new refresh token - token crypto string
  return crypto.randomBytes(64).toString('hex');
}

function resetTokenGenerator (user_id, email) {
// function resetTokenGenerator (resetSecret, email) {
  // User exists, gen one time link that expires in 30 mins
  // const secret = JWT_SECRET; // + user.password;
  const secret = RESET_TOKEN_SECRET;
  const payload = {
    id: user_id,
    // token: resetSecret,
    email: email
  };
  const token = jwt.sign(payload, secret, { expiresIn: '30m' });

  return token;
};

function accessTokenGenerator (user_id, role, cart_id) {
  // payload.user.id = must be a value from db
  // role = admin (can access admin only routes), staff, store, user
  const payload = {
    user: {
      id: user_id,
      role: role,
      cartID: cart_id
    }
  }
  return jwt.sign(
    // expires in 15 mins or 900s, 30s for testing
    // payload, JWT_SECRET, { expiresIn: '1800s' }, //30m
    // payload, JWT_SECRET, { expiresIn: '180s' },
    payload, JWT_SECRET, { expiresIn: "5 days" }
  );
};

// function refreshTokenGenerator(user_id) {
function refreshTokenGenerator(user_id, role, refreshTokenId) {
  // const refTokenVal = randomTokenString();
  // payload.user.id = must be a value from db
  // const payload = { refreshTokenId };
  const payload = {
    id: user_id,
    role: role,
    refreshToken: refreshTokenId
  };
  // return refToken;
  // const payload = refToken;
  return jwt.sign(
    // payload, JWT_REFRESH_SECRET, { expiresIn: '1hr' }
    // payload, JWT_REFRESH_SECRET, { expiresIn: '300s' }
    payload, JWT_REFRESH_SECRET, { expiresIn: '7d' }
    // payload, refToken, { expiresIn: '7d' } // then place this into a ccookie
  );
};

async function getAccessTokenFromHeaders(headers) {
  const token = headers['Authorization'];
  return token ? token.split(' ')[1] : null;
}

// for now leave off async await, causes ref cookie to read as undiefined....
function validateRefreshToken(refToken) {
// async function validateRefreshToken(refToken) {
  try {
    // may need await here
    const refDecoded = jwt.verify(refToken, JWT_REFRESH_SECRET);
    // becuz payload stored value in a obj
    // return refDecoded.refreshToken;
    return refDecoded;
    // return { "refString": refDecoded.refTokenVal }; // mayneed to be payload
  } catch (err) {
    console.error('something went wrong with validating the refresh token!');
    return null;
  }
}

// function validateResetToken(resetSecret, resetTokenFromDB) {
function validateResetToken(resetToken) {
// async function validateRefreshToken(refToken) {
  try {
    // TODO reset token verif fails due to originally using JWT_SECRET to generate reset token, need to compare it to JWT_SECRET here instead of the toke from the database it seems, when signed a reset token is saved (and stored in db), compare token in url to token from db, if matched then verify against JWT_Secrt???
    // may need await here
    const resetDecoded = jwt.verify(resetToken, RESET_TOKEN_SECRET);
    // const resetDecoded = jwt.verify(resetToken, resetTokenFromDB);
    // becuz payload stored value in a obj
    return resetDecoded;
    // return { "refString": refDecoded.refTokenVal }; // mayneed to be payload
  } catch (err) {
    console.error('something went wrong with validating the reset token!');
    return null;
  }
}

// const refreshOptions = {
      // expires: new Date(Date.now() + 120*1000), // 120sec
      // expires: new Date(Date.now() + 7*24*60*60*1000), //7d
      // secure: NODE_ENV === 'production' ? true : false,
      // httpOnly: NODE_ENV === 'production' ? true : false,
      // sameSite: 'strict'
    // };
function refreshTokenCookieOptions() {
  // const refreshOptions = {
  return {
    // maxAge: 300 * 1000,
    // expires: new Date(Date.now() + 1*60*60*1000), // 1hr
    // expires: new Date(Date.now() + 300*1000), // 120sec
    expires: new Date(Date.now() + 7*24*60*60*1000), //7d
    secure: NODE_ENV === 'production' ? true : false,
    httpOnly: NODE_ENV === 'production' ? true : false,
    sameSite: NODE_ENV === 'production' ? "strict" : "none"
  }
  // return refreshOptions;
};

// exports.refreshToken = () => {
  // call to axios.post('users/refresh-token');
  // find usser credentials in db, bu user id, generate refresh token for that user, update db (place token into it) then call to:
  // startRefreshTokenTimer();
  // return;
// }

module.exports = { refreshTokenString, resetTokenGenerator, accessTokenGenerator, refreshTokenGenerator, getAccessTokenFromHeaders, validateRefreshToken, validateResetToken, refreshTokenCookieOptions };

/*
// helper functions
let refreshTokenTimeout;
function startRefreshTokenTimer() {
  // parse json object from base64 encoded jwt token
  const jwtToken = JSON.parse(atob(userSubject.value.jwtToken.split('.')[1]));

  // set a timeout to refresh the token a minute before it expires
  const expires = new Date(jwtToken.exp * 1000);
  const timeout = expires.getTime() - Date.now() - (60 * 1000);
  refreshTokenTimeout = setTimeout(refreshToken, timeout);
}

function stopRefreshTokenTimer() {
  clearTimeout(refreshTokenTimeout);
}


  return jwt.sign(
    payload, JWT_REFRESH_SECRET, { expiresIn: '7 days' },
    (err, token) => {
      if (err) throw err;
      // reject(createError.InternalServerError());
    }
  ); 


*/

/* EXAMPLE IF JWT GENERATION
import jwt from 'jsonwebtoken'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

export default generateToken

*/

/*
 async forgotPassword(email) {
    const user = await getUserByEmailDb(email);

    if (user) {
      try {
        await setTokenStatusDb(email);

        //Create a random reset token
        var fpSalt = crypto.randomBytes(64).toString("base64");

        //token expires after one hour
        var expireDate = moment().add(1, "h").format();

        await createResetTokenDb({ email, expireDate, fpSalt });

        await mail.forgotPasswordMail(fpSalt, email);
      } catch (error) {
        throw new ErrorHandler(error.statusCode, error.message);
      }
    } else {
      throw new ErrorHandler(400, "Email not found");
    }
  }*/