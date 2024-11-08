const express = require('express');
const { uploadProfileImage, updateProfileImage } = require('../controllers/uploadController');
const router = express.Router();

router.post('/upload-profile-image', uploadProfileImage, updateProfileImage);

module.exports = router;