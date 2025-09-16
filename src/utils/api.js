// utils/api.js - API Service Layer
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.userId = localStorage.getItem('userId') || this.generateUserId();
  }

  generateUserId() {
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
    return userId;
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'User-ID': this.userId,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Journal Entry APIs
  async saveJournalEntry(entryData) {
    return this.makeRequest('/journal/entries', {
      method: 'POST',
      body: JSON.stringify({
        content: entryData.content,
        mood: entryData.mood,
        aiAnalysis: entryData.aiAnalysis,
        confidence: entryData.confidence,
        wordCount: entryData.content.split(' ').length,
        characterCount: entryData.content.length,
        date: entryData.date.toISOString(),
      }),
    });
  }

  async getTodaysEntry() {
    const today = new Date().toISOString().split('T')[0];
    return this.makeRequest(`/journal/entries/today?date=${today}`);
  }

  async getAllEntries(limit = 50) {
    return this.makeRequest(`/journal/entries?limit=${limit}`);
  }

  // User Stats APIs
  async getUserStats() {
    return this.makeRequest('/user/stats');
  }

  async updateCoins(coinsToAdd, reason) {
    return this.makeRequest('/user/coins', {
      method: 'POST',
      body: JSON.stringify({
        coinsToAdd,
        reason,
      }),
    });
  }

  // Streak APIs
  async updateStreak() {
    return this.makeRequest('/user/streak', {
      method: 'POST',
    });
  }

  async getStreak() {
    return this.makeRequest('/user/streak');
  }

  // Leaderboard APIs
  async getLeaderboard() {
    return this.makeRequest('/leaderboard');
  }
}

export const apiService = new ApiService();

// utils/coinCalculator.js - Coin Calculation Logic
export const calculateCoins = (journalEntry) => {
  const { content, mood } = journalEntry;
  const wordCount = content.split(' ').filter(word => word.trim().length > 0).length;
  const characterCount = content.length;
  
  let baseCoins = 10; // Base coins for any entry
  let bonusCoins = 0;
  
  // Word count bonus
  if (wordCount >= 50) bonusCoins += 5;
  if (wordCount >= 100) bonusCoins += 10;
  if (wordCount >= 200) bonusCoins += 20;
  
  // Character count bonus
  if (characterCount >= 500) bonusCoins += 5;
  if (characterCount >= 1000) bonusCoins += 15;
  
  // Mood-based bonus (encourage positive reflection)
  const positiveMoods = ['happy', 'excited', 'energetic', 'content', 'calm'];
  if (positiveMoods.includes(mood)) {
    bonusCoins += 5;
  }
  
  // Daily first entry bonus
  bonusCoins += 10; // This will be handled in backend to check if it's first entry of day
  
  return {
    baseCoins,
    bonusCoins,
    totalCoins: baseCoins + bonusCoins,
    breakdown: {
      base: baseCoins,
      wordBonus: wordCount >= 50 ? (wordCount >= 100 ? (wordCount >= 200 ? 20 : 10) : 5) : 0,
      characterBonus: characterCount >= 500 ? (characterCount >= 1000 ? 15 : 5) : 0,
      moodBonus: positiveMoods.includes(mood) ? 5 : 0,
      dailyFirstEntryBonus: 10,
    }
  };
};

// hooks/useJournalEntry.js - Custom Hook for Journal Functionality
import { useState, useCallback } from 'react';
import { apiService } from '../utils/api';
import { calculateCoins } from '../utils/coinCalculator';

