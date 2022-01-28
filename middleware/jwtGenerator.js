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
  // User exists, gen one time link that expires in 30 mins
  // const secret = JWT_SECRET; // + user.password;
  const secret = RESET_TOKEN_SECRET;
  const payload = {
    id: user_id,
    // token: resetSecret,
    email: email
  };
  const token = jwt.sign(payload, secret, { expiresIn: '30m' });
  // const token = jwt.sign(payload, secret, { expiresIn: '300s' });
  return token;
};

function accessTokenGenerator (user_id, role, cart_id) {
  // payload.user.id = must be a value from db
  // role = admin (can access admin only routes), staff, store, user
  const payload = {
    user: {
      id: user_id,
      role: role,
      cartID: cart_id,
      stripeCustId: ''
    }
  }
  return jwt.sign(
    // payload, JWT_SECRET, { expiresIn: '30s' }, // 30secs
    // payload, JWT_SECRET, { expiresIn: '180s' }, // 3m
    // payload, JWT_SECRET, { expiresIn: '1800s' }, //30m
    // payload, JWT_SECRET, { expiresIn: "5 days" }
    payload, JWT_SECRET, { expiresIn: "5d" }
  );
};

function refreshTokenGenerator(user_id, role, refreshTokenId) {
  const payload = {
    id: user_id,
    role: role,
    refreshToken: refreshTokenId
  };
  return jwt.sign(
    // payload, JWT_REFRESH_SECRET, { expiresIn: '300s' }
    // payload, JWT_REFRESH_SECRET, { expiresIn: '1hr' }
    payload, JWT_REFRESH_SECRET, { expiresIn: '7d' }
    // payload, refToken, { expiresIn: '7d' } // then place this into a ccookie
  );
};

async function getAccessTokenFromHeaders(headers) {
  const token = headers['Authorization'];
  return token ? token.split(' ')[1] : null;
}

// for now leave off async await, causes ref cookie to read as undefined....
async function validateRefreshToken(refToken) {
  try {
    const refDecoded = await jwt.verify(refToken, JWT_REFRESH_SECRET);
    return refDecoded;
  } catch (err) {
    console.error('something went wrong with validating the refresh token!');
    return null;
  }
}

function validateResetToken(resetToken) {
  try {
    const resetDecoded = jwt.verify(resetToken, RESET_TOKEN_SECRET);
    return resetDecoded;
  } catch (err) {
    console.error('something went wrong with validating the reset token!');
    return null;
  }
}

// * Reminder: chromium browser security requires cookie option secure to be true in order to create cookie, this applies for development mode as well
function refreshTokenCookieOptions() {
  return {
    // maxAge: 300 * 1000,
    // expires: new Date(Date.now() + 1*60*60*1000), // 1hr
    // expires: new Date(Date.now() + 10*60*1000), // 10min
    expires: new Date(Date.now() + 7*24*60*60*1000), //7d
    // secure: NODE_ENV === 'production' ? true : false,
    secure: NODE_ENV === 'production' ? true : true,
    httpOnly: NODE_ENV === 'production' ? true : false,
    sameSite: NODE_ENV === 'production' ? "strict" : "none",
    // path: '/'
    // * Ensure cookie only interact with specified url, prevents 401 loop when err occurs but auth still valid
    path: '/api/auth/refresh-token'
  }
};

const refreshToken = async () => {
  const refTokenRenew = await axios.post('auth/refresh-token');
  return refTokenRenew;
}

module.exports = { refreshTokenString, resetTokenGenerator, accessTokenGenerator, refreshTokenGenerator, getAccessTokenFromHeaders, validateRefreshToken, validateResetToken, refreshTokenCookieOptions, refreshToken };