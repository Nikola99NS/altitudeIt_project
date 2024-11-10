const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.use(express.json());
app.use(cors());

app.use('/uploads/images', express.static('uploads/images'));

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000 !!! ');
});