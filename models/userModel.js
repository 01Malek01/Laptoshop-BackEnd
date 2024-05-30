const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validate = require('mongoose-validator');

const emailValidator = validate({
  validator: 'isEmail',
  message: 'Invalid email format', // Custom error message
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 3,
    maxLength: 10,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: emailValidator,
  },
  emailConfirmed: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
  image:{
    type: String,
  },
  passwordUpdatedAt: {
    type: Date,
    default: Date.now(),
  },
  __v: {
    type: Number,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Password confirmation is required'],
    select: false,
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: 'Passwords do not match',
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  //for password resetting
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailConfirmToken: String,

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//hashing password via a pre ((middleware))
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const rounds = 10;
    const salt = await bcrypt.genSalt(rounds);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    this.confirmPassword = undefined;
    next();
  }
  next();
});

userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.passwordUpdatedAt = Date.now() - 1000; //subtract 1 second from the current time to avoid race condition
    console.log(parseInt(this.passwordUpdatedAt.getTime() / 1000, 10));
  }
  next();
});

//compare password and confirm password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordUpdatedAt) {
    const timeStamp = parseInt(this.passwordUpdatedAt.getTime() / 1000, 10);
    return JWTTimestamp < timeStamp;
  }
};

userSchema.methods.generatePasswordResetToken = async function () {
  const randomToken = await crypto.randomBytes(32).toString('hex'); //create random token
  this.passwordResetToken = await crypto //hash the token
    .createHash('sha256')
    .update(randomToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return randomToken;
};

userSchema.methods.generateEmailConfirmToken = async function () {
  const randomToken = await crypto.randomBytes(32).toString('hex'); //create random token
  this.emailConfirmToken = randomToken;
  return randomToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
