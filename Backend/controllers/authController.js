const db = require('../config/db');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

exports.registerUser = async(req, res) => {
    try {

        const { name, email, password } = req.body;

        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        await db.query(query, [name, email, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully' });
        
    } catch (error) {
        res.status(500).json({message: 'Server error', error: error.message});
    }
}

exports.loginUser = async(req,res) => {
    try {
        const { email, password } = req.body;
        const [userResult] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (userResult.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });

        }
        const user = userResult[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const payload = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
       jwt.sign(payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' },
            (err,token)=>{
                if(err) throw err;
                res.status(200).json({token});
            }
        );
     

    } catch (error) {
        console.log(error);
        res.status(500).json({message:"server error"});
    }
}