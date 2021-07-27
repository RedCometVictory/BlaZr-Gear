require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');
const path = require('path');

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
}
// server can interact with client
app.use(cors({
    origin: whiteList,
    credentials: true // for cookies exchanged w/frontend
}));

// Routes
const authRoutes = require('./routes/authRoutes');
const postsRoutes = require('./routes/postsRoutes');
const profileRoutes = require('./routes/profileRoutes');
const usersRoutes = require('./routes/usersRoutes');

// Init Middleware /Parse JSON (access req.body)
app.use(express.json({/* extended: false */}));

// send data - backend npm run server (nodemon)
if (process.env.NODE_ENV === 'development') {
  app.get('/', async (req, res, next) => res.send("API is running..."));
};

// define routes (to controllers) - change proxy to reflect url
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', usersRoutes); // '/users' = '/'

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
app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));