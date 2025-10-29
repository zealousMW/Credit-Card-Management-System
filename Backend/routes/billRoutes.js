const  express = require('express');
const middleware = require('../middleware/authMiddleware');
const controller = require('../controllers/billController');


const router = express.Router();


router.post('/', middleware, controller.addBill);
router.put('/:billId', middleware, controller.makePayment);

module.exports  = router;