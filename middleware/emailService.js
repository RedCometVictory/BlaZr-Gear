require("dotenv").config();
const nodemailer = require('nodemailer');
const baseURL = process.env.NODE_ENV === "production" ? 'https://blazrgear.herokuapp.com/' : 'http://localhost:3000';

const signedUpMail = async (email) => {
  try {
    let transport = await nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    const mailOptions = {
      from: `Support At ${process.env.EMAIL_ADDRESS}`,
      to: email,
      subject: "Welcome to Blazr Gear",
      html: `<h1>Welcome!</h1>
             <p>Congrats, you have successfully registered as a Blazr Gear member!</p>`
    };
    const res = await transport.sendMail(mailOptions);
    return res;
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

const forgotPasswordMail = async (resetToken, email) => {
  try {
    let transport = await nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
      }
    });
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
    let transport = await nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    const mailOptions = {
      from: `Support At ${process.env.EMAIL_ADDRESS}`,
      to: email,
      subject: "Successful Password Reset",
      html: `<p>Your password has been successfully changed. We look forward to doing business with you!</p>`
    };
    const res = await transport.sendMail(mailOptions);
    return res;
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};
module.exports = { signedUpMail, forgotPasswordMail, PasswordResetSuccessMail };