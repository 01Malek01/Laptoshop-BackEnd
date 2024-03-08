const express = require('express');
const { protect, signUp, login, updatePassword, forgotPassword, resetPassword, confirmMyEmail, confirmUserEmail, logout } = require('../controllers/authController');
const { getAllUsers, getUser, updateMe } = require('../controllers/userController');
const router = express.Router();

router.get('/',getAllUsers);
router.post('/signup' ,signUp);
router.post('/login',login);
router.post('/logout',logout);

router.post('/updateMe', protect, updateMe);
router.patch('/updatePassword', protect, updatePassword);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.post('/confirmMyEmail/',protect, confirmMyEmail);
router.patch('/confirmUserEmail/:id', confirmUserEmail);

router.get('/me', protect, getUser);

module.exports = router;