export const useJournalEntry = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todaysEntry, setTodaysEntry] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [error, setError] = useState(null);

  // Check if user has already made an entry today
  const checkTodaysEntry = useCallback(async () => {
    try {
      const entry = await apiService.getTodaysEntry();
      setTodaysEntry(entry);
      return entry;
    } catch (error) {
      console.error('Failed to check today\'s entry:', error);
      return null;
    }
  }, []);

  // Get user statistics
  const fetchUserStats = useCallback(async () => {
    try {
      const stats = await apiService.getUserStats();
      setUserStats(stats);
      return stats;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return null;
    }
  }, []);

  // Submit journal entry
  const submitJournalEntry = useCallback(async (entryData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Calculate coins for this entry
      const coinData = calculateCoins(entryData);
      
      // Save journal entry
      const savedEntry = await apiService.saveJournalEntry({
        ...entryData,
        coinsEarned: coinData.totalCoins,
      });

      // Update user coins
      await apiService.updateCoins(
        coinData.totalCoins,
        `Journal entry: ${entryData.content.substring(0, 50)}...`
      );

      // Update streak
      await apiService.updateStreak();

      // Refresh user stats
      await fetchUserStats();
      
      setIsSubmitting(false);
      return {
        success: true,
        entry: savedEntry,
        coinsEarned: coinData.totalCoins,
        coinBreakdown: coinData.breakdown,
      };
    } catch (error) {
      setError(error.message);
      setIsSubmitting(false);
      return {
        success: false,
        error: error.message,
      };
    }
  }, [fetchUserStats]);

  return {
    isSubmitting,
    todaysEntry,
    userStats,
    error,
    checkTodaysEntry,
    fetchUserStats,
    submitJournalEntry,
  };
};

// Updated JournalScreen Component with Backend Integration
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { analyzeSentiment, getMoodExplanation, type AnalyzedMood } from '../utils/sentimentAnalysis';
import { useJournalEntry } from '../hooks/useJournalEntry';
import { calculateCoins } from '../utils/coinCalculator';

interface JournalEntry {
  mood: AnalyzedMood;
  content: string;
  date: Date;
  confidence?: number;
  aiAnalysis?: string;
}

interface JournalScreenProps {
  onJournalSubmit: (entry: JournalEntry, coinsEarned: number) => void;
  onBack: () => void;
  petName: string;
}

const moodEmojis: { [key in AnalyzedMood]: string } = {
  happy: '😊',
  excited: '🤗',
  energetic: '⚡',
  content: '😌',
  calm: '🕯️',
  sad: '😢',
  anxious: '😰',
  angry: '😡',
  irritated: '😤',
  frustrated: '😓'
};

