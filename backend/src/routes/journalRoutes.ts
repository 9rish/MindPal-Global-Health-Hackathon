import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Journal, { AnalyzedMood } from '../models/Journal';
import User from '../models/User';
import { calculateCoins, updateStreak, updatePetHappiness } from '../utils/gameLogic';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Create new journal entry
router.post(
  '/entry',
  authenticateToken,
  [
    body('content')
      .isLength({ min: 10, max: 5000 })
      .withMessage('Journal entry must be between 10 and 5000 characters'),
    body('mood')
      .isIn([
        'happy', 'excited', 'energetic', 'content', 'calm',
        'sad', 'anxious', 'angry', 'irritated', 'frustrated'
      ])
      .withMessage('Invalid mood value'),
    body('aiAnalysis')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('AI analysis too long')
  ],
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content, mood, confidence, aiAnalysis } = req.body;
      const userId = req.user?.userId;

      // Calculate word count and coins
      const wordCount = content.trim().split(/\s+/).length;
      const coinsEarned = calculateCoins(wordCount, content.length);

      // Check if user already has entry for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingEntry = await Journal.findOne({
        userId,
        createdAt: { $gte: today, $lt: tomorrow }
      });

      if (existingEntry) {
        return res.status(400).json({
          error: 'You have already made a journal entry today. Come back tomorrow!'
        });
      }

      // Create journal entry
      const journalEntry = new Journal({
        userId,
        content,
        mood: mood as AnalyzedMood,
        confidence,
        aiAnalysis,
        wordCount,
        coinsEarned,
        date: new Date()
      });

      await journalEntry.save();

      // Update user stats
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.totalCoins += coinsEarned;

      const { currentStreak, maxStreak } = updateStreak(user.lastJournalDate);
      user.currentStreak = currentStreak;
      user.maxStreak = Math.max(maxStreak, user.maxStreak);
      user.lastJournalDate = new Date();

      user.petData.happiness = updatePetHappiness(
        mood as AnalyzedMood,
        user.currentStreak,
        user.petData.happiness
      );

      const newLevel = Math.floor(user.totalCoins / 100) + 1;
      const leveledUp = newLevel > user.level;
      user.level = newLevel;

      await user.save();

      res.status(201).json({
        message: 'Journal entry saved successfully!',
        entry: {
          id: journalEntry._id,
          mood: journalEntry.mood,
          wordCount: journalEntry.wordCount,
          coinsEarned: journalEntry.coinsEarned,
          date: journalEntry.date
        },
        userStats: {
          totalCoins: user.totalCoins,
          currentStreak: user.currentStreak,
          level: user.level,
          petHappiness: user.petData.happiness,
          leveledUp
        }
      });
    } catch (error) {
      console.error('Error saving journal entry:', error);
      res.status(500).json({ error: 'Failed to save journal entry' });
    }
  }
);

// Get user's journal entries
router.get(
  '/entries',
  authenticateToken,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const userId = req.user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const entries = await Journal.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content');

      const totalEntries = await Journal.countDocuments({ userId });

      res.json({
        entries,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalEntries / limit),
          totalEntries,
          hasNext: skip + entries.length < totalEntries,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      res.status(500).json({ error: 'Failed to fetch journal entries' });
    }
  }
);

// Get specific journal entry
router.get(
  '/entry/:id',
  authenticateToken,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const userId = req.user?.userId;
      const entryId = req.params.id;

      const entry = await Journal.findOne({ _id: entryId, userId });

      if (!entry) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }

      res.json({ entry });
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      res.status(500).json({ error: 'Failed to fetch journal entry' });
    }
  }
);

// Get user's journal stats
router.get(
  '/stats',
  authenticateToken,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const userId = req.user?.userId;

      const totalEntries = await Journal.countDocuments({ userId });

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const entriesThisMonth = await Journal.countDocuments({
        userId,
        createdAt: { $gte: thisMonth }
      });

      const moodStats = await Journal.aggregate([
        { $match: { userId } },
        { $group: { _id: '$mood', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const recentEntries = await Journal.find({ userId })
        .sort({ createdAt: -1 })
        .limit(7)
        .select('mood date');

      res.json({
        totalEntries,
        entriesThisMonth,
        moodDistribution: moodStats,
        recentMoodTrend: recentEntries.reverse()
      });
    } catch (error) {
      console.error('Error fetching journal stats:', error);
      res.status(500).json({ error: 'Failed to fetch journal stats' });
    }
  }
);

export default router;
