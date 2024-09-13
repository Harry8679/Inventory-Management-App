const nodemailer = require('nodemailer');

const sendEmail = async (req, res) => {
    const transporter = nodemailer.createTransport({});
};

module.exports = sendEmail;