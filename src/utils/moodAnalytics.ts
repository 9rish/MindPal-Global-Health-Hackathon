// src/utils/moodAnalytics.ts
import { SentimentResult } from "./sentimentAnalysis";

// ----------- TYPES -----------

export interface JournalEntry extends SentimentResult {
  content: string;
  date: string;
  mood: string; // Override to make it required
  aiAnalysis?: string;
  sarcastic?: boolean;
}

export interface MoodReward {
  type: string;
  title: string;
  description: string;
  emoji: string;
  coinReward: number;
}

export interface MoodAnalytics {
  totalEntries: number;
  moodCounts: Record<string, number>;
  dominantMood: string;
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
  topFineEmotions: { label: string; score: number }[];
  rewards: MoodReward[];
  recentTrend: "improving" | "declining" | "stable";
}

// ----------- ENHANCED EMOTION MAPPING -----------

// Map fine-grained emotions to sentiment buckets
function mapToSentiment(mood: string): "positive" | "negative" | "neutral" {
  const moodLower = mood.toLowerCase().trim();
  
  // Positive emotions
  const positiveEmotions = [
    'joy', 'happy', 'happiness', 'excited', 'excitement', 'love', 'loved',
    'grateful', 'gratitude', 'proud', 'pride', 'confident', 'confidence',
    'optimistic', 'optimism', 'peaceful', 'peace', 'content', 'contentment',
    'satisfied', 'satisfaction', 'pleased', 'pleasure', 'delighted', 'delight',
    'cheerful', 'enthusiastic', 'hopeful', 'hope', 'inspired', 'inspiration',
    'amused', 'amusement', 'relief', 'relieved', 'calm', 'serene', 'blissful'
  ];
  
  // Negative emotions
  const negativeEmotions = [
    'sadness', 'sad', 'anger', 'angry', 'fear', 'scared', 'afraid', 'fearful',
    'disgust', 'disgusted', 'disappointed', 'disappointment', 'frustrated',
    'frustration', 'anxious', 'anxiety', 'worried', 'worry', 'stressed',
    'stress', 'depressed', 'depression', 'lonely', 'loneliness', 'guilt',
    'guilty', 'shame', 'ashamed', 'jealous', 'jealousy', 'envious', 'envy',
    'bitter', 'resentful', 'resentment', 'irritated', 'irritation', 'annoyed',
    'overwhelmed', 'exhausted', 'tired', 'hurt', 'pain', 'grief', 'regret',
    'remorse', 'despair', 'hopeless', 'helpless', 'confused', 'confusion'
  ];
  
  // Neutral/ambiguous emotions
  const neutralEmotions = [
    'neutral', 'surprise', 'surprised', 'curious', 'curiosity', 'contemplative',
    'thoughtful', 'pensive', 'reflective', 'uncertain', 'mixed', 'complex',
    'conflicted', 'indifferent', 'detached', 'focused', 'determined',
    'serious', 'solemn', 'nostalgic', 'nostalgia', 'melancholic', 'melancholy'
  ];

  // Check for direct matches first
  if (positiveEmotions.includes(moodLower)) {
    return "positive";
  }
  if (negativeEmotions.includes(moodLower)) {
    return "negative";
  }
  if (neutralEmotions.includes(moodLower)) {
    return "neutral";
  }

  // Check for partial matches (for compound emotions like "very happy")
  for (const positive of positiveEmotions) {
    if (moodLower.includes(positive)) {
      return "positive";
    }
  }
  for (const negative of negativeEmotions) {
    if (moodLower.includes(negative)) {
      return "negative";
    }
  }
  for (const neutral of neutralEmotions) {
    if (moodLower.includes(neutral)) {
      return "neutral";
    }
  }

  // Default to neutral if no match found
  console.warn(`⚠️ Unknown emotion '${mood}' defaulting to neutral`);
  return "neutral";
}

