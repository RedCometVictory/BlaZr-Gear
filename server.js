require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const path = require('path');

app.use(cookieParser());
const pool = require ('./config/db');

// heroku address
const HOST = process.env.HEROKU_DOMAIN;
let whiteList;
//  'https://www.sandbox.paypal.com'
if (process.env.NODE_ENV === 'production') {
  whiteList = [HOST, 'https://www.sandbox.paypal.com', 'https://api.mapbox.com/'];
}

if (process.env.NODE_ENV === 'development') {
  whiteList = ['http://localhost:3000', 'https://www.sandbox.paypal.com', 'https://api.mapbox.com/'];
  app.use(morgan('dev'));
}
// server can interact with client
app.use(cors({
    origin: whiteList,
    credentials: true // for cookies exchanged w/frontend
}));

// Routes
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const slideRoutes = require('./routes/slideRoutes');
const imageRoutes = require('./routes/imageRoutes');

// Init Middleware /Parse JSON (access req.body)
app.use(express.json({
  // extended: false
}));

// send data - backend npm run server (nodemon)
if (process.env.NODE_ENV === 'development') {
  app.get('/', async (req, res, next) => res.send("API is running..."));
};

// const Environment = process.env.NODE_ENV === "production" ? paypalSDK.core.LiveEnvironment : paypalSDK.core.SandboxEnvironment;
// const paypalClient = new paypalSDK.core.PayPalHttpClient(
//   new Environment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET)
// );

// define routes (to controllers) - change proxy to reflect url
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes); // '/users' = '/'
app.use('/api/payment', paymentRoutes);
app.use('/api/slides', slideRoutes);
app.use('/api/images', imageRoutes);

// PAYPAL - configure order
// app.get('/api/config/google-api-key', (req, res) => {
//   res.send(process.env.GOOGLE_API_KEY);
// });
app.get('/api/config/mapbox', (req, res) => {
  res.send(process.env.MAPBOX_API_PUBLIC_KEY);
});

// uploads go to cloudinary

// Serve static assets in production - USE IN PRODUCTION DEPLOYMENT
if (process.env.NODE_ENV === 'production') {
  // Set static folder - use in PRODUCTION DEPLOYMENT
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// database server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port: ${PORT}`));