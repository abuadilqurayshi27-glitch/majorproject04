import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
};
