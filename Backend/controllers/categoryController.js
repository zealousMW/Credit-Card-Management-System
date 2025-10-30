const db = require('../config/db');

exports.getAllCategories = async (req, res) => {
    try {
        console.log('Fetching all categories');
        const [categories] = await db.query('SELECT id, name FROM categories');
        console.log('Categories fetched:', categories);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getSpendingByCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const cardId = req.params.cardId;
        const {period} = req.query; // 3m, 6m, all
        let dateCondition = '';

        if (period === '3m') {
            dateCondition = 'AND mb.bill_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)';
        } else if (period === '6m') {   
            dateCondition = 'AND mb.bill_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)';
        }
        const sql = `Select c.id, c.name, COALESCE(SUM(mb.billed_amount),0) AS total_spent
                        FROM categories c
                        LEFT JOIN monthly_bills mb ON c.id = mb.category_id
                        Where mb.card_id = ? ${dateCondition}
                        GROUP BY c.id, c.name`;
        const [spending] = await db.query(sql, [cardId]);
        res.status(200).json(spending);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }

}