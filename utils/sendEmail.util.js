const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendEmail = async (subject, message, send_to, sent_from, reply_to) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // Options pour envoyer l'e-mail
    const options = {
        from: sent_from,
        to: send_to,
        replyTo: reply_to,
        subject: subject,
        html: message
    }

    // Envoi de l'e-mail avec async/await
    return transporter.sendMail(options);
};


// const sendEmail = async (subject, message, send_to, sent_from, reply_to) => {
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: 587,
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//         },
//         tls: {
//             rejectUnauthorized: false
//         }
//     });

//     // Option for sending email
//     const options = {
//         from: sent_from,
//         to: send_to,
//         replyTo: reply_to,
//         subject: subject,
//         html: message
//     }

//     // Send Email
//     transporter.sendMail(options, function (ree, info) {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log(info);
//         }
//     });

//     if (!user) {
//         res.status(404);
//         throw new Error('User does not exist');
//     }
// };

module.exports = sendEmail;