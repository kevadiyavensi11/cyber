require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        console.log('Verifying connection...');
        await transporter.verify();
        console.log('Connection verified, sending email...');

        const info = await transporter.sendMail({
            from: `"CyberGuard Security Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // send to self as a test
            subject: 'CyberGuard Test',
            text: 'This is a test email sent using Nodemailer.'
        });
        
        console.log('Email sent successfully. ID:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
};

testEmail();
