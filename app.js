const express = require('express');
const morgan = require('morgan'); // for logging
const laptopRouter = require('./routes/laptopRoutes');
const userRouter = require('./routes/userRoutes');
const cartRouter = require('./routes/cartRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const expressLimiter = require('express-rate-limit');
const CustomError = require('./utils/customErrorHandler');
const errorController = require('./controllers/errorController');
const cloudinary = require('cloudinary').v2;

// Cloudinary config
cloudinary.config({
  cloud_name: 'dspbmuxcv',
  api_key: '923466832744118',
  api_secret: 'TwPMUTUEG9jEs2NS5Il_h7_2Aco',
});

// Security middlewares

// CORS configuration
     const allowedOrigins = [
       'https://*.laptoshop-front-end.vercel.app', // Allow any subdomain
       'http://localhost:3000',
     ];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies for authenticated requests
  methods: 'GET, POST, PUT, PATCH, DELETE', // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
};


app.use(cors(corsOptions));

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    checkBody: false,
    whitelist: [],
  }),
);
app.use(
  expressLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
  }),
);


// Other middlewares
app.use(express.json({ limit: '10kb' })); // Limit data to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Parse URL encoded data
app.use(cookieParser()); // Parse data from cookies

// Logging middleware
app.use(morgan('dev'));

// Routes
app.get('/api/v1', (req, res) => {
  res.status(200).json({ message: 'Welcome to the API' });
});

app.use('/api/v1/laptops', laptopRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/reviews', reviewRouter);

// Handle unknown routes
app.all('*', (req, res, next) => {
  next(new CustomError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(errorController);

module.exports = app;
