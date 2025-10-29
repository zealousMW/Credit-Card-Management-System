const express = require('express');
const middleware = require('../middleware/authMiddleware');
const controller = require('../controllers/insightController');

const router = express.Router();

router.get('/:cardId', middleware, controller.getInsights);
router.get('/trends/:cardId', middleware, controller.getSpendingTrends);

module.exports = router;