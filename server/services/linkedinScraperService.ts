import axios from 'axios';
import * as cheerio from 'cheerio';
import { ENV } from '../config/env';

export interface ScrapedLinkedinProfile {
  username: string;
  name: string;
  jobStatus: string;
  company: string;
  avatar: string;
  fallbackAvatar: string;
  headline: string;
  scrapedAt: string;
}

export const scrapeLinkedinProfile = async (linkedinUrl: string): Promise<ScrapedLinkedinProfile> => {
  let cleanUrl = linkedinUrl.trim();
  if (!cleanUrl) {
    throw new Error('LinkedIn profile URL cannot be empty.');
  }

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  // Extract username slug from URL (e.g., linkedin.com/in/prathamesh-bhandare-b74257307 -> prathamesh-bhandare-b74257307)
  const match = cleanUrl.match(/linkedin\.com\/in\/([^\/\?#]+)/i);
  const rawSlug = match ? match[1] : '';

  if (!rawSlug) {
    throw new Error('Invalid LinkedIn URL format. Example: https://www.linkedin.com/in/username');
  }

  // Format clean human full name from slug fallback (e.g. prathamesh-bhandare-b74257307 -> Prathamesh Bhandare)
  const cleanedSlugName = rawSlug
    .replace(/-[a-f0-9]{6,12}$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\d+/g, '')
    .trim();

  let extractedName = cleanedSlugName || '';
  let extractedJobStatus = '';
  let extractedCompany = '';
  let extractedAvatar = `https://unavatar.io/linkedin/${encodeURIComponent(rawSlug)}`;
  let extractedHeadline = '';

  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(extractedName || 'User')}&backgroundColor=ec4899,8b5cf6,3b82f6`;

  // 1. Try RapidAPI if key is available
  if (ENV.RAPIDAPI_KEY) {
    try {
      const response = await axios.get(`https://${ENV.RAPIDAPI_HOST}/get-linkedin-profile`, {
        params: { linkedin_url: cleanUrl },
        headers: {
          'x-rapidapi-key': ENV.RAPIDAPI_KEY,
          'x-rapidapi-host': ENV.RAPIDAPI_HOST,
        },
        timeout: 5000,
      });

      if (response.data && response.data.data) {
        const data = response.data.data;
        if (data.full_name) extractedName = data.full_name;
        if (data.headline) extractedHeadline = data.headline;
        if (data.profile_pic_url) extractedAvatar = data.profile_pic_url;
        if (data.experiences && data.experiences.length > 0) {
          const latest = data.experiences[0];
          if (latest.title) extractedJobStatus = latest.title;
          if (latest.company) extractedCompany = latest.company;
        }
      }
    } catch (err) {
      console.warn('[LINKEDIN SCRAPER] RapidAPI lookup failed, falling back to public web scraper:', (err as any)?.message);
    }
  }

  // 2. Fallback: Fetch SERP snippet if name/company/jobStatus missing
  if (!extractedCompany || !extractedJobStatus) {
    try {
      const searchRes = await axios.get(`https://html.duckduckgo.com/html/?q=site:linkedin.com/in/${encodeURIComponent(rawSlug)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        },
        timeout: 4000,
      });

      const $ = cheerio.load(searchRes.data);
      const snippetText = $('.result__snippet').first().text().trim();
      const resultTitle = $('.result__title').first().text().trim();

      if (resultTitle && resultTitle.includes('-')) {
        const parts = resultTitle.split('-');
        if (parts[0] && !parts[0].toLowerCase().includes('linkedin') && !extractedName) {
          extractedName = parts[0].replace(/\|.*/, '').trim();
        }
        if (parts[1] && !parts[1].toLowerCase().includes('linkedin') && !extractedJobStatus) {
          extractedJobStatus = parts[1].trim();
        }
        if (parts[2] && !parts[2].toLowerCase().includes('linkedin') && !extractedCompany) {
          extractedCompany = parts[2].trim();
        }
      }

      if (snippetText) {
        if (!extractedHeadline) extractedHeadline = snippetText;
        if (!extractedJobStatus && snippetText.includes(' at ')) {
          const parts = snippetText.split(' at ');
          extractedJobStatus = parts[0].substring(0, 60).trim();
          if (parts[1] && !extractedCompany) {
            extractedCompany = parts[1].split('.')[0].trim();
          }
        }
      }
    } catch {
      // Ignore web search errors
    }
  }

  if (!extractedName) {
    extractedName = cleanedSlugName || 'Executive Member';
  }

  if (!extractedJobStatus) {
    extractedJobStatus = extractedCompany ? `Digital Transformation Leader at ${extractedCompany}` : `Digital Transformation Consultant`;
  }

  return {
    username: rawSlug,
    name: extractedName,
    jobStatus: extractedJobStatus,
    company: extractedCompany || 'Brained Consulting',
    avatar: extractedAvatar,
    fallbackAvatar,
    headline: extractedHeadline || extractedJobStatus,
    scrapedAt: new Date().toISOString(),
  };
};
