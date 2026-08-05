import { Router } from 'express';
import { handleFetchLinkedinProfile } from '../controllers/linkedinController';

export const linkedinRouter = Router();

linkedinRouter.post('/fetch-profile', handleFetchLinkedinProfile);
