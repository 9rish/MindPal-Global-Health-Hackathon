import { AnalyzedMood } from '../models/Journal';

// Calculate coins earned based on word count and content length
export const calculateCoins = (wordCount: number, charCount: number): number => {
  let baseCoins = 10; // Base coins for any journal entry
  
  // Bonus for longer entries
  if (wordCount >= 100) baseCoins += 20;
  else if (wordCount >= 50) baseCoins += 10;
  else if (wordCount >= 25) baseCoins += 5;
  
  // Extra bonus for very detailed entries
  if (charCount >= 500) baseCoins += 10;
  if (charCount >= 1000) baseCoins += 20;
  
  return Math.min(baseCoins, 60); // Cap at 60 coins per entry
};

// Update streak based on last journal date
export const updateStreak = (lastJournalDate: Date | null): { currentStreak: number; maxStreak: number } => {
  if (!lastJournalDate) {
    // First journal entry ever
    return { currentStreak: 1, maxStreak: 1 };
  }

  const now = new Date();
  const lastDate = new Date(lastJournalDate);
  
  // Calculate days difference
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day - increment streak
    return { currentStreak: 1, maxStreak: 1 }; // This will be handled by caller to increment properly
  } else if (diffDays === 0) {
    // Same day - shouldn't happen due to validation, but handle gracefully
    return { currentStreak: 0, maxStreak: 0 }; // Will be handled by caller
  } else {
    // Streak broken - reset to 1
    return { currentStreak: 1, maxStreak: 1 };
  }
};

// Update pet happiness based on mood and streak
export const updatePetHappiness = (mood: AnalyzedMood, currentStreak: number, currentHappiness: number): number => {
  let happinessChange = 0;

  // Base happiness change based on mood
  const moodEffects: { [key in AnalyzedMood]: number } = {
    happy: 8,
    excited: 10,
    energetic: 6,
    content: 5,
    calm: 3,
    sad: -3,
    anxious: -5,
    angry: -8,
    irritated: -6,
    frustrated: -4
  };

  happinessChange = moodEffects[mood];

  // Streak bonus - maintaining streaks keeps pet happier
  if (currentStreak >= 7) happinessChange += 5;
  else if (currentStreak >= 3) happinessChange += 2;

  // Apply change
  const newHappiness = currentHappiness + happinessChange;

  // Keep within bounds (0-100)
  return Math.max(0, Math.min(100, newHappiness));
};

// Calculate streak bonus coins
export const calculateStreakBonus = (currentStreak: number): number => {
  if (currentStreak >= 30) return 20;
  if (currentStreak >= 14) return 15;
  if (currentStreak >= 7) return 10;
  if (currentStreak >= 3) return 5;
  return 0;
};

// Check if user has journaled today
export const hasJournaledToday = (lastJournalDate: Date | null): boolean => {
  if (!lastJournalDate) return false;
  
  const today = new Date();
  const lastDate = new Date(lastJournalDate);
  
  return (
    today.getFullYear() === lastDate.getFullYear() &&
    today.getMonth() === lastDate.getMonth() &&
    today.getDate() === lastDate.getDate()
  );
};

// Calculate level from total coins
export const calculateLevel = (totalCoins: number): number => {
  return Math.floor(totalCoins / 100) + 1;
};

// Get coins needed for next level
export const getCoinsForNextLevel = (totalCoins: number): number => {
  const currentLevel = calculateLevel(totalCoins);
  const nextLevelCoins = currentLevel * 100;
  return nextLevelCoins - totalCoins;
};

// Pet health decay (call this daily)
export const updatePetHealth = (lastLoginDate: Date | null, currentHealth: number): number => {
  if (!lastLoginDate) return currentHealth;
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastLoginDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Pet loses 5 health per day of inactivity, but never goes below 10
  const healthLoss = Math.min(diffDays * 5, currentHealth - 10);
  return Math.max(10, currentHealth - healthLoss);
};