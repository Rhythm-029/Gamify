import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Nodemailer SMTP Email Config
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '"Brained OS Auth" <auth@brained.io>',

  // Google OAuth Client Config
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '579864871614-o90r392pup5745p87u54opq0skf52q19.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

  // RapidAPI LinkedIn Scraper Key & Active Host
  RAPIDAPI_KEY: process.env.RAPIDAPI_KEY || '66fee2e051mshfc218b658a48457p138226jsneb71acae02f8',
  RAPIDAPI_HOST: process.env.RAPIDAPI_HOST || 'fresh-linkedin-profile-data.p.rapidapi.com',
};
