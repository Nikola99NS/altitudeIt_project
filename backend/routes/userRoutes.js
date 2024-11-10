const express = require('express');
const { getUsers, updateUserInfo, uploadMiddleware, uploadProfileImage, updateIsActive, get2FAStatus } = require('../controllers/userController');
const router = express.Router();

router.get('/users', getUsers);
router.post('/update-user-info', updateUserInfo)
router.post('/upload-profile-image', uploadMiddleware, uploadProfileImage)
router.post('/updateIsActive', updateIsActive)
module.exports = router;