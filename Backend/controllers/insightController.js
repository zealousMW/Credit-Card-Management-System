const db = require('../config/db');
const aiService = require('../services/aiService');


function calculateHistorySummary(bills) {
  if (bills.length === 0) {
    return {
      monthsOfHistory: 0,
      averageMonthlySpending: 0,
      averagePaymentRatio: 0, // Ratio of amount paid vs amount billed
      spendingTrend: 'stable', // 'increasing', 'decreasing', or 'stable'
      isPayingInFull: true,
    };
  }

  const totalBilled = bills.reduce((sum, bill) => sum + parseFloat(bill.billed_amount), 0);
  const totalCleared = bills.reduce((sum, bill) => sum + parseFloat(bill.monthly_cleared_amount), 0);
  
  let isPayingInFull = true;
  bills.forEach(bill => {
      if (parseFloat(bill.monthly_cleared_amount) < parseFloat(bill.billed_amount)) {
          isPayingInFull = false;
      }
  });

  let spendingTrend = 'stable';
  if (bills.length > 1) {
    const latestBill = parseFloat(bills[0].billed_amount); // Assumes DESC order
    const oldestBill = parseFloat(bills[bills.length - 1].billed_amount);
    if (latestBill > oldestBill * 1.1) spendingTrend = 'increasing'; // More than 10% increase
    if (latestBill < oldestBill * 0.9) spendingTrend = 'decreasing'; // More than 10% decrease
  }

  return {
    monthsOfHistory: bills.length,
    averageMonthlySpending: totalBilled / bills.length,
    averagePaymentRatio: totalBilled > 0 ? (totalCleared / totalBilled) : 1,
    spendingTrend,
    isPayingInFull,
  };
}

exports.getInsights = async (req, res) => {
    try {
        const cardId = req.params.cardId;
        const userId = req.user.id;

        const sql=`
            SELECT cc.credit_limit, 
            COALESCE(SUM(mb.billed_amount), 0) - COALESCE(SUM(mb.monthly_cleared_amount),0) AS current_balance
            from cards cc
            LEFT JOIN monthly_bills mb ON cc.id = mb.card_id
            WHERE cc.user_id = ? AND cc.id = ?
            GROUP BY cc.id;
        `;
        const [cards] = await db.query(sql, [userId, cardId]);
        if (cards.length === 0) {
            return res.status(404).json({ message: 'Card not found' });
        }
        const cardData = cards[0];
        const [bills] = await db.query(
            'SELECT billed_amount, monthly_cleared_amount, bill_date FROM monthly_bills WHERE card_id = ? ORDER BY bill_date DESC',
            [cardId]
        );
        const historySummary = calculateHistorySummary(bills);

        const utilization = cardData.credit_limit > 0 ? (cardData.current_balance / cardData.credit_limit) * 100 : 0;
        const insights = await aiService.getFinancialInsights({
            creditLimit: cardData.credit_limit,
            currentBalance: cardData.current_balance,
            utilization: utilization,
            ...historySummary
            

        });
        res.status(200).json(insights);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}


exports.getSpendingTrends = async(req,res)=>{
    try{
        const userId = req.user.id;
        const cardId = req.params.cardId;

        const [cards] = await db.query('SELECT user_id from cards where id = ?',[cardId]);
        if(cards.length ===0 || cards[0].user_id !== userId){
            return res.status(404).json({message:"Card not found"});
        }
        const sql =`
            SELECT 
                bill_date, billed_amount
            FROM
                monthly_bills
            WHERE
                card_id = ?
            ORDER BY
                bill_date ASC;
        `;
        const [bills] = await db.query(sql, [cardId]);
        const trends = bills.map(bill => ({
            date: new Date(bill.bill_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            amount: parseFloat(bill.billed_amount)
        }));
        res.status(200).json(trends);


    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }

}
