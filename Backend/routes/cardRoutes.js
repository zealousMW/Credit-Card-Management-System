const express = require('express');
const router = express.Router();
const middleware = require('../middleware/authMiddleware');
const cardController = require('../controllers/cardController');


router.post('/',middleware, cardController.addCard);
router.get('/',middleware, cardController.getCards2);
router.get('/:cardId',middleware, cardController.getCardbyId);

module.exports = router;