const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Token = require('../models/token.model');
const sendEmail = require('../utils/sendEmail.util');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

const home = asyncHandler(async(req, res) => {
    res.send('Hello from Controller');
});

const register = asyncHandler(async(req, res) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please fill in all required fields');
    }
    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be up to 6 characters');
    }

    // Check if user email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Email has already been registered');
    }

    // Encrypt password before saving to DB
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({ name, email, password });

    // Generate Token
    const token = generateToken(user._id);

    // Send HTTP-only cookie
    res.cookie('token', token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: 'none',
        secure: true,
    });

    if (user) {
        const { _id, name, email, photo, phone, bio } = user;

        res.status(201).json({ _id, name, email, photo, phone, bio, token });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const login = asyncHandler(async(req, res) => {
    const { email, password } = req.body;

    // Validate Request
    if (!email || !password) {
        res.status(400);
        throw new Error('Please add email and password');
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
        res.status(400);
        throw new Error('User not found, please sign up');
    }

    // User exists, check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    // Generate Token
    const token = generateToken(user._id);

    // Send HTTP-only cookie
    if (passwordIsCorrect) {
        res.cookie('token', token, {
            path: '/',
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: 'none',
            secure: true,
        });
    };

    if (user && passwordIsCorrect) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({ _id, name, email, photo, phone, bio, token });
    } else {
        res.status(400);
        throw new Error('Invalid email or password');
    }
});

const logout = asyncHandler(async (req, res) => {
    res.cookie('token', '', {
        path: '/',
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'none',
        secure: true,
    });

    return res.status(200).json({ message: 'Successfully Logged out' });
});

const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    console.log(user);

    if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({ _id, name, email, photo, phone, bio });
    } else {
        res.status(400);
        throw new Error('User Not Found');
    }
});

const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json(false);
    }

    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if (verified) {
        return res.json(true);
    }

    return res.json(false);
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    // console.log(user);

    if (user) {
        const { name, email, photo, phone, bio } = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

        const userUpdated = await user.save();
        res.status(200).json({ 
            _id: userUpdated._id, 
            name: userUpdated.name, 
            email: userUpdated.email, 
            photo: userUpdated.photo, 
            phone: userUpdated.phone, 
            bio: userUpdated.bio 
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const changePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    const { oldPassword, password } = req.body;

    if (!user) {
        res.status(400);
        throw new Error('User not found, please signup');
    }

    // Validate
    if (!oldPassword || !password) {
        res.status(400);
        throw new Error('Please add old and new password');
    }

    // Check if old password matches password in DB
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

    // Save new password
    if (user && passwordIsCorrect) {
        user.password = password;
        await user.save();
        res.status(200).send('Password change successfuly');
    } else {
        res.status(400);
        throw new Error('Old password is incorrect');
    }
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User does not exist');
    }

    // Delete token if exists in DB
    let token = await Token.findOne({ userId: user._id });
    if (token) {
        await token.deleteOne();
    }

    // Créer un jeton de réinitialisation
    let resetToken = crypto.randomBytes(32).toString('hex') + user._id;
    console.log('resetToken', resetToken);

    // Hacher le jeton avant de l'enregistrer dans la base de données
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log('hashedToken', hashedToken);

    // Enregistrer le jeton dans la base de données
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000), // Trente minutes
    }).save();

    // Construire l'URL de réinitialisation
    const resetUrl = `${process.env.FRONTEND_URI}/resetPassword/${resetToken}`;

    // Message de réinitialisation
    const message = `<h2>Hello ${user.name}</h2>
        <p>Please use the url below to reset your password</p>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

        <p>Best regards ...</p>
        <p>Emarh Team</p>
    `;

    const subject = 'Password Reset Request';
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;

    try {
        await sendEmail(subject, message, send_to, sent_from);
        // Réponse envoyée après l'envoi de l'e-mail
        res.status(200).json({ success: true, message: 'Reset Email Sent' });
    } catch (err) {
        res.status(500);
        throw new Error('Email not sent, please try again');
    }
});

const resetPassword = asyncHandler (async(req, res) => {
    const { password } = req.body;
    const { resetToken } = req.params;

    // Hash token, then compare to Token in DB
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Find token in DB
    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: {$gt: Date.now()}
    });

    if (!userToken) {
        res.status(404);
        throw new Error('Invalid or Expired Token');
    }

    // Find user
    const user = await User.findOne({ _id: userToken.userId });
    user.password = password;
    await user.save();
    res.status(200).json({
        message: 'Password Reset Successful, Please Login'
    });
});



module.exports = { home, register, login, logout, getUser, loginStatus, updateUser, changePassword, forgotPassword, resetPassword };