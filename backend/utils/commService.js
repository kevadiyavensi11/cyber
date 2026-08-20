const nodemailer = require('nodemailer');

/**
 * Communication Service for CyberGuard
 * Handles Email OTPs and Security SMS Alerts
 */

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmailOTP = async (email, otp) => {
    console.log(`\n[MAIL SERVICE] 📧 Sending Verification Code to ${email}`);
    console.log(`[MAIL SERVICE] Your CyberGuard Verification Code is: ${otp}`);

    const hasCredentials =
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS &&
        process.env.EMAIL_USER !== 'your-email@gmail.com' &&
        process.env.EMAIL_PASS !== 'your-app-password';

    if (hasCredentials) {
        try {
            await transporter.sendMail({
                from: `"CyberGuard Security" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'CyberGuard | Your Secure Recovery OTP',
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; padding: 40px; border-radius: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; bg-color: #ffffff; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                            <h2 style="color: #1e3a8a; text-align: center; font-style: italic;">Secure_Recovery</h2>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                                We received a request to access your CyberGuard account. Use the following code to proceed with your identity verification.
                            </p>
                            <div style="background-color: #eff6ff; border: 2px dashed #3b82f6; padding: 20px; text-align: center; margin: 30px 0; border-radius: 10px;">
                                <span style="font-size: 32px; font-weight: 800; letter-spacing: 15px; color: #1d4ed8;">${otp}</span>
                            </div>
                            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                                This code is valid for 5 minutes. If you did not request this code, please ignore this email or contact support.
                            </p>
                        </div>
                    </div>
                `
            });
            console.log(`[MAIL SERVICE] ✅ Email dispatched successfully to ${email}`);
            return { success: true, mode: 'real' };
        } catch (error) {
            console.error(`[MAIL SERVICE] ❌ Error sending email:`, error.message);
            if (process.env.NODE_ENV === 'development') {
                console.log(`[MAIL SERVICE] ⚠️ Dispatch failed but returning success for dev testing.`);
                return { success: true, mode: 'console' };
            }
            return { success: false, mode: 'error' };
        }
    } else {
        console.log(`[MAIL SERVICE] ⚠️ Real SMTP credentials missing. Falling back to console log.`);
        return { success: true, mode: 'console' };
    }
};

const sendSecuritySMS = async (phone, time) => {
    const message = `“You logged into CyberGuard at ${time}. If not you, report immediately.”`;
    console.log(`\n[SMS SERVICE] 📱 Sending Security Alert to ${phone || 'UNKNOWN_NUMBER'}`);
    console.log(`[SMS SERVICE] Message: ${message}\n`);
    return { success: true, mode: 'console' };
};

const sendMobileOTP = async (phone, otp) => {
    console.log(`\n[SMS SERVICE] 📱 Preparing MFA Code for ${phone || 'UNKNOWN_NUMBER'}`);

    const message = `Your CyberGuard Verification Code is: ${otp}`;

    // 1. FAST2SMS INTEGRATION (Common in India, easy trial)
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (fast2smsKey && fast2smsKey !== 'your_api_key') {
        try {
            const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsKey}&route=otp&variables_values=${otp}&numbers=${phone.replace(/\D/g, '')}`);
            const data = await response.json();

            if (data.return) {
                console.log(`[SMS SERVICE] ✅ SMS dispatched via Fast2SMS to ${phone}`);
                return { success: true, mode: 'real' };
            } else {
                console.error(`[SMS SERVICE] ❌ Fast2SMS Error:`, data.message);
            }
        } catch (error) {
            console.error(`[SMS SERVICE] ❌ Network error with Fast2SMS:`, error.message);
        }
    }

    // 2. TWILIO INTEGRATION
    const twilioSid = process.env.TWILIO_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE;

    if (twilioSid && twilioAuth && twilioSid !== 'your_sid') {
        try {
            // Note: In a real project, we would use 'require("twilio")'
            // For this environment, we'll use the Twilio REST API directly via fetch to avoid install issues
            const auth = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
            const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    Body: message,
                    From: twilioPhone,
                    To: phone
                })
            });

            if (response.ok) {
                console.log(`[SMS SERVICE] ✅ SMS dispatched via Twilio to ${phone}`);
                return { success: true, mode: 'real' };
            } else {
                const errorData = await response.json();
                console.error(`[SMS SERVICE] ❌ Twilio Error:`, errorData.message);
            }
        } catch (error) {
            console.error(`[SMS SERVICE] ❌ Network error with Twilio:`, error.message);
        }
    }

    // 3. FALLBACK (CONSOLE LOG)
    console.log(`[SMS SERVICE] ⚠️ REAL GATEWAY MISSING. Fallback to console log.`);
    console.log(`[SMS SERVICE] CODE: ${otp}\n`);
    return { success: true, mode: 'console' };
};

module.exports = { sendEmailOTP, sendSecuritySMS, sendMobileOTP };
