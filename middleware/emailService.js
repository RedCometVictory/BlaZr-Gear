require("dotenv").config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const baseURL = process.env.NODE_ENV === "production" ? 'https://blazrgear.herokuapp.com/' : 'http://localhost:3000';

/*
Be mindful of gmail security, tends to default after some time of activity, need 'less secure' and Gmail API enabled
*/

const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const OAUTH_REFRESH_TOKEN = process.env.OAUTH_REFRESH_TOKEN;
const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
// console.log("email services");
// console.log("^^^^^server / company email^^^^^^");
// console.log(EMAIL_ADDRESS);
// console.log("^^^^^^^^^^^");
// console.log(EMAIL_PASSWORD);

const createTransporter = async () => {
  // console.log("creating transport");
  const OAuth2Client = new OAuth2(
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

//   const url = OAuth2Client.generateAuthUrl({
//   // 'online' (default) or 'offline' (gets refresh_token)
//   access_type: 'offline',

//   // If you only need one scope you can pass it as a string
//   // scope: scopes
// });
   
  OAuth2Client.setCredentials( { refresh_token: OAUTH_REFRESH_TOKEN } );
  // console.log("OAuth2Client");
  // console.log(OAuth2Client);

  // 'online' (default) or 'offline' (gets refresh_token)
  // access_type: 'offline',
  // console.log("generating access token");
  // failed to generate a acccess token
  const accessToken = await new Promise((resolve, reject) => {
    OAuth2Client.getAccessToken((err, token) => {
      if (err) {
        reject(`Failed to create access token. Err: ${err} `);
      }
      // console.log(accessToken);
      // console.log(token);
      resolve(token);
    });
  });

  // console.log("nodemailer creating transport");
  let transport = nodemailer.createTransport({
    service: 'gmail',
    // uncomment if "unauthorized client" err occurs
    // tls: {
      // rejectUnauthorized: false
    // },
    auth: {
      type: "OAuth2",
      user: EMAIL_ADDRESS,
      // pass: EMAIL_PASSWORD,
      accessToken,
      clientId: OAUTH_CLIENT_ID,
      clientSecret: OAUTH_CLIENT_SECRET,
      refreshToken: OAUTH_REFRESH_TOKEN
    }
  });
  // console.log(transport);
  transport.verify((err, success) => {
 err
   ? console.error(err)
   : console.error(`=== Server is ready to take messages: ${success} ===`);
});
  return transport;
};

const signedUpMail = async (email) => {
  // console.log("^^^^^email to send message to^^^^^^");
  // console.log(email);
  try {
    // console.log("creating transporter");
    let transport = await createTransporter();
    // console.log("transporter created");
    
    // console.log("mailing options");
    const mailOptions = {
      from: `Support At ${EMAIL_ADDRESS}`,
      to: email,
      subject: "Welcome to Blazr Gear",
      html: `<h1>Welcome!</h1>
      <p>Congrats, you have successfully registered as a Blazr Gear member!</p>`
    };
    // console.log(mailOptions);
    // console.log("==========EMAIL==========");
    
    // console.log("sending email to address");
    await transport.sendMail(mailOptions);
    // console.log("email sent address");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

const forgotPasswordMail = async (resetToken, email) => {
  try {
    let transport = await createTransporter();
    
    const mailOptions = {
      from: `Support At ${process.env.EMAIL_ADDRESS}`,
      to: email,
      subject: "Forgot Password / Reset Password",
      html: `<p>Please click on the link below to reset your password. This link will expire in 30 minutes.<br/><a href="${baseURL}/reset-password?token=${resetToken}&email=${email}">Reset Password</a></p>`
    };

    const res = await transport.sendMail(mailOptions);
    return res;
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

const PasswordResetSuccessMail = async (email) => {
  try {
    let transport = await createTransporter();
    
    const mailOptions = {
      from: `Support At ${process.env.EMAIL_ADDRESS}`,
      to: email,
      subject: "Successful Password Reset",
      html: `<p>Your password has been successfully changed. We look forward to doing business with you!</p>`
    };
    
    await transport.sendMail(mailOptions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

const bannedAccountMail = async (email) => {
  try {
    let transport = await createTransporter();
    // console.log("888888888888888888888888888888");
    // console.log("888888888888888888888888888888");
    // console.log("banned mail");
    // console.log(email);
    // console.log("888888888888888888888888888888");
    // console.log("888888888888888888888888888888");

    const mailOptions = {
      from: `Support At ${process.env.EMAIL_ADDRESS}`,
      to: email,
      subject: "Your Account is Banned / Under Review",
      html: `<div>
        <p>Your account is currently banned from our service and/or may currently be under review.</p>
        <p>If you have any questions or would like to dispute this ban status please contact support services at blazrgear@gmail.com</p>
        <p>You will be notified if your ban status is lifted. Apologies for the inconvenience.</p> 
      </div>`
    };

    // const res = await transport.sendMail(mailOptions);
    await transport.sendMail(mailOptions);
    // return res;
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

module.exports = { signedUpMail, forgotPasswordMail, PasswordResetSuccessMail, bannedAccountMail };
// Note: The OAuth Playground will automatically revoke refresh tokens after 24h. You can avoid this by specifying your own application OAuth credentials using the Configuration panel.