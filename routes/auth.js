const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'sectr';
const crypto = require('crypto');
const dotenv = require('dotenv')
dotenv.config({ path: './process.env' })
const multer = require('multer')
const upload = multer()

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

var resetPasswordToken = "";
var resetPasswordExpires = "";

router.post('/register',upload.none(), [
    body('name', 'Enter Valid Name').isLength({ min: 3 }),
    body('email', 'enter valid email').isEmail(),
    body('password', 'password should be min 5char long').isLength({ min: 5 })
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(404).json({ success: false, errors });
    }
    try {

        let email = await User.findOne({ email: req.body.email })

        if (!email) {
            const salt = await bcrypt.genSalt(10);
            const securePass = await bcrypt.hash(req.body.password, salt);
            const user = await User.create({ name: req.body.name, email: req.body.email, password: securePass });

            const authToken = jwt.sign({ user: { id: user.id } }, JWT_SECRET);

            res.json({ success: true, authToken });
        }
        else {
            res.json({ success: false, error: 'account with email already exist' });
        }
    } catch (error) {

        res.status(500).json({ success: false, error });
        console.error(error.message);

    }
})

router.post('/login',upload.none(), [
    body('email', 'enter valid email').isEmail(),
    body('password', 'required').exists()
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(404).json({ success: false, errors });
    }
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, error: 'enter valid credentials' });
        }

        const passCompare = await bcrypt.compare(password, user.password);
        if (!passCompare) {
            return res.status(400).json({ success: false, error: 'enter valid credentials' });
        }
        const authToken = jwt.sign({ user: { id: user.id } }, JWT_SECRET);
        res.json({ success: true, authToken });


    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'internal server error' });
    }

})

router.post('/verify', async (req, res) => {

    try {
        const { email, vcode } = req.body;
        const user = await User.findOne({ email });

        if (!vcode) {
            return res.status(400).json({ success: false, error: 'enter valid credentials' });
        }
        if (Date.now() <= resetPasswordExpires) {

            return res.status(400).json({ success: false, error: 'enter valid credentials' });
        }
        const passCompare = vcode === resetPasswordToken
        if (!passCompare) {
            return res.status(400).json({ success: false, error: 'enter valid credentials' });
        }

        const authToken = jwt.sign({ user: { id: user.id } }, JWT_SECRET);
        res.json({ success: true, authToken });


    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'internal server error' });
    }

})

router.post('/forgot',upload.none(), [
    body('email', 'enter valid email').isEmail(),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(404).json({ success: false, errors });
    }
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, error: 'account with email does not exist' });
        }

        resetPasswordToken = crypto.randomBytes(20).toString('hex');
        resetPasswordExpires = Date.now() + 600000; //expires in 10 mins

        // let link = "http://" + req.headers.host + "/api/auth/reset/" + user.resetPasswordToken;
        const mailOptions = {
            to: user.email,
            from: "ope13477@xcoxc.com",
            subject: "Password change request",
            text: `Hi ${user.name} \n 
        Please verify this code ${resetPasswordToken} to reset your password. \n\n 
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
            html: '<strong>and easy to do anywhere, even with Node.js</strong>'
        };

        sgMail.send(mailOptions, (error, result) => {
            // console.log(result)
            // console.log(error)
            res.status(200).json({ success: true, message: 'A reset email has been sent to ' + user.email + '.' });
        })

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'internal server error' });
    }

})

module.exports = router;