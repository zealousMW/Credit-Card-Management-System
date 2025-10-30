const db = require('../config/db');


exports.addBill = async(req , res)=>{

    try{
    const {cardId, billDate, billedAmount, minPaymentDue, categoryId} = req.body;
    const userid = req.user.id;

    const [card] = await db.query('SELECT user_id from cards where id = ?',[cardId]);

    if(card.length ===0 || card[0].user_id !== userid){
        return res.status(404).json({message:"Card not found"});
    }

    const insertQuery =`INSERT INTO monthly_bills (card_id,bill_date, billed_amount,minimum_payment_due, category_id) VALUES (?,?,?,?,?)`;
    await db.query(insertQuery,[cardId, billDate, billedAmount, minPaymentDue,categoryId]);

    return res.status(201).json({message:"Bill added successfully"});

    }   catch(error){
        res.status(500).json({message:"Server error", error: error.message});   



}
}

exports.makePayment = async(req,res)=>{
    try{
        const { paymentAmount} = req.body;
        const billId = req.params.billId;
        const userId = req.user.id;
        const [bills] = await db.query(`
            SELECT mb.id, mb.card_id, mb.billed_amount, mb.monthly_cleared_amount
            FROM monthly_bills mb
            JOIN cards cc ON mb.card_id = cc.id
            WHERE mb.id = ? AND cc.user_id = ?
        `, [billId, userId]);
        if(bills.length ===0){
            return res.status(404).json({message:"Bill not found"});
        }
        const bill = bills[0];
        if(isNaN(paymentAmount) || paymentAmount <=0){
            return res.status(400).json({message:"Invalid payment amount"});
        }
        const sql = `UPDATE monthly_bills 
                     SET monthly_cleared_amount = monthly_cleared_amount + ? 
                     WHERE id = ?`;
        await db.query(sql, [paymentAmount, billId]);
        res.status(200).json({message:"Payment made successfully"});
    }
    catch(error){
        res.status(500).json({message:"Server error", error: error.message});
    }



}
