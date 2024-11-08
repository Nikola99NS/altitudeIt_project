const multer = require('multer');
const path = require('path');
const db = require('../db');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images'); // direktorijum gde će se čuvati slike
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

const uploadProfileImage = upload.single('profileImage');

const updateProfileImage = async(req, res) => {
    const { email } = req.body;

    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const profileImageUrl = `/uploads/images/${req.file.filename}`;
    const sql = 'UPDATE user SET urlSlike = ? WHERE email = ?';
    const [results] = await db.query(sql, [profileImageUrl, email]);
    if (results.affectedRows > 0) {
        res.json({ success: true, profileImageUrl });
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
};

module.exports = { uploadProfileImage, updateProfileImage };