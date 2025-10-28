const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const cardRoutes = require('./routes/cardRoutes');

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(cors(allow='*'));

app.use('/api/cards',cardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});


app.use('/api/auth',authRoutes);


app.use((req, res) => {
    console.log(req.path);

})

const intilializeDB = async () =>{
    try {
        const createUserTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        await db.query(createUserTableQuery);
        console.log("User table ensured.");
    } catch (error) {
        console.error("DB Connection Failed:", error);
    }
}



const startServer = async () => {
    await intilializeDB();
    app.listen(port, () => {
        console.log(`Server is running on port http://localhost:${port}`);
    });
};
startServer();