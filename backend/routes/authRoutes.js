const express = require('express');
const { register, login, checkVerification, checkPassword, updatePassword, checkTwoFACode, change2FAStatus } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/check-verification', checkVerification)
router.post('/check-password', checkPassword)
router.post('/update-password', updatePassword)
router.post('/check-twoFA-code', checkTwoFACode)
router.post('/change-2fa-status', change2FAStatus)
module.exports = router;