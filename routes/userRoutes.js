
const express = require('express');
const {
  protect,
  signUp,
  login,
  updatePassword,
  forgotPassword,
  resetPassword,
  confirmMyEmail,
  confirmUserEmail,
  logout,
} = require('../controllers/authController');
const {
  getAllUsers,
  getUser,
  updateMe,
  updatePhoto,
} = require('../controllers/userController');

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

const storage = multer.memoryStorage(); // Store the uploaded file in memory
const upload = multer({ storage }); // Create a Multer instance with the storage configuration

// Handle file upload
// router.post('/uploadProfileImage', upload.single('image'),);
router.get('/', getAllUsers);
router.post('/signup', signUp);
router.post('/login', login);
router.post('/logout', logout);

router.patch('/updateMe', protect, updateMe);
router.post('/updatePhoto', protect,upload.single('image'), updatePhoto);
router.patch('/updatePassword', protect, updatePassword);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.post('/confirmMyEmail/', protect, confirmMyEmail);
router.patch('/confirmUserEmail/:id', confirmUserEmail);

router.get('/me', protect, getUser);

module.exports = router;
