const nodemailer = require('nodemailer');

let transporter = null;
let emailConfigured = false;

const initEmail = () => {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    emailConfigured = true;
    console.log('Email transport configured');
  } else {
    console.log('Email not configured. In-app notifications only.');
  }
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!emailConfigured || !transporter) {
    console.log(`[Email not sent - not configured] To: ${to}, Subject: ${subject}`);
    return { skipped: true, reason: 'Email not configured' };
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Safe Tag <noreply@safetag.com>',
      to,
      subject,
      html,
      text,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

const isEmailConfigured = () => emailConfigured;

module.exports = { initEmail, sendEmail, isEmailConfigured };
