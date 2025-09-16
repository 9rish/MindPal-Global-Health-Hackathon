// backend/server.js - Express.js Backend Server
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with actual database later)
const users = new Map();
const journalEntries = new Map();
const userStats = new Map();

// Helper function to get or create user
const getOrCreateUser = (userId) => {
  if (!users.has(userId)) {
    users.set(userId, {
      id: userId,
      createdAt: new Date(),
      totalCoins: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate: null,
      totalEntries: 0,
      level: 1,
    });
    
    userStats.set(userId, {
      userId,
      totalCoins: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalEntries: 0,
      lastEntryDate: null,
      joinDate: new Date(),
    });
  }
  return users.get(userId);
};

// Helper function to check if date is today
const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

// Helper function to check if date is yesterday
const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === yesterday.getDate() &&
    checkDate.getMonth() === yesterday.getMonth() &&
    checkDate.getFullYear() === yesterday.getFullYear()
  );
};

// Routes

// Get user statistics
app.get('/api/user/stats', (req, res) => {
  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const user = getOrCreateUser(userId);
  const stats = userStats.get(userId);

  res.json({
    userId: user.id,
    totalCoins: user.totalCoins,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    totalEntries: user.totalEntries,
    level: user.level,
    lastEntryDate: user.lastEntryDate,
    joinDate: stats.joinDate,
  });
});

// Update user coins
app.post('/api/user/coins', (req, res) => {
  const userId = req.headers['user-id'];
  const { coinsToAdd, reason } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const user = getOrCreateUser(userId);
  user.totalCoins += coinsToAdd;

  // Update level based on coins (every 100 coins = 1 level)
  user.level = Math.floor(user.totalCoins / 100) + 1;

  res.json({
    totalCoins: user.totalCoins,
    coinsAdded: coinsToAdd,
    reason,
    newLevel: user.level,
  });
});

// Update user streak
app.post('/api/user/streak', (req, res) => {
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const user = getOrCreateUser(userId);
  const today = new Date();

  if (!user.lastEntryDate) {
    // First entry ever
    user.currentStreak = 1;
    user.lastEntryDate = today;
  } else if (isYesterday(user.lastEntryDate)) {
    // Continuing streak
    user.currentStreak += 1;
    user.lastEntryDate = today;
  } else if (!isToday(user.lastEntryDate)) {
    // Streak broken, start new
    user.currentStreak = 1;
    user.lastEntryDate = today;
  }
  // If isToday(lastEntryDate), don't change streak (already journaled today)

  // Update longest streak
  if (user.currentStreak > user.longestStreak) {
    user.longestStreak = user.currentStreak;
  }

  res.json({
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastEntryDate: user.lastEntryDate,
  });
});

// Get user streak
app.get('/api/user/streak', (req, res) => {
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const user = getOrCreateUser(userId);

  res.json({
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastEntryDate: user.lastEntryDate,
  });
});

// Save journal entry
app.post('/api/journal/entries', (req, res) => {
  const userId = req.headers['user-id'];
  const {
    content,
    mood,
    aiAnalysis,
    confidence,
    wordCount,
    characterCount,
    date,
    coinsEarned,
  } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const user = getOrCreateUser(userId);
  const entryId = uuidv4();
  const entryDate = new Date(date);

  // Check if user already has an entry for today
  const todayEntries = Array.from(journalEntries.values()).filter(
    entry => entry.userId === userId && isToday(entry.date)
  );

  if (todayEntries.length > 0) {
    return res.status(400).json({ 
      error: 'You have already made a journal entry today. Come back tomorrow!' 
    });
  }

  const journalEntry = {
    id: entryId,
    userId,
    content,
    mood,
    aiAnalysis,
    confidence,
    wordCount: wordCount || content.split(' ').length,
    characterCount: characterCount || content.length,
    date: entryDate,
    coinsEarned: coinsEarned || 10,
    createdAt: new Date(),
  };

  journalEntries.set(entryId, journalEntry);
  user.totalEntries += 1;

  res.json({
    success: true,
    entry: journalEntry,
    message: 'Journal entry saved successfully!',
  });
});

// Get today's journal entry
app.get('/api/journal/entries/today', (req, res) => {
  const userId = req.headers['user-id'];
  const { date } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const checkDate = date ? new Date(date) : new Date();
  const todayEntries = Array.from(journalEntries.values()).filter(
    entry => entry.userId === userId && isToday(entry.date)
  );

  if (todayEntries.length > 0) {
    res.json(todayEntries[0]);
  } else {
    res.json(null);
  }
});

// Get all journal entries for a user
app.get('/api/journal/entries', (req, res) => {
  const userId = req.headers['user-id'];
  const { limit = 50 } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const userEntries = Array.from(journalEntries.values())
    .filter(entry => entry.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, parseInt(limit));

  res.json({
    entries: userEntries,
    total: userEntries.length,
  });
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  const leaderboard = Array.from(users.values())
    .map(user => ({
      userId: user.id,
      totalCoins: user.totalCoins,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalEntries: user.totalEntries,
      level: user.level,
      // Don't expose personal data, just stats
    }))
    .sort((a, b) => b.totalCoins - a.totalCoins)
    .slice(0, 20); // Top 20 users

  res.json({
    leaderboard,
    totalUsers: users.size,
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MindPal API is running!',
    timestamp: new Date().toISOString(),
    totalUsers: users.size,
    totalEntries: journalEntries.size,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MindPal API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Ready to accept journal entries!`);
});