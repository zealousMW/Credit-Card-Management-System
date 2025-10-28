const express = require('express');
const router = express.Router();
const middleware = require('../middleware/authMiddleware');


router.get('/',middleware,(req,res)=>{
    res.json({message:"Card route accessed",user:req.user});
});

module.exports = router;