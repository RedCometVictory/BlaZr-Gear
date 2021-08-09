require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const path = require('path');
// import { notFound, errorHandler } from './middleware/errorMiddleware';
// const { notFound, errorHandler } = require('./middleware/errorMiddleware');

app.use(cookieParser());
const pool = require ('./config/db');

// heroku address
const HOST = process.env.HEROKU_DOMAIN;
let whiteList;

if (process.env.NODE_ENV === 'production') {
  whiteList = [HOST];
}

if (process.env.NODE_ENV === 'development') {
  whiteList = ['http://localhost:3000'];
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
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
// const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Init Middleware /Parse JSON (access req.body)
app.use(express.json({
  // extended: false
}));

// send data - backend npm run server (nodemon)
if (process.env.NODE_ENV === 'development') {
  app.get('/', async (req, res, next) => res.send("API is running..."));
};

// define routes (to controllers) - change proxy to reflect url
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes); // '/users' = '/'

// PAYPAL
// app.get('/api/config/paypal', (req, res) => {
//   res.send(process.env.PAYPAL_CLIENT_ID);
// });

// uploads go to cloudinary

// Serve static assets in production - USE IN PRODUCTION DEPLOYMENT
if (process.env.NODE_ENV === 'production') {
  // Set static folder - use in PRODUCTION DEPLOYMENT
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// app.use(notFound);
// app.use(errorHandler);

// database server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port: ${PORT}`));