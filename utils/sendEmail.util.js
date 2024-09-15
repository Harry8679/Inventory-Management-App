// const nodemailer = require('nodemailer');
// const dotenv = require('dotenv');

// // Charger les variables d'environnement depuis le fichier .env
// dotenv.config();

// const sendEmail = async () => {
//     try {
//         const transporter = nodemailer.createTransport({
//             host: process.env.EMAIL_HOST,
//             port: 587,
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//             tls: {
//                 rejectUnauthorized: false
//             }
//         });

//         const options = {
//             from: sent_from,
//             to: send_to,
//             replyTo: reply_to,
//             subject: subject,
//             html: message
//         }

//         const info = await transporter.sendMail({
//             from: process.env.EMAIL_USER,  // Adresse de l'expéditeur
//             to: 'ton-email-de-test@example.com',  // Remplace par ton email pour le test
//             subject: 'Test d\'envoi d\'email avec Nodemailer',
//             text: 'Ceci est un test d\'email depuis Nodemailer',
//         });

//         console.log('Email envoyé avec succès :', info.response);
//     } catch (err) {
//         console.error('Erreur lors de l\'envoi de l\'email :', err);
//     }
// };

// module.exports = sendEmail;


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

    // Option for sending email
    const options = {
        from: sent_from,
        to: send_to,
        replyTo: reply_to,
        subject: subject,
        html: message
    }

    // Send Email
    transporter.sendMail(options, function (ree, info) {
        if (err) {
            console.log(err);
        } else {
            console.log(info);
        }
    });

    if (!user) {
        res.status(404);
        throw new Error('User does not exist');
    }
};

module.exports = sendEmail;