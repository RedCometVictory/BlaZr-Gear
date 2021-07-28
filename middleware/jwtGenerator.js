require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const NODE_ENV = process.env.NODE_ENV;

const refreshTokenString = () => {
  // for new refresh token - token crypto string
  return crypto.randomBytes(64).toString('hex');
}

function accessTokenGenerator (user_id) {
  // payload.user.id = must be a value from db
  const payload = {
    user: {
      id: user_id
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
function refreshTokenGenerator(refreshTokenId) {
  // const refTokenVal = randomTokenString();
  // payload.user.id = must be a value from db
  const payload = { refreshTokenId };
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
    return refDecoded.refreshTokenId;
    // return { "refString": refDecoded.refTokenVal }; // mayneed to be payload
  } catch (err) {
    console.error('something went wrong with validating the refresh token!');
    return null;
  }
}

function refreshTokenCookieOptions() {
  // const refreshOptions = {
  return {
      // maxAge: 300 * 1000,
      // expires: new Date(Date.now() + 1*60*60*1000), // 1hr
      // expires: new Date(Date.now() + 300*1000), // 120sec
      expires: new Date(Date.now() + 7*24*60*60*1000), //7d
      secure: NODE_ENV === 'production' ? true : false,
      httpOnly: NODE_ENV === 'production' ? true : false,
      // sameSite: 'strict'
  }
  return refreshOptions;
};

// exports.refreshToken = () => {
  // call to axios.post('users/refresh-token');
  // find usser credentials in db, bu user id, generate refresh token for that user, update db (place token into it) then call to:
  // startRefreshTokenTimer();
  // return;
// }

module.exports = { refreshTokenString, accessTokenGenerator, refreshTokenGenerator, getAccessTokenFromHeaders, validateRefreshToken, refreshTokenCookieOptions };

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