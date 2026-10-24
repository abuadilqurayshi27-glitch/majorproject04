import { Router, Request, Response } from 'express';
import { config } from '../config/env.js';
import { GeminiService } from '../services/geminiService.js';

export const settingsRouter = Router();

settingsRouter.get('/status', (req: Request, res: Response) => {
  return res.json({
    hasGeminiKey: !!config.geminiApiKey,
    geminiModel: config.geminiModel,
    hasYouTubeKey: !!config.youtubeApiKey,
    serverTime: new Date().toISOString(),
  });
});

settingsRouter.post('/gemini-key', (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'API key is required' });
    }

    const updated = GeminiService.updateApiKey(apiKey);
    return res.json({
      success: updated,
      message: updated ? 'Gemini API key updated successfully' : 'Failed to update key',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to update API key' });
  }
});
