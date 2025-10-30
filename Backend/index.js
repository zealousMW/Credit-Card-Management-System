const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const cardRoutes = require('./routes/cardRoutes');

const billRoutes = require('./routes/billRoutes')

const insightRoutes = require('./routes/insightRoutes');

const categoryRoutes = require('./routes/categoryRoutes');


const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(cors(allow='*'));


app.use('/api/categories', categoryRoutes);
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

        const createCategoryTableQuery = `
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE
    )`;
        await db.query(createCategoryTableQuery);
        console.log("Category table ensured.");

        const createMonthlyBillTableQuery = `
        CREATE TABLE IF NOT EXISTS monthly_bills (
            id INT AUTO_INCREMENT PRIMARY KEY,
            card_id INT NOT NULL,
            category_id INT,
            bill_date DATE NOT NULL,
            billed_amount DECIMAL(10, 2) NOT NULL,
            minimum_payment_due DECIMAL(10, 2) NOT NULL,
            monthly_cleared_amount DECIMAL(10, 2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        )`;
        await db.query(createMonthlyBillTableQuery);
        console.log("Monthly Bills table ensured.");

        const [cats] = await db.query('SELECT COUNT(*) AS count FROM categories');
        if(cats[0].count ===0){
            const defaultCategories = ['Groceries', 'Utilities', 'Entertainment', 'Travel', 'Dining', 'Healthcare', 'Education', 'Shopping', 'Fuel', 'Miscellaneous'];
            for(const category of defaultCategories){
                await db.query('INSERT INTO categories (name) VALUES (?)',[category]);
            }
            console.log("Default categories inserted.");
        }

        
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