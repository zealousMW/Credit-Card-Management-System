const express = require('express');
const router = express.Router();
const middleware = require('../middleware/authMiddleware');
const categoryController = require('../controllers/categoryController');
router.get('/', middleware, categoryController.getAllCategories);
router.get('/spending/:cardId', middleware, categoryController.getSpendingByCategory);


module.exports = router;