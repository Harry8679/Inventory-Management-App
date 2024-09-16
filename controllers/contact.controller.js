const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const sendEmail = require('../utils/sendEmail.util');

const contactUs = asyncHandler(async(req, res) => {
    const { subject, message } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(400);
        throw new Error('User not found, please sign up');
    }

    // Validation
    if (!subject || !message) {
        res.status(400);
        throw new Error('Please add subject and message');
    }

    const send_to = process.env.EMAIL_USER;
    const sent_from = process.env.EMAIL_USER;
    const rely_to = user.email;

    // console.log(process.env.EMAIL_USER);

    try {
        await sendEmail(subject, message, send_to, sent_from, rely_to);
        // Réponse envoyée après l'envoi de l'e-mail
        res.status(200).json({ success: true, message: 'Email Sent' });
    } catch (err) {
        res.status(500);
        throw new Error('Email not sent, please try again');
    }
});

module.exports = contactUs;