interface OtpRecord {
  code: string;
  expiresAt: number;
}

// In-memory OTP storage keyed by email
const otpStore = new Map<string, OtpRecord>();

export const generateOtp = (email: string): string => {
  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes valid

  otpStore.set(email.toLowerCase().trim(), { code, expiresAt });
  return code;
};

export const verifyOtpCode = (email: string, inputCode: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim();
  const record = otpStore.get(normalizedEmail);

  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return false;
  }

  if (record.code === inputCode.trim()) {
    otpStore.delete(normalizedEmail);
    return true;
  }

  return false;
};
