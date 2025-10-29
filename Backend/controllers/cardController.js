
const db = require('../config/db');
const encrypt = require('../utils/cipher').encrypt;
const decrypt = require('../utils/cipher').decrypt;

exports.addCard = async (req, res) => {
    try {
        const { cardNumber , creditLimit} = req.body;
        const userId = req.user.id;
        const encryptedCardNumber = encrypt(cardNumber);

        const query = `INSERT INTO cards (user_id, card_number_encrypted, credit_limit) VALUES (?, ?, ?)`;
        await db.query(query, [userId, encryptedCardNumber, creditLimit]);
        res.status(201).json({ message: 'Card added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.getCards = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `SELECT id, card_number_encrypted, credit_limit, balance, created_at FROM cards WHERE user_id = ?`;
        const [cards] = await db.query(query, [userId]);
        
        const decryptedCards = cards.map(card => {
            const decryptedCardNumber = decrypt(card.card_number_encrypted);
            return {
                id: card.id,
                card_number: decryptedCardNumber.slice(-4),
                credit_limit: card.credit_limit,
                balance: card.balance,
            };
        })

        res.status(200).json(decryptedCards);
        
    }

    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}


exports.getCards2 = async(req,res)=>{

    try{
    const userId = req.user.id;


    const query = `SELECT cc.id, cc.card_number_encrypted, cc.credit_limit, COALESCE(SUM(mb.billed_amount), 0) - COALESCE(SUM(mb.monthly_cleared_amount),0) AS current_balance
    FROM cards cc
    LEFT JOIN monthly_bills mb ON cc.id = mb.card_id
    WHERE cc.user_id = ?
    GROUP BY cc.id;
    `;

    const [cards] = await db.query(query, [userId]);

    const decryptedCards = cards.map(card => {
        const decryptedCardNumber = decrypt(card.card_number_encrypted);
        return {
            id: card.id,
            cardNumber: decryptedCardNumber.slice(-4),
            creditLimit: card.credit_limit,
            currentBalance: card.current_balance ,
            usedLimit: card.current_balance,
            unusedLimit: card.credit_limit - card.current_balance
            
        };
    })
    res.status(200).json(decryptedCards);
}
catch(error){
    res.status(500).json({message:"Server error", error: error.message});
}
}

exports.getCardbyId = async(req,res)=>{
    try{
        const userId = req.user.id;
        const cardId = req.params.cardId;
        const query = `SELECT cc.id, cc.card_number_encrypted, cc.credit_limit, COALESCE(SUM(mb.billed_amount), 0) - COALESCE(SUM(mb.monthly_cleared_amount),0) AS current_balance
    FROM cards cc
    LEFT JOIN monthly_bills mb ON cc.id = mb.card_id
    WHERE cc.user_id = ?
    GROUP BY cc.id;`;
        const [cards] = await db.query(query, [userId, cardId]);
        if(cards.length ===0){
            return res.status(404).json({message:"Card not found"});
        }
        const card = cards[0];

        const billsql = `SELECT id, bill_date, billed_amount, minimum_payment_due, monthly_cleared_amount, created_at FROM monthly_bills WHERE card_id = ? ORDER BY bill_date DESC`;
        const [bills] = await db.query(billsql, [cardId]);
        const decryptedCardNumber = decrypt(card.card_number_encrypted);

        const response = {
            id: card.id,
            cardNumber: decryptedCardNumber.slice(-4),
            creditLimit: card.credit_limit,
            usedLimit: card.current_balance,
            unusedLimit: card.credit_limit - card.current_balance,
            bills: bills
        };  
        res.status(200).json(response);

    }
    catch(error){
        res.status(500).json({message:"Server error", error: error.message});
    }
}