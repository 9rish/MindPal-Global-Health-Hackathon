import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { analyzeSentiment, getMoodExplanation, type AnalyzedMood } from '../utils/sentimentAnalysis';
import { journalAPI, userManager, type User } from '../services/apiService';

interface JournalEntry {
  mood: AnalyzedMood;
  content: string;
  date: Date;
  confidence?: number;
  aiAnalysis?: string;
}

interface JournalScreenProps {
  onJournalSubmit: (entry: JournalEntry, userStats: any) => void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedMood, setDetectedMood] = useState<AnalyzedMood | null>(null);
  const [moodExplanation, setMoodExplanation] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [hasJournaledToday, setHasJournaledToday] = useState(false);

  useEffect(() => {
    // Get current user data
    const currentUser = userManager.getCurrentUser();
    setUser(currentUser);

    // Check if user has already journaled today
    checkTodayEntry();
  }, []);

  const checkTodayEntry = async () => {
    try {
      const response = await journalAPI.getEntries(1, 1);
      if (response.data && response.data.entries.length > 0) {
        const latestEntry = response.data.entries[0];
        const entryDate = new Date(latestEntry.date);
        const today = new Date();
        
        const isToday = entryDate.toDateString() === today.toDateString();
        setHasJournaledToday(isToday);
      }
    } catch (error) {
      console.error('Error checking today\'s entry:', error);
    }
  };

  const analyzeMoodFromText = (text: string) => {
    if (text.trim().length < 10) {
      setDetectedMood(null);
      setMoodExplanation('');
      return;
    }

    const mood = analyzeSentiment(text);
    const explanation = getMoodExplanation(text, mood);
    
    setDetectedMood(mood);
    setMoodExplanation(explanation);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJournalText(text);
    setError(''); // Clear any previous errors
    
    // Debounce mood analysis
    const timeoutId = setTimeout(() => {
      analyzeMoodFromText(text);
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  const calculateCoinsPreview = (text: string): number => {
    const wordCount = text.trim().split(/\s+/).length;
    const charCount = text.length;
    
    let baseCoins = 10;
    if (wordCount >= 100) baseCoins += 20;
    else if (wordCount >= 50) baseCoins += 10;
    else if (wordCount >= 25) baseCoins += 5;
    
    if (charCount >= 500) baseCoins += 10;
    if (charCount >= 1000) baseCoins += 20;
    
    return Math.min(baseCoins, 60);
  };

  const handleSubmit = async () => {
    if (!journalText.trim()) {
      setError('Please write something in your journal');
      return;
    }

    if (journalText.trim().length < 10) {
      setError('Please write at least 10 characters for a meaningful entry');
      return;
    }

    if (hasJournaledToday) {
      setError('You have already made a journal entry today. Come back tomorrow!');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Analyze sentiment one final time
      const finalMood = analyzeSentiment(journalText);
      const finalExplanation = getMoodExplanation(journalText, finalMood);
      
      // Submit to backend
      const response = await journalAPI.createEntry({
        content: journalText.trim(),
        mood: finalMood,
        aiAnalysis: finalExplanation
      });

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        // Update user data in localStorage
        const currentUser = userManager.getCurrentUser();
        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,
            totalCoins: response.data.userStats.totalCoins,
            currentStreak: response.data.userStats.currentStreak,
            level: response.data.userStats.level,
            petData: {
              ...currentUser.petData,
              happiness: response.data.userStats.petHappiness
            }
          };
          userManager.saveUser(updatedUser);
          setUser(updatedUser);
        }

        // Create journal entry object for parent component
        const entry: JournalEntry = {
          mood: finalMood,
          content: journalText.trim(),
          date: new Date(),
          aiAnalysis: finalExplanation
        };

        // Show success and navigate back
        onJournalSubmit(entry, response.data.userStats);
      }
      
    } catch (error) {
      console.error('Error saving journal entry:', error);
      setError('Failed to save journal entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasJournaledToday) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-6 flex items-center justify-center">
        <Card className="p-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl mb-4">Great Job!</h2>
          <p className="text-gray-600 mb-6">
            You've already completed your journal entry for today. Your consistency is amazing! 
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Come back tomorrow to continue your journey with {petName}!
          </p>
          <Button onClick={onBack} className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full px-6">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
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
          <h1 className="text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Daily Journal
          </h1>
          <div className="text-right">
            <div className="text-sm text-gray-600">Current Coins</div>
            <div className="text-lg font-bold text-yellow-600">🪙 {user?.totalCoins || 0}</div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="p-4 bg-red-100 border-red-200 rounded-2xl">
              <p className="text-red-600 text-sm">{error}</p>
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
              placeholder="Write about your day, feelings, thoughts, or anything that comes to mind... I'll analyze your mood automatically! ✨"
              className="min-h-[200px] border-0 bg-white/50 rounded-2xl resize-none focus:ring-2 focus:ring-purple-300 transition-all"
              disabled={isSubmitting}
            />
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                <div>{journalText.length} characters</div>
                <div>{journalText.trim().split(/\s+/).length} words</div>
                {journalText.length > 10 && (
                  <div className="text-yellow-600 font-medium">
                    🪙 {calculateCoinsPreview(journalText)} coins estimated
                  </div>
                )}
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={!journalText.trim() || isSubmitting || journalText.trim().length < 10}
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
                ) : (
                  'Save Entry ✨'
                )}
              </Button>
            </div>
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
          {user?.currentStreak && user.currentStreak > 0 && (
            <p className="text-sm text-orange-600 mt-2">
              🔥 Current streak: {user.currentStreak} days!
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}