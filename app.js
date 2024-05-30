//app folder where express is created and middlewares are created

const express = require('express');
const morgan = require('morgan'); //for logging
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


// const expressValidator = require('express-validator');

//security middlewares
//allowing cross origin requests

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE',
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend origin
  credentials: true, // Allow cookies for authenticated requests (optional)
  methods: 'GET, POST, PUT, PATCH, DELETE', // Allowed HTTP methods (adjust as needed)
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    checkBody: false,
    // checkQuery: false,
    whitelist: [],
  }),
);
app.use(
  expressLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  }),
);
//cloudinary config

cloudinary.config({
  cloud_name: 'dspbmuxcv',
  api_key: '923466832744118',
  api_secret: 'TwPMUTUEG9jEs2NS5Il_h7_2Aco',
});


//other middlewares

app.use(express.json({ limit: '10kb' })); //limit data to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' })); //middleware to parse url encoded data from the body as we used the html form to send the data and thats way is called url encoded
app.use(cookieParser()); //parses the data from cookies




//handle requests to these routes
app.use('/api/v1/laptops', laptopRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/reviews', reviewRouter);

//the star * means all urls
app.all('*', (req, res, next) => {
  next(new CustomError(`Can't find ${req.originalUrl} on this server!`, 404));

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 404;
  // next(err); //passing and argument to the next function will make express assume that there is an error
});

app.use(errorController);



module.exports = app;
