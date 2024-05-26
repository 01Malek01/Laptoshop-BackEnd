const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const CustomError = require('../utils/customErrorHandler');
const validator = require('validatorjs');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res, sendTokenInHeaders = false) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  if (sendTokenInHeaders) {
    res.set('Authorization', `Bearer ${token}`);
  }

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res,next) => {
  
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    });
    createSendToken(user, 201, res);
  
    
});
exports.login = catchAsync(async (req, res,next) => {
  // try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new CustomError(401, 'Incorrect email or password'));
      // res.status(401).json({
      //   status: 'fail',
      //   message: 'either email or password is incorrect',
      // });
    }
    createSendToken(user, 200, res);
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: 'either email or password is incorrect',
  //   });
  // }
// }
  });

// Protect routes (((middleware)))
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  let decodedUser;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new CustomError(401, 'You are not logged in'));
  }
  // 2) Verification token
  let decodedUserId;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new CustomError(401, 'You are not logged in'));
    }
    decodedUser = decoded;
    decodedUserId = decoded.id;
  });
  // 3) Check if user still exists
  const currentUser = await User.findById(decodedUserId);
  if (!currentUser) {
    return next(new CustomError(401, 'You are not logged in'));
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decodedUser.iat)) {
    //iat = issued at
    return next(new CustomError(401, 'You are not logged in'));
  }

  //pass the user to the next middleware
  req.user = currentUser;
  next();
});


//has a problem to fix
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (
      !(await user.correctPassword(req.body.currentPassword, user.password))
    ) {
      return res.status(401).json({
        status: 'fail',
        message: 'your current password is wrong',
      });
    }
    user.password = req.body.newPassword;
    user.confirmPassword = req.body.confirmNewPassword;
    const modifiedUser = await user.save();
    createSendToken(modifiedUser, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};


exports.forgotPassword = catchAsync(async (req, res,next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new CustomError(404, 'There is no user with that email address'));
  }
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false }); //to not run the validators

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  
    await sendEmail({
      email: user.email,
      subject: 'your password reset token (valid for 10 minutes)',
      message: `forgot your password? submit a patch request with your new password and confirm password to: ${resetUrl}`,
    });
    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    })
  
});

exports.resetPassword = catchAsync(async (req, res,next) => {
    const hashedParamsToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedParamsToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new CustomError(400, 'Token is invalid or has expired'));
    } else if(req.cookie.jwt){
      return next(new CustomError(400, 'You are already logged in'));
    }

    // user.set(
    //   {
    //     password: req.body.password,
    //     confirmPassword: req.body.confirmPassword,
    //     passwordResetToken: undefined,
    //     passwordResetExpires: undefined,
    //   }
    // )
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);

});



exports.confirmMyEmail = catchAsync( async (req, res,next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new CustomError(401, 'You are not logged in'));
  }
  const tokenId = jwt.verify(token, process.env.JWT_SECRET).id;
  const user = await User.findById(tokenId);
  if (!user) {
    return next(new CustomError(404, 'user not found'));
  }
  if (user.emailConfirmed) {
    return next(new CustomError(400, 'Email is already confirmed'));
  } 
    if (user.emailConfirmToken) {
      return next(new CustomError(400, 'Email confirmation link has been already sent'));
    }
  
    const id =  user.id;
    const confirmEmailUrl = `${req.protocol}://${req.get('host')}/api/v1/users/confirmUserEmail/${id}`;
    sendEmail({
      email: user.email,
      subject: 'Confirm your email',
      message:
        'send a patch req to this link to confirm your email: ' +
        confirmEmailUrl,
    });
    res.status(200).json({
      status: 'success',
      message: 'Check your email for confirmation link',
    })
  });

exports.confirmUserEmail = catchAsync (async (req, res,next) => {
  const user = await User.findById(req.params.id);

  if(!user){
    return next(new CustomError(404, 'user not found'));
  }
  if(user.emailConfirmToken){
    return res.status(400).json({
      status: 'fail',
      message: 'confirmation link has been already sent',
    });
  }
  user.emailConfirmed = true;
  user.emailConfirmToken = undefined;
  await user.save();
  res.status(200).json({
    status: 'success',
    message: 'Email confirmed successfully',
  })
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'you do not have permission to perform this action',
      });
    }
    next();
  };
}

exports.logout = catchAsync(async (req,res,next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 2 * 1000),//2 seconds
    httpOnly: true
  });
  res.status(200).json({
    status: 'success'
  })
})