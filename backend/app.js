const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware za parsiranje JSON-a
app.use(express.json());

// Osnovna ruta
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Pokretanje servera
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});