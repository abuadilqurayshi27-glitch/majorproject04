import { Router, Request, Response } from 'express';
import { RecommendationService } from '../services/recommendationService.js';

export const recommendRouter = Router();

recommendRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      studiedTopics = [],
      weakTopics = [],
      recentVideoTitles = [],
      learningGoal = '',
      education = '',
      stream = '',
      subjects = [],
      classLevel = '',
      boardExam = '',
    } = req.body;

    const recommendations = await RecommendationService.getRecommendations({
      studiedTopics,
      weakTopics,
      recentVideoTitles,
      learningGoal,
      education,
      stream,
      subjects,
      classLevel,
      boardExam,
    });

    return res.json({
      success: true,
      recommendations,
    });
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate recommendations' });
  }
});
