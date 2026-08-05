import { Router } from 'express';
import { handleSendOtp, handleVerifyOtp, handleGoogleAuth } from '../controllers/authController';

export const authRouter = Router();

authRouter.post('/send-otp', handleSendOtp);
authRouter.post('/verify-otp', handleVerifyOtp);
authRouter.post('/google', handleGoogleAuth);
