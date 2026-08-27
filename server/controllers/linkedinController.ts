import { Request, Response } from 'express';
import { scrapeLinkedinProfile } from '../services/linkedinScraperService';

export const handleFetchLinkedinProfile = async (req: Request, res: Response): Promise<void> => {
  const { linkedinUrl } = req.body;

  if (!linkedinUrl || typeof linkedinUrl !== 'string' || !linkedinUrl.trim()) {
    res.status(400).json({ success: false, error: 'Valid LinkedIn profile URL is required.' });
    return;
  }

  try {
    const profile = await scrapeLinkedinProfile(linkedinUrl.trim());
    res.json({
      success: true,
      message: 'LinkedIn profile retrieved successfully.',
      profile,
    });
  } catch (err: any) {
    console.error('[LINKEDIN CONTROLLER ERROR]', err?.message || err);
    res.status(400).json({
      success: false,
      error: err?.message || 'Failed to fetch LinkedIn profile. Please verify URL format.',
    });
  }
};
