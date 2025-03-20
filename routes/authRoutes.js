const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Render Sign Up Form
router.get('/signup', (req, res) => {
    const token = req.cookies.token; // Get the token from the cookie
    const loggedIn = !!token;
    res.render('signup',{loggedIn});
});

// Render Sign In Form
router.get('/login', (req, res) => {
    const token = req.cookies.token; // Get the token from the cookie
    const loggedIn = !!token;
    res.render('signin',{loggedIn});
});

// User Sign-up Route
router.post('/signup', async (req,res) => {
    try {
        const {email,password} = req.body;
        let user = await User.findOne({email});
        if(user) return res.render('common', { msg: 'User already exist.. Please log in..',loggedIn:false});

        const h_password = await bcrypt.hash(password,10);

        user = new User({email, password: h_password});
        await user.save();

        res.render('home', { msg: 'User registered succesfully. Please Log in to visit private page..', loggedIn:false});
    } catch (error) {
        res.render('common', { msg: 'Server error',loggedIn:false});
    }
});

// User Login Route

router.post('/login', async (req, res) => {
    try {
        const { email, password} = req.body;
        const user = await User.findOne({email});

        if(!user) return res.render('common', { msg: 'User not exist',loggedIn:false});

        const isMatch = await bcrypt.compare(password,user.password);
        if (!isMatch) return res.render('common', { msg: 'Password is incorrect',loggedIn:false});

        const token = jwt.sign({id:user._id,email: user.email},process.env.JWT_SECRET, {expiresIn: '1h'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 60*60*1000,
        });

        // res.json({token});
        res.render('home', { msg: 'You are logged in. Now visit the private page.', user: { email:user.email },loggedIn:true });
    } catch (error) {
        res.render('common', { msg: 'Server error..', loggedIn:false});
    }
});

router.get('/protected', authMiddleware, (req, res) => {
    res.render("protected", {
        msg: "You have visited Private Page succesfully..",
        user: req.user,
        loggedIn: true,
    });
});

router.get('/logout',(req, res) => {
    // Clear the token cookie
    res.clearCookie('token');
    // Redirect the user to the home page or login page
    res.render('home',{loggedIn:false});
});

module.exports = router;
