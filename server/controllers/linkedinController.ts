import { Request, Response } from 'express';
import { scrapeLinkedinProfile } from '../services/linkedinScraperService';

export const handleFetchLinkedinProfile = async (req: Request, res: Response): Promise<void> => {
  const { linkedinUrl } = req.body;

  if (!linkedinUrl || typeof linkedinUrl !== 'string') {
    res.status(400).json({ success: false, error: 'Valid LinkedIn profile URL is required.' });
    return;
  }

  try {
    const profile = await scrapeLinkedinProfile(linkedinUrl);
    res.json({
      success: true,
      message: 'LinkedIn profile scraped successfully.',
      profile,
    });
  } catch (err: any) {
    console.error('[LINKEDIN CONTROLLER ERROR]', err);
    res.status(500).json({
      success: false,
      error: 'Failed to scrape LinkedIn profile. Please verify URL format.',
    });
  }
};