export function getMoodEmoji(mood: string) {
  const moodLower = mood.toLowerCase().trim();
  
  const emojis: Record<string, string> = {
    // Basic emotions
    'joy': '😊', 'happy': '😊', 'happiness': '😊',
    'sadness': '😢', 'sad': '😢',
    'anger': '😡', 'angry': '😠',
    'fear': '😨', 'scared': '😱', 'afraid': '😰',
    'disgust': '🤢', 'disgusted': '🤮',
    'surprise': '😲', 'surprised': '😮',
    'neutral': '😐',
    
    // Extended emotions
    'love': '😍', 'loved': '🥰',
    'excited': '🤩', 'excitement': '🎉',
    'grateful': '🙏', 'gratitude': '🙏',
    'proud': '😤', 'pride': '🦁',
    'confident': '😎', 'confidence': '💪',
    'peaceful': '☮️', 'peace': '🕊️',
    'anxious': '😰', 'anxiety': '😟',
    'worried': '😟', 'worry': '😕',
    'frustrated': '😤', 'frustration': '😖',
    'disappointed': '😞', 'disappointment': '😔',
    'lonely': '😔', 'loneliness': '💔',
    'confused': '😵‍💫', 'confusion': '🤔',
    'tired': '😴', 'exhausted': '🥱',
    'calm': '😌', 'serene': '🧘',
    'hopeful': '🌅', 'hope': '⭐',
    'nostalgic': '🌅', 'nostalgia': '📸',
    'contemplative': '🤔', 'thoughtful': '💭',
    
    // Sentiment buckets
    'positive': '🌞',
    'negative': '🌧️',
  };

  // Direct match
  if (emojis[moodLower]) {
    return emojis[moodLower];
  }

  // Partial match
  for (const [emotion, emoji] of Object.entries(emojis)) {
    if (moodLower.includes(emotion)) {
      return emoji;
    }
  }

  // Fallback based on sentiment
  const sentiment = mapToSentiment(mood);
  return emojis[sentiment] || '🙂';
}

export function getMoodColor(mood: string) {
  const moodLower = mood.toLowerCase().trim();
  
  const colors: Record<string, string> = {
    // Basic emotions
    'joy': 'text-yellow-500', 'happy': 'text-yellow-500', 'happiness': 'text-yellow-500',
    'sadness': 'text-blue-500', 'sad': 'text-blue-600',
    'anger': 'text-red-500', 'angry': 'text-red-600',
    'fear': 'text-purple-500', 'scared': 'text-purple-600', 'afraid': 'text-purple-600',
    'disgust': 'text-green-600', 'disgusted': 'text-green-700',
    'surprise': 'text-pink-500', 'surprised': 'text-pink-600',
    'neutral': 'text-gray-500',
    
    // Extended emotions - positive
    'love': 'text-pink-500', 'loved': 'text-pink-400',
    'excited': 'text-orange-500', 'excitement': 'text-orange-400',
    'grateful': 'text-green-500', 'gratitude': 'text-green-400',
    'proud': 'text-purple-600', 'pride': 'text-purple-500',
    'confident': 'text-blue-600', 'confidence': 'text-blue-500',
    'peaceful': 'text-green-400', 'peace': 'text-green-300',
    'calm': 'text-blue-300', 'serene': 'text-blue-200',
    'hopeful': 'text-yellow-400', 'hope': 'text-yellow-300',
    
    // Extended emotions - negative
    'anxious': 'text-red-400', 'anxiety': 'text-red-500',
    'worried': 'text-yellow-600', 'worry': 'text-yellow-700',
    'frustrated': 'text-orange-600', 'frustration': 'text-orange-700',
    'disappointed': 'text-gray-600', 'disappointment': 'text-gray-700',
    'lonely': 'text-indigo-600', 'loneliness': 'text-indigo-700',
    'confused': 'text-purple-400', 'confusion': 'text-purple-500',
    'tired': 'text-gray-400', 'exhausted': 'text-gray-600',
    
    // Extended emotions - neutral
    'contemplative': 'text-indigo-500', 'thoughtful': 'text-indigo-400',
    'nostalgic': 'text-amber-500', 'nostalgia': 'text-amber-600',
    
    // Sentiment buckets
    'positive': 'text-green-500',
    'negative': 'text-red-500',
  };

  // Direct match
  if (colors[moodLower]) {
    return colors[moodLower];
  }

  // Partial match
  for (const [emotion, color] of Object.entries(colors)) {
    if (moodLower.includes(emotion)) {
      return color;
    }
  }

  // Fallback based on sentiment
  const sentiment = mapToSentiment(mood);
  return colors[sentiment] || 'text-gray-500';
}

// ----------- MAIN ANALYTICS FUNCTION -----------

