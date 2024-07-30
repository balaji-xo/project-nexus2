
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Sign Up Route
router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating user');
    }
});

// Login Route
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user._id }, 'secretkey');
            res.cookie('jwt', token, { httpOnly: true });
            res.redirect('/restaurant');
        } else {
            res.status(400).send('Invalid credentials');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});

module.exports = router;
