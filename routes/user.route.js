const express = require('express');
const { home, register, login, logout, getUser, loginStatus, updateUser, changePassword, forgotPassword, resetPassword } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const router = express.Router();

router.get('/home', home);
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/getUser', protect, getUser);
router.get('/loginStatus', loginStatus);
router.put('/updateUser', protect, updateUser);
router.put('/changePassword', protect, changePassword);
router.post('/forgotPassword', forgotPassword);
router.put('/resetPassword/:resetToken', resetPassword);

module.exports = router;