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
// const expressValidator = require('express-validator');

//security middlewares
app.use(cors());
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
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  }),
);

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

// app.use((err, req, res, next) => {
//   if (err instanceof CustomError) {
//     // Handle custom errors with specific status codes
//     res.status(err.statusCode).json({
//       error: err.name,
//       message: err.message,
//     });
//   }
// });

module.exports = app;
