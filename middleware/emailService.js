require("dotenv").config();
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const baseURL = process.env.NODE_ENV === "production" ? 'https://blazrgear.herokuapp.com/' : 'http://localhost:3000';


const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const SENDGRID_API_SECRET_KEY = process.env.SENDGRID_API_SECRET_KEY;

const createTransporter = async () => {
  let transport = nodemailer.createTransport(sendgridTransport({
    auth: {
      api_key: SENDGRID_API_SECRET_KEY
    }
  }));

  transport.verify((err, success) => {
    err
    ? console.error(err)
    : console.log(`=== Server is ready to take messages: ${success} ===`);
  });
  return transport;
};


const signedUpMail = async (email) => {
  try {
    let transport = await createTransporter();

    const mailOptions = {
      from: `Support At ${EMAIL_ADDRESS}`,
      to: email,
      subject: "Welcome to Blazr Gear",
      html: `<h1>Welcome!</h1>
      <p>Congrats, you have successfully registered as a Blazr Gear member!</p>`
    };

    await transport.sendMail(mailOptions)
      .then(console.log('Success!'))
      .catch(err => console.log(err));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

const forgotPasswordMail = async (resetToken, email) => {
  try {
    let transport = await createTransporter();
    
    const mailOptions = {
      from: `Support At ${EMAIL_ADDRESS}`,
      to: email,
      subject: "Forgot Password / Reset Password",
      html: `<p>Please click on the link below to reset your password. This link will expire in 30 minutes.<br/><a href="${baseURL}/reset-password?token=${resetToken}&email=${email}">Reset Password</a></p>`
    };

    const res = await transport.sendMail(mailOptions)
      .then(console.log('Success!'))
      .catch(err => console.log(err));
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
      from: `Support At ${EMAIL_ADDRESS}`,
      to: email,
      subject: "Successful Password Reset",
      html: `<p>Your password has been successfully changed. We look forward to doing business with you!</p>`
    };
    
    await transport.sendMail(mailOptions)
      .then(console.log('Success!'))
      .catch(err => console.log(err));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

const bannedAccountMail = async (email) => {
  try {
    let transport = await createTransporter();

    const mailOptions = {
      from: `Support At ${EMAIL_ADDRESS}`,
      to: email,
      subject: "Your Account is Banned / Under Review",
      html: `<div>
        <p>Your account is currently banned from our service and/or may currently be under review.</p>
        <p>If you have any questions or would like to dispute this ban status please contact support services at blazrgear@gmail.com</p>
        <p>You will be notified if your ban status is lifted. Apologies for the inconvenience.</p> 
      </div>`
    };

    await transport.sendMail(mailOptions)
      .then(console.log('Success!'))
      .catch(err => console.log(err));
    // return res;
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// --------------- REFUND & PURCHASE --------------------------
const purchaseRefundMail = async (email, orderId, firstName) => {
  try {
    let transport = await createTransporter();

    const mailOptions = {
      from: `Support At ${EMAIL_ADDRESS}`,
      to: email,
      subject: "Your Purchase Refund",
      html: `<div>
        <h2>Greetings ${firstName},</h2>
        <p>Your purchase for Order# ${orderId} has been successfully refunded.</p>
        <p>If you have any further questions please contact support services at blazrgear@gmail.com</p>
      </div>`
    };

    await transport.sendMail(mailOptions)
      .then(console.log('Success!'))
      .catch(err => console.log(err));
    // return res;
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

const orderConfirmationMail = async (email, orderId, firstName) => {
  try {
    let transport = await createTransporter();

    const mailOptions = {
      from: `Support At ${EMAIL_ADDRESS}`,
      to: email,
      subject: "Order Confirmation",
      html: `<div>
        <h2>Greetings ${firstName},</h2>
        <p>Order#: ${orderId}</p>
        <p>Your purchase was successful. You can review it under "My Orders" when signed in under your account that made the purchase.</p>
        <p>If you have any questions please contact support services at blazrgear@gmail.com</p>
      </div>`
    };

    await transport.sendMail(mailOptions)
      .then(console.log('Success!'))
      .catch(err => console.log(err));
    // return res;
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};



module.exports = { signedUpMail, forgotPasswordMail, PasswordResetSuccessMail, bannedAccountMail, purchaseRefundMail, orderConfirmationMail };