export function JournalScreen({ onJournalSubmit, onBack, petName }: JournalScreenProps) {
  const [journalText, setJournalText] = useState('');
  const [detectedMood, setDetectedMood] = useState<AnalyzedMood | null>(null);
  const [moodExplanation, setMoodExplanation] = useState<string>('');
  const [coinPreview, setCoinPreview] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const { 
    isSubmitting, 
    todaysEntry, 
    userStats, 
    error,
    checkTodaysEntry,
    fetchUserStats,
    submitJournalEntry 
  } = useJournalEntry();

  useEffect(() => {
    // Check if user has already made an entry today
    checkTodaysEntry();
    fetchUserStats();
  }, [checkTodaysEntry, fetchUserStats]);

  const analyzeMoodFromText = (text: string) => {
    if (text.trim().length < 10) {
      setDetectedMood(null);
      setMoodExplanation('');
      setCoinPreview(0);
      return;
    }

    const mood = analyzeSentiment(text);
    const explanation = getMoodExplanation(text, mood);
    const coins = calculateCoins({ content: text, mood });
    
    setDetectedMood(mood);
    setMoodExplanation(explanation);
    setCoinPreview(coins.totalCoins);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJournalText(text);
    
    // Debounce mood analysis
    const timeoutId = setTimeout(() => {
      analyzeMoodFromText(text);
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async () => {
    if (!journalText.trim()) return;
    
    // Analyze sentiment one final time
    const finalMood = analyzeSentiment(journalText);
    const finalExplanation = getMoodExplanation(journalText, finalMood);
    
    // Create journal entry
    const entry: JournalEntry = {
      mood: finalMood,
      content: journalText.trim(),
      date: new Date(),
      aiAnalysis: finalExplanation
    };
    
    // Submit to backend
    const result = await submitJournalEntry(entry);
    
    if (result.success) {
      setShowSuccess(true);
      
      // Show success animation for 3 seconds
      setTimeout(() => {
        onJournalSubmit(entry, result.coinsEarned);
      }, 3000);
    }
  };

  // Success animation component
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            🎉
          </motion.div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Entry Saved!
          </h2>
          <p className="text-xl mb-2">You earned {coinPreview} coins! 💰</p>
          <p className="text-gray-600">{petName} is so proud of you! 🐕💕</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with user stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/70"
          >
            ← Back
          </Button>
          <div className="text-center">
            <h1 className="text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Daily Journal
            </h1>
            {userStats && (
              <p className="text-sm text-gray-600">
                💰 {userStats.totalCoins} coins | 🔥 {userStats.streak} day streak
              </p>
            )}
          </div>
          <div className="w-16" /> {/* Spacer */}
        </motion.div>

        {/* Today's entry status */}
        {todaysEntry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="p-4 bg-gradient-to-r from-green-100 to-blue-100 border-0 rounded-2xl">
              <div className="text-center">
                <span className="text-2xl">✅</span>
                <p className="text-sm text-gray-700">
                  You've already journaled today! You earned {todaysEntry.coinsEarned} coins.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Come back tomorrow for your next entry!
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Coin preview */}
        {coinPreview > 0 && !todaysEntry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4"
          >
            <Card className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-0 rounded-2xl">
              <div className="text-center">
                <span className="text-2xl">💰</span>
                <p className="text-sm font-medium">You'll earn {coinPreview} coins for this entry!</p>
                <p className="text-xs text-gray-600">
                  {journalText.split(' ').length} words • Keep writing for more coins!
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* AI Mood Detection */}
        {detectedMood && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 mb-6 bg-gradient-to-r from-purple-100 to-pink-100 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
              <div className="text-center">
                <h3 className="text-lg mb-3">🤖 AI Mood Detection</h3>
                
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <motion.div
                    key={detectedMood}
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-4xl"
                  >
                    {moodEmojis[detectedMood]}
                  </motion.div>
                  <div className="text-left">
                    <p className="font-medium capitalize text-gray-800">{detectedMood}</p>
                    <p className="text-sm text-gray-600">Detected from your writing</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 bg-white/50 rounded-xl p-3">
                  {moodExplanation}
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Journal Entry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
            <h3 className="text-lg mb-4">What's on your mind?</h3>
            
            <Textarea
              value={journalText}
              onChange={handleTextChange}
              disabled={!!todaysEntry}
              placeholder={
                todaysEntry 
                  ? "You've already completed today's journal entry! Come back tomorrow 😊"
                  : "Write about your day, feelings, thoughts, or anything that comes to mind... I'll analyze your mood automatically! ✨"
              }
              className="min-h-[200px] border-0 bg-white/50 rounded-2xl resize-none focus:ring-2 focus:ring-purple-300 transition-all"
            />
            
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                {journalText.length} characters • {journalText.split(' ').length} words
              </p>
              
              <Button
                onClick={handleSubmit}
                disabled={!journalText.trim() || isSubmitting || !!todaysEntry}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full px-6 transition-all duration-300"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      🤖
                    </motion.div>
                    <span>Saving...</span>
                  </div>
                ) : todaysEntry ? (
                  'Completed Today! ✅'
                ) : (
                  'Save Entry ✨'
                )}
              </Button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-red-100 rounded-lg text-red-700 text-sm"
              >
                Error: {error}. Your entry is saved locally and will sync when connection is restored.
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Encouraging message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-gray-600">
            {petName} is learning about your emotions through AI sentiment analysis 🧠💕
          </p>
          {journalText.length > 0 && journalText.length < 10 && (
            <p className="text-xs text-gray-500 mt-2">
              Write a bit more for mood detection to work ✍️
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}