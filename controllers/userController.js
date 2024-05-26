const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const cloudinary = require('cloudinary').v2;

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  
    res.status(200).json({
      status: 'success',
      data: {
        user,
    },
  });
});

exports.updatePhoto = async (req, res, next) => {
  if(req.file){

    try {
      // You can save the Cloudinary URL or other relevant data to your database
      // console.log('File uploaded to Cloudinary:', result.secure_url);
      const image = req.file;
      const user = await User.findById(req.user._id);
      //convert image to base64
      const base64Image = Buffer.from(image.buffer).toString('base64');
      //mime type is the type of image like jpeg
      //we passed the base64 image to the dataURI which represents the image
      const dataURI = `data:${image.mimetype};base64,${base64Image}`;
      const result = await cloudinary.uploader.upload(dataURI);
      user.image = result.secure_url;
      await user.save();
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).send('Error uploading file.');
    }
  }
}
