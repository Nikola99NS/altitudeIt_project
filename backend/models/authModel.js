const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');



const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};

const validatePassword = async(password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null; // Vraća null ako token nije validan
    }
};

module.exports = {
    generateToken,
    validatePassword,
    verifyToken
}