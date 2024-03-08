const CustomError = require('../utils/customErrorHandler');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new CustomError(message, 400);
};
const handleJWTError = () =>
  new CustomError('Invalid Token, please login again', 401);
const handleJWTExpiredError = () =>
  new CustomError('Your token has expired,please login again', 401);
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1 /)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new CustomError(message, 400);
};

// const handleValidationErrorDB = (err) => {
//   return new CustomError(err, 400);
// };

const sendErrorDev = (err, req, res) => {
  //a)API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  //a)API
  if (req.originalUrl.startsWith('/api')) {
    //Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      //Programming or other unknown error: don't leak error details
    } else {
      console.log('Error', err);
      return res.status(500).json({
        status: 'error',
        message: 'Something went wrong',
      });
    }
  }
  
};

module.exports = (err, req, res, next) => {
  // 4 arguments including error argument so express knows it's an error handling middleware function
  err.statusCode = err.statusCode || 500; //if it's defined return it, otherwise return 500
  err.status = err.status || 'Error'; //if it's defined return it, otherwise return error

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }; //copy the object
    error.message = err.message;
    // console.log('==================error start=================');
    // console.log(Object.entries(error.errors)[0][1].name);
    // console.log('===================error end=================');
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    // if (Object.entries(error.errors)[0][1].name === 'ValidatorError') {
    //   error = new CustomError(Object.entries(error.errors)[0][1].message, 400);
    // }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, req, res);
  }
};

//Note that handlers are also called controllers in terms of MVC architecture.
