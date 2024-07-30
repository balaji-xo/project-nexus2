const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

// Initialize the app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'mySecret', resave: false, saveUninitialized: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB connection
mongoose.connect('mongodb+srv://sixSlay:oZ8NGjZswFfgw2wG@serverlessinstance2.yx1strl.mongodb.net/mern', { useNewUrlParser: true, useUnifiedTopology: true });

// User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
User.createIndexes(); // Ensure unique indexes

// Routes
app.get('/', (req, res) => {
    res.render('login');
});

app.post('/', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user;
        res.redirect('/hotel');
    } else {
        res.redirect('/not-registered');
    }
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    try {
        await newUser.save();
        res.redirect('/');
    } catch (error) {
        if (error.code === 11000) {
            res.send('Email or username already exists.');
        } else {
            res.send('An error occurred. Please try again.');
        }
    }
});

app.get('/hotel', (req, res) => {
    if (req.session.user) {
        res.render('hotel');
    } else {
        res.redirect('/');
    }
});

app.get('/not-registered', (req, res) => {
    res.render('not-registered');
});

// Start the server
app.listen(7070, () => {
    console.log('Server has started on port number 800');
  });