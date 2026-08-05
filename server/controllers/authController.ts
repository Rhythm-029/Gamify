import { Request, Response } from 'express';
import axios from 'axios';
import { generateOtp, verifyOtpCode } from '../services/otpService';
import { sendOtpEmail } from '../services/emailService';

// Real Google ID Token / Access Token verification against Google OAuth Servers
export const handleGoogleAuth = async (req: Request, res: Response): Promise<void> => {
  const { credential, accessToken } = req.body;

  if (!credential && !accessToken) {
    res.status(400).json({ 
      success: false, 
      error: 'Google OAuth token missing. Please sign in via Google OAuth prompt.' 
    });
    return;
  }

  try {
    let googleUser: { email: string; name: string; picture: string; sub?: string } | null = null;

    // Verify ID Token with Google OAuth tokeninfo API
    if (credential) {
      const verifyRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (verifyRes.data && verifyRes.data.email) {
        googleUser = {
          email: verifyRes.data.email,
          name: verifyRes.data.name || verifyRes.data.email.split('@')[0],
          picture: verifyRes.data.picture || '',
          sub: verifyRes.data.sub,
        };
      }
    }

    // Fallback verify Access Token if access_token supplied
    if (!googleUser && accessToken) {
      const userinfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (userinfoRes.data && userinfoRes.data.email) {
        googleUser = {
          email: userinfoRes.data.email,
          name: userinfoRes.data.name || userinfoRes.data.email.split('@')[0],
          picture: userinfoRes.data.picture || '',
          sub: userinfoRes.data.sub,
        };
      }
    }

    if (!googleUser) {
      res.status(401).json({ success: false, error: 'Google OAuth verification failed. Token invalid or expired.' });
      return;
    }

    res.json({
      success: true,
      message: 'Google Sign-In authenticated successfully.',
      user: {
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        authProvider: 'google',
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[GOOGLE AUTH ERROR]', err.response?.data || err.message);
    res.status(400).json({
      success: false,
      error: 'Failed to verify Google OAuth token. Please ensure Google Sign-In is configured correctly.',
    });
  }
};

export const handleSendOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const otp = generateOtp(normalizedEmail);
  const sent = await sendOtpEmail(normalizedEmail, otp);

  if (sent) {
    res.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}`,
      devOtpHint: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } else {
    res.status(500).json({ success: false, error: 'Failed to send OTP email.' });
  }
};

export const handleVerifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({ success: false, error: 'Email and 6-digit verification code are required.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const isValid = verifyOtpCode(normalizedEmail, code.toString().trim());

  if (isValid) {
    res.json({
      success: true,
      message: 'Email authenticated successfully.',
      user: {
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        authProvider: 'email_otp',
        verifiedAt: new Date().toISOString(),
      },
    });
  } else {
    res.status(400).json({ 
      success: false, 
      error: 'Invalid or expired verification code. Please check the 6-digit code or request a new one.' 
    });
  }
};
