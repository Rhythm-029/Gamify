import nodemailer from 'nodemailer';
import { ENV } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

if (ENV.SMTP_USER && ENV.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_PORT === 465,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });
}

export const sendOtpEmail = async (toEmail: string, otpCode: string): Promise<boolean> => {
  const mailOptions = {
    from: ENV.SMTP_FROM,
    to: toEmail,
    subject: `🔑 Your Brained OS Access Verification Code: ${otpCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #0B1020; color: #ffffff; padding: 30px; borderRadius: 16px;">
        <div style="max-width: 480px; margin: 0 auto; background: #12182c; border: 1px solid rgba(255,255,255,0.1); padding: 24px; border-radius: 16px;">
          <h2 style="color: #60a5fa; margin-top: 0;">Brained OS Authentication</h2>
          <p style="color: #cbd5e1; font-size: 14px;">Your 6-digit verification code to log in to your executive workspace is:</p>
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ec4899; text-align: center; margin: 24px 0; padding: 12px; background: #080b16; border-radius: 12px; border: 1px solid rgba(236,72,153,0.3);">
            ${otpCode}
          </div>
          <p style="color: #94a3b8; font-size: 12px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`[SMTP EMAIL SERVICE] Real OTP email dispatched to ${toEmail}`);
      return true;
    } catch (err) {
      console.error('[SMTP EMAIL SERVICE ERROR]', err);
    }
  }

  // DEV FALLBACK LOGGING: Displays in terminal when SMTP credentials aren't set
  console.log(`\n==================================================`);
  console.log(`[DEV OTP MAIL SERVICE] Destination: ${toEmail}`);
  console.log(`[DEV OTP CODE]: ---> ${otpCode} <---`);
  console.log(`==================================================\n`);
  return true;
};
