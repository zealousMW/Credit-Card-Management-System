const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const cardRoutes = require('./routes/cardRoutes');

const billRoutes = require('./routes/billRoutes')

const insightRoutes = require('./routes/insightRoutes');

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(cors(allow='*'));

app.use('/api/cards',cardRoutes);
app.use('/api/bills',billRoutes);
app.use('/api/insights',insightRoutes);



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


        const createCardTableQuery = `
        CREATE TABLE IF NOT EXISTS cards (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            card_number_encrypted VARCHAR(255) NOT NULL,
            credit_limit DECIMAL(10, 2) NOT NULL,
            balance DECIMAL(10, 2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`;
        await db.query(createCardTableQuery);
        console.log("Card table ensured.");

        const createMonthlyBillTableQuery = `
        CREATE TABLE IF NOT EXISTS monthly_bills (
            id INT AUTO_INCREMENT PRIMARY KEY,
            card_id INT NOT NULL,
            bill_date DATE NOT NULL,
            billed_amount DECIMAL(10, 2) NOT NULL,
            minimum_payment_due DECIMAL(10, 2) NOT NULL,
            monthly_cleared_amount DECIMAL(10, 2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
        )`;
        await db.query(createMonthlyBillTableQuery);
        console.log("Monthly Bills table ensured.");

        
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