export function analyzeMoods(entries: JournalEntry[]): MoodAnalytics {
  console.log(`📊 Analyzing ${entries.length} journal entries`);
  
  const totalEntries = entries.length;
  const moodCounts: Record<string, number> = {};
  const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };

  let fineEmotions: { label: string; score: number }[] = [];

  entries.forEach((entry, index) => {
    const mood = entry.mood?.toLowerCase().trim() || "neutral";
    console.log(`Entry ${index + 1}: "${mood}" (original: "${entry.mood}")`);
    
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;

    // Map to sentiment bucket
    const bucket = mapToSentiment(mood);
    sentimentCounts[bucket]++;
    console.log(`  -> Mapped to: ${bucket}`);

    // Collect fine-grained emotions
    if (entry.fineEmotions && entry.fineEmotions.length > 0) {
      fineEmotions.push(...entry.fineEmotions);
    }
  });

  console.log("📊 Mood counts:", moodCounts);
  console.log("📊 Sentiment distribution:", sentimentCounts);

  // Calculate percentages
  const positivePercentage = totalEntries
    ? Math.round((sentimentCounts.positive / totalEntries) * 100)
    : 0;
  const negativePercentage = totalEntries
    ? Math.round((sentimentCounts.negative / totalEntries) * 100)
    : 0;
  const neutralPercentage = totalEntries
    ? Math.round((sentimentCounts.neutral / totalEntries) * 100)
    : 0;

  // Find dominant mood (most frequent)
  let dominantMood = "neutral";
  let maxCount = 0;
  for (const mood in moodCounts) {
    if (moodCounts[mood] > maxCount) {
      maxCount = moodCounts[mood];
      dominantMood = mood;
    }
  }

  console.log("📊 Dominant mood:", dominantMood, "with", maxCount, "occurrences");

  // Aggregate fine emotions (average scores)
  const fineMap: Record<string, number[]> = {};
  fineEmotions.forEach((e) => {
    if (!fineMap[e.label]) fineMap[e.label] = [];
    fineMap[e.label].push(e.score);
  });

  const averagedFineEmotions = Object.entries(fineMap).map(([label, scores]) => ({
    label,
    score: scores.reduce((a, b) => a + b, 0) / scores.length,
  }));

  const topFineEmotions = averagedFineEmotions
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Enhanced rewards logic
  const rewards: MoodReward[] = [];
  
  if (positivePercentage >= 70) {
    rewards.push({
      type: "positivity",
      title: "Sunshine Soul",
      description: "Maintained a mostly positive outlook 🌞",
      emoji: "🌞",
      coinReward: 50,
    });
  }
  
  if (negativePercentage <= 20 && totalEntries >= 5) {
    rewards.push({
      type: "resilience",
      title: "Resilient Spirit",
      description: "Kept negative moods low over time 💪",
      emoji: "🛡️",
      coinReward: 40,
    });
  }

  if (totalEntries >= 10) {
    rewards.push({
      type: "consistency",
      title: "Consistent Chronicler",
      description: "Maintained regular journaling habits 📚",
      emoji: "📖",
      coinReward: 30,
    });
  }

  // Check for mood diversity
  const uniqueMoods = Object.keys(moodCounts).length;
  if (uniqueMoods >= 5) {
    rewards.push({
      type: "diversity",
      title: "Emotional Explorer",
      description: "Experienced a wide range of emotions 🎭",
      emoji: "🎭",
      coinReward: 25,
    });
  }

  // Recent trend analysis (improved)
  let recentTrend: "improving" | "declining" | "stable" = "stable";
  if (entries.length >= 6) {
    const sortedEntries = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const lastHalf = sortedEntries.slice(-3);
    const prevHalf = sortedEntries.slice(-6, -3);

    const lastPositiveScore = lastHalf.reduce((sum, e) => {
      return sum + (mapToSentiment(e.mood) === "positive" ? 1 : 
                   mapToSentiment(e.mood) === "neutral" ? 0.5 : 0);
    }, 0) / lastHalf.length;

    const prevPositiveScore = prevHalf.reduce((sum, e) => {
      return sum + (mapToSentiment(e.mood) === "positive" ? 1 : 
                   mapToSentiment(e.mood) === "neutral" ? 0.5 : 0);
    }, 0) / prevHalf.length;

    const difference = lastPositiveScore - prevPositiveScore;
    
    if (difference > 0.1) recentTrend = "improving";
    else if (difference < -0.1) recentTrend = "declining";
  }

  const analytics = {
    totalEntries,
    moodCounts,
    dominantMood,
    positivePercentage,
    negativePercentage,
    neutralPercentage,
    topFineEmotions,
    rewards,
    recentTrend,
  };

  console.log("📊 Final analytics:", analytics);
  return analytics;
}