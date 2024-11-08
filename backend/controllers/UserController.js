const userModel = require('../models/userModel');
const db = require('../db');
const multer = require('multer');

const getUsers = async(req, res) => {
    try {
        const users = await userModel.getUsers();
        res.json(users);
    } catch {
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
}

const updateUserInfo = async(req, res) => {
    const { email, name, surname, birthdate } = req.body;

    try {
        const response = await userModel.valuesForUpdate(email, name, surname, birthdate);

        // Ako nema polja za ažuriranje, vraćamo poruku
        if (response.values.length === 1) {
            return res.status(400).json({ success: false, message: "No fields to update" });
        }
        // Izvršavanje SQL upita
        const [result] = await db.query(response.sql, response.values)
        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        // Hvatanje bilo kakve greške tokom obrade
        console.error("Error in update-user-info route:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Konfiguracija za čuvanje slika
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images'); // direktorijum gde će se čuvati slike
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const uploadMiddleware = multer({ storage }).single('profileImage'); // Middleware za upload fajla

const uploadProfileImage = async(req, res) => {
    const { email } = req.body;

    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const profileImageUrl = `/uploads/images/${req.file.filename}`;
        const results = await userModel.uploadProfileImage(email, profileImageUrl);

        if (results.affectedRows > 0) {
            console.log('Profile image updated successfully');
            res.json({ success: true, profileImageUrl });
        } else {
            console.log('User not found');
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error("Error updating profile image:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const updateIsActive = async(req, res) => {
    const { userId, isActive } = req.body;
    try {
        const [response] = await userModel.updateIsActive(userId, isActive);

        if (response.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false })
        }

    } catch (error) {
        //     console.error("Error updating user status:", error);
        res.status(500).json({ success: false, message: "Database update failed" });
    }
}

module.exports = { getUsers, updateUserInfo, uploadMiddleware, uploadProfileImage, updateIsActive };