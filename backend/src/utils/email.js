const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  return transporter;
}

async function sendOtpEmail(toEmail, code) {
  // In dev without SMTP creds configured, just log it so the flow is testable.
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log(`[email:dev-mode] OTP for ${toEmail}: ${code}`);
    return { devMode: true };
  }
  const mailer = getTransporter();
  await mailer.sendMail({
    from: process.env.EMAIL_FROM || 'CivicAlert <no-reply@civicalert.app>',
    to: toEmail,
    subject: 'Your CivicAlert verification code',
    text: `Your verification code is ${code}. It expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`,
    html: `<p>Your CivicAlert verification code is:</p><h2 style="letter-spacing:4px">${code}</h2><p>This code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>`,
  });
  return { devMode: false };
}

module.exports = { sendOtpEmail };
