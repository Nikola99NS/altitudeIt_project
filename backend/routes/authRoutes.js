const express = require('express');
const { register, login, checkVerification, checkPassword, updatePassword } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/check-verification', checkVerification)
router.post('/check-password', checkPassword)
router.post('/update-password', updatePassword)

module.exports = router;