// src/components/JournalScreen1.tsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  ArrowLeft,
  Save,
  Timer,
  Lightbulb,
  Heart,
  AlertTriangle,
  Mic,
  MicOff,
  Sparkles,
  BookOpen,
  Calendar,
  TrendingUp,
  Coins,
  Star,
  Smile,
  Frown,
  Meh,
  Play,
  Pause,
  RotateCcw,
  Brain,
  WifiOff,
} from "lucide-react";
import { UserData } from "../App";
import { toast } from "sonner";
import { getJournalTip } from "../utils/gemini";
import { analyzeText, SentimentResult, isApiConfigured } from "../utils/sentimentAnalysis";
import { getMoodEmoji, getMoodColor } from "../utils/moodAnalytics";

interface JournalPageProps {
  userData: UserData;
  onUpdateData: (updates: Partial<UserData>) => void;
  onBack: () => void;
}

interface JournalEntry {
  id: string;
  content: string;
  date: string;
  mood: string;
  confidence: number;
  fineEmotions: Array<{ label: string; score: number }>;
  sarcastic?: boolean;
  sarcasticConfidence?: number;
  sentiment: "positive" | "neutral" | "negative"; // Required for compatibility
  aiAnalysis?: string;
}

const journalPrompts = [
  "What made you smile today?",
  "Describe a challenge you overcame recently",
  "What are you grateful for right now?",
  "How did you show kindness to yourself or others today?",
  "What's one thing you learned about yourself this week?",
  "Describe a moment when you felt truly peaceful",
  "What would you tell your past self from a year ago?",
  "How have you grown in the past month?",
  "What's bringing you joy in your life right now?",
  "Describe a goal you're working towards and why it matters",
  "What does self-care look like for you today?",
  "How are you feeling in your body right now?",
];

// Enhanced sentiment tips with specific emotions
const sentimentTips: Record<string, string[]> = {
  // Positive emotions
  joy: [
    "Wonderful! Joy is such a powerful emotion. Try to identify what specifically brought you this feeling.",
    "Your joyful energy is beautiful! Consider sharing this positivity with someone you care about.",
    "Joy can be amplified through gratitude practice. What are three things you're most grateful for right now?",
  ],
  
  // Negative emotions  
  sadness: [
    "Your sadness is valid and important. Allow yourself to feel this emotion without judgment.",
    "Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, exhale for 8. This can help regulate your nervous system.",
    "Consider reaching out to a trusted friend or family member. Connection can be healing during difficult times.",
  ],
  anger: [
    "Anger often signals that a boundary has been crossed or a value has been threatened. What might this be telling you?",
    "Physical movement can help process angry energy. Try a brisk walk, stretching, or even shaking your hands.",
    "Try the STOP technique: Stop what you're doing, Take a breath, Observe your feelings, Proceed mindfully.",
  ],
  fear: [
    "Fear is your mind's way of trying to protect you. What would you tell a dear friend experiencing this same fear?",
    "Ground yourself using the 5-4-3-2-1 technique: 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
    "Remember: courage isn't the absence of fear, it's feeling afraid and choosing to act with wisdom anyway.",
  ],
  disgust: [
    "Disgust often signals that something conflicts with your values. What might this be teaching you about what matters to you?",
    "This feeling will pass. Try some deep breathing or step away from whatever is triggering this emotion.",
    "Consider what boundaries you might need to set to protect your wellbeing.",
  ],
  surprise: [
    "Life is full of unexpected moments! How are you processing this surprise?",
    "Take a moment to breathe and ground yourself. Surprises can be overwhelming even when they're positive.",
    "Reflect on how this unexpected event might offer new opportunities or perspectives.",
  ],
  
  // Neutral/mixed
  neutral: [
    "Neutral feelings are completely valid. Not every moment needs to be intensely emotional.",
    "This might be a good time for gentle self-reflection or a mindfulness practice.",
    "Consider what small thing might bring you a moment of peace or contentment right now.",
  ],
  
  // Default fallback
  default: [
    "Every emotion carries valuable information about your inner experience.",
    "Be gentle with yourself as you process these feelings. All emotions are temporary.",
    "Consider what this feeling might be trying to communicate to you about your needs or values.",
  ],
  
  // Legacy sentiment support
  positive: [
    "That's wonderful! Keep nurturing these positive feelings through gratitude practice.",
    "Your positive energy is beautiful! Consider sharing this joy with someone you care about.",
    "Amazing mindset! Try the 3-3-3 breathing technique to amplify these good feelings.",
  ],
  negative: [
    "Your feelings are valid. Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, out for 8.",
    "This too shall pass. Consider reaching out to a friend or doing something small that brings you comfort.",
    "If these feelings persist or worsen, please consider speaking with a mental health professional. You deserve support.",
  ]
};

const mapToSentiment = (mood: string): "positive" | "neutral" | "negative" => {
  const moodLower = mood.toLowerCase().trim();
  
  const positiveEmotions = ['joy', 'happiness', 'love', 'gratitude', 'pride', 'confidence', 'excitement', 'contentment', 'peace', 'hope'];
  const negativeEmotions = ['sadness', 'anger', 'fear', 'disgust', 'anxiety', 'frustration', 'disappointment', 'guilt', 'shame', 'loneliness'];
  
  if (positiveEmotions.some(e => moodLower.includes(e))) return "positive";
  if (negativeEmotions.some(e => moodLower.includes(e))) return "negative";
  return "neutral";
};

// Simple sentiment analysis function (fallback when API not configured)
const analyzeSentiment = (text: string): "positive" | "neutral" | "negative" => {
  const positiveWords = [
    "happy",
    "joy",
    "excited",
    "grateful",
    "wonderful",
    "amazing",
    "love",
    "great",
    "good",
    "awesome",
    "fantastic",
    "blessed",
    "thankful",
  ];
  const negativeWords = [
    "sad",
    "angry",
    "frustrated",
    "anxious",
    "worried",
    "depressed",
    "upset",
    "terrible",
    "awful",
    "bad",
    "horrible",
    "hate",
    "stressed",
  ];

  const words = text.toLowerCase().split(/\s+/);
  const positiveCount = words.filter((word) =>
    positiveWords.some((pw) => word.includes(pw))
  ).length;
  const negativeCount = words.filter((word) =>
    negativeWords.some((nw) => word.includes(nw))
  ).length;

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
};

const calculateCoins = (text: string, sentimentResult: SentimentResult | string): number => {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  let baseCoins = Math.min(wordCount * 0.5, 30); // Max 30 coins for length

  // Handle both new SentimentResult and legacy string sentiment
  if (typeof sentimentResult === 'string') {
    if (sentimentResult === "positive") baseCoins += 5;
    if (sentimentResult === "negative") baseCoins += 10;
  } else {
    // New enhanced analysis
    const sentiment = mapToSentiment(sentimentResult.mood);
    if (sentiment === "positive") baseCoins += 5;
    if (sentiment === "negative") baseCoins += 10;
    
    // Bonus for high confidence analysis
    if (sentimentResult.confidence > 0.8) baseCoins += 5;
    
    // Bonus for detecting sarcasm
    if (sentimentResult.sarcastic && sentimentResult.sarcasticConfidence && sentimentResult.sarcasticConfidence > 0.7) {
      baseCoins += 3;
    }
  }

  return Math.round(baseCoins);
};

export function JournalPage({
  userData,
  onUpdateData,
  onBack,
}: JournalPageProps): React.ReactElement {
  const recognitionRef = useRef<any | null>(null);
  const interimRef = useRef<string>("");
  const [journalText, setJournalText] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [sentimentResult, setSentimentResult] = useState<SentimentResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [sentiment, setSentiment] = useState<"positive" | "neutral" | "negative" | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check API configuration
  const apiConfigured = isApiConfigured();
  const todayISO = new Date().toISOString().split("T")[0];
  const hasJournaledToday = userData.lastJournalEntry === todayISO;

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  // Enhanced emotion analysis with Hugging Face APIs
  useEffect(() => {
    let isMounted = true;
    const analyzeEmotions = async () => {
      if (journalText.length > 50) {
        if (!apiConfigured) {
          // Fall back to simple analysis
          const detectedSentiment = analyzeSentiment(journalText);
          setSentiment(detectedSentiment);
          setSentimentResult(null);
          setTips(sentimentTips[detectedSentiment] || sentimentTips.default);
          return;
        }

        setIsAnalyzing(true);
        setAnalysisError(null);
        
        try {
          console.log("Analyzing emotions with Hugging Face APIs...");
          
          const result = await analyzeText(journalText);
          
          if (!isMounted) return;
          
          setSentimentResult(result);
          const legacySentiment = mapToSentiment(result.mood);
          setSentiment(legacySentiment);
          console.log("Analysis complete:", result);

          // Get appropriate tips
          const moodLower = result.mood.toLowerCase();
          let selectedTips = sentimentTips[moodLower] || sentimentTips[legacySentiment] || sentimentTips.default;

          // Try to enhance with AI tips
          try {
            const aiTip = await getJournalTip(journalText, legacySentiment);
            if (aiTip && isMounted) {
              selectedTips = [aiTip, ...selectedTips.slice(0, 2)];
            }
          } catch (err) {
            console.warn("Could not get AI tips:", err);
          }

          if (isMounted) {
            setTips(selectedTips.slice(0, 3));
          }
        } catch (error) {
          console.error("Emotion analysis failed:", error);
          if (isMounted) {
            setAnalysisError(error instanceof Error ? error.message : "Analysis failed");
            // Fall back to simple analysis
            const detectedSentiment = analyzeSentiment(journalText);
            setSentiment(detectedSentiment);
            setSentimentResult({
              mood: detectedSentiment,
              confidence: 0.5,
              fineEmotions: [{ label: detectedSentiment, score: 0.5 }],
              sarcastic: false
            });
            setTips(sentimentTips[detectedSentiment] || sentimentTips.default);
          }
        } finally {
          if (isMounted) {
            setIsAnalyzing(false);
          }
        }
      } else {
        setSentimentResult(null);
        setSentiment(null);
        setTips([]);
        setIsAnalyzing(false);
        setAnalysisError(null);
      }
    };

    const timeoutId = setTimeout(analyzeEmotions, 1500);
    
    return () => {
      clearTimeout(timeoutId);
      isMounted = false;
    };
  }, [journalText, apiConfigured]);

  const getRandomPrompt = () =>
    journalPrompts[Math.floor(Math.random() * journalPrompts.length)];

  const handlePromptClick = () => setCurrentPrompt(getRandomPrompt());
  const usePrompt = () => {
    setJournalText((prev) => (prev ? prev + "\n\n" + currentPrompt : currentPrompt));
    setCurrentPrompt("");
  };

  // Voice transcription methods (keeping same logic but improving UI feedback)
  const handleVoiceToText = async () => {
    if (isListening) {
      stopRecognition();
    } else {
      await startRecognition();
    }
  };

  async function startRecognition() {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      toast("Speech recognition is not supported in this browser. Try Chrome/Edge.");
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      toast("Microphone permission denied. Please allow microphone access.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = navigator.language || "en-US";
    recog.interimResults = true;
    recog.continuous = true;
    recog.maxAlternatives = 1;

    recog.onstart = () => {
      recognitionRef.current = recog;
      setIsListening(true);
      toast("🎤 Listening...");
    };

    recog.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        const text = (res[0] && res[0].transcript) || "";
        if (res.isFinal) {
          finalTranscript += text + " ";
        } else {
          interimTranscript += text + " ";
        }
      }

      if (finalTranscript.trim().length > 0) {
        setJournalText((prev) =>
          prev ? prev + " " + finalTranscript.trim() : finalTranscript.trim()
        );
        interimRef.current = "";
      } else {
        interimRef.current = interimTranscript;
      }
    };

    recog.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      toast("Speech recognition error: " + (e.error || e.message || "unknown"));
    };

    recog.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      toast("Voice recording stopped.");
    };

    try {
      recog.start();
      recognitionRef.current = recog;
    } catch (err) {
      console.error("Failed to start recognition:", err);
      toast("Could not start speech recognition.");
    }
  }

  function stopRecognition() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }

  // Timer functionality
  useEffect(() => {
    let intervalId: number | undefined;
    if (isTimerActive && timeRemaining > 0) {
      intervalId = window.setInterval(() => {
        setTimeRemaining((t) => {
          if (t <= 1) {
            setIsTimerActive(false);
            toast("Time's up! Great job on your journal session!");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [isTimerActive, timeRemaining]);

  const toggleTimer = () => {
    if (!isTimerActive && timeRemaining === 0) {
      setTimeRemaining(300);
    }
    setIsTimerActive(!isTimerActive);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeRemaining(300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Smile className="w-4 h-4" />;
      case "negative":
        return <Frown className="w-4 h-4" />;
      default:
        return <Meh className="w-4 h-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "from-green-400 to-emerald-500";
      case "negative":
        return "from-red-400 to-pink-500";
      default:
        return "from-yellow-400 to-orange-500";
    }
  };

  // Save entry
  const handleSave = async () => {
    if (journalText.trim().length < 20) {
      toast("Please write at least 20 characters to save your entry.");
      return;
    }

    setIsSaving(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Use enhanced sentiment result if available, otherwise fall back to simple analysis
      let finalSentimentResult: SentimentResult;
      let legacySentiment: "positive" | "neutral" | "negative";
      
      if (sentimentResult) {
        finalSentimentResult = sentimentResult;
        legacySentiment = mapToSentiment(sentimentResult.mood);
      } else {
        legacySentiment = analyzeSentiment(journalText);
        finalSentimentResult = {
          mood: legacySentiment,
          confidence: 0.5,
          fineEmotions: [{ label: legacySentiment, score: 0.5 }],
          sarcastic: false
        };
      }

      const coinsEarned = calculateCoins(journalText, finalSentimentResult);

      // Create enhanced journal entry
      const newEntry = {
        id: Date.now().toString(),
        content: journalText,
        date: today,
        sentiment: legacySentiment,
        mood: finalSentimentResult.mood,
        confidence: finalSentimentResult.confidence,
        fineEmotions: finalSentimentResult.fineEmotions,
        sarcastic: finalSentimentResult.sarcastic,
        sarcasticConfidence: finalSentimentResult.sarcasticConfidence,
      };

      const hasJournaledToday = userData.journalEntries.some(
        (e) => e.date === today
      );

      const updatedEntries = [...userData.journalEntries, newEntry];

      let newStreak = userData.streak;
      let totalCoins = 0;
      let xpEarned = 0;

      if (!hasJournaledToday) {
        newStreak += 1;
        const bonusCoins = newStreak % 7 === 0 ? 20 : 0;
        totalCoins = coinsEarned + bonusCoins;
        xpEarned = coinsEarned * 2;
      } else {
        toast("You've already journaled today — this entry won't count for streak/coins.");
      }

      const newXP = userData.petXP + xpEarned;
      const newLevel = Math.floor(newXP / 100) + 1;
      const leveledUp = newLevel > userData.petLevel;

      const newAchievements = [...userData.achievements];
      if (newStreak === 1 && !newAchievements.includes("first-entry"))
        newAchievements.push("first-entry");
      if (newStreak === 7 && !newAchievements.includes("week-warrior"))
        newAchievements.push("week-warrior");
      if (newStreak === 30 && !newAchievements.includes("month-master"))
        newAchievements.push("month-master");
      if (updatedEntries.length === 10 && !newAchievements.includes("ten-entries"))
        newAchievements.push("ten-entries");
      
      // Enhanced emotion-specific achievements
      if (finalSentimentResult.confidence > 0.9 && !newAchievements.includes("confident-analyzer"))
        newAchievements.push("confident-analyzer");
      if (finalSentimentResult.sarcastic && finalSentimentResult.sarcasticConfidence && finalSentimentResult.sarcasticConfidence > 0.8 && !newAchievements.includes("sarcasm-detector"))
        newAchievements.push("sarcasm-detector");

      onUpdateData({
        journalEntries: updatedEntries,
        coins: userData.coins + totalCoins,
        streak: newStreak,
        lastJournalEntry: today,
        petLevel: newLevel,
        petXP: newXP,
        achievements: newAchievements,
      });

      try {
        await axios.post("/api/journals", {
          userId: userData.id,
          content: journalText,
          sentiment: legacySentiment,
          mood: finalSentimentResult.mood,
          confidence: finalSentimentResult.confidence,
          fineEmotions: finalSentimentResult.fineEmotions,
          sarcastic: finalSentimentResult.sarcastic,
          sarcasticConfidence: finalSentimentResult.sarcasticConfidence,
          date: today,
        });
      } catch (err) {
        console.error("Failed to save to backend:", err);
      }

      let toastMessage = `Great work! You earned ${totalCoins} coins and ${xpEarned} XP!`;
      if (leveledUp) toastMessage += ` Level up! Your pet is now level ${newLevel}!`;
      if (newAchievements.length > userData.achievements.length)
        toastMessage += ` Achievement unlocked!`;
      toast(toastMessage);

      setTimeout(() => {
        onBack();
      }, 1200);
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = journalText.trim().split(/\s+/).filter(Boolean).length;
  const progress = Math.min((wordCount / 50) * 100, 100);
  const estimatedCoins = journalText.length >= 20 ? calculateCoins(journalText, sentimentResult || sentiment || "neutral") : 0;

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-white/20 z-10">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-full px-4 py-2 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Button>
              {!apiConfigured && (
                <Badge variant="outline" className="border-red-300 text-red-700">
                  <WifiOff className="w-3 h-3 mr-1" />
                  API Not Configured
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-200 to-yellow-300 px-4 py-2 rounded-full shadow-lg">
                <Coins className="w-4 h-4 text-yellow-700" />
                <span className="font-bold text-yellow-800">{userData.coins}</span>
              </div>
              
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-200 to-purple-300 px-4 py-2 rounded-full shadow-lg">
                <Star className="w-4 h-4 text-purple-700" />
                <span className="font-bold text-purple-800">{userData.streak}</span>
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="text-5xl mb-3"
            >
              📝
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Daily Journal
            </h1>
            <p className="text-gray-600">
              {hasJournaledToday ? "Add another entry to your day" : "Capture your thoughts and feelings"}
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="p-4 text-center">
                <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-blue-800">{userData.journalEntries.length}</div>
                <div className="text-xs text-blue-600">Total Entries</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-green-100">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-green-800">{userData.streak}</div>
                <div className="text-xs text-green-600">Day Streak</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-purple-100">
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-purple-800">{userData.petLevel}</div>
                <div className="text-xs text-purple-600">Pet Level</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Section */}
          <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-700">Writing Progress</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{wordCount} words</span>
                  {estimatedCoins > 0 && (
                    <div className="flex items-center gap-1 text-sm text-yellow-600">
                      <Coins className="w-4 h-4" />
                      <span>+{estimatedCoins}</span>
                    </div>
                  )}
                  {/* Analysis status indicators */}
                  {isAnalyzing && (
                    <Badge variant="outline" className="border-blue-500 text-blue-700">
                      <Brain className="w-3 h-3 mr-1 animate-pulse" />
                      Analyzing...
                    </Badge>
                  )}
                  {analysisError && (
                    <Badge variant="outline" className="border-red-500 text-red-700">
                      <WifiOff className="w-3 h-3 mr-1" />
                      Analysis Failed
                    </Badge>
                  )}
                </div>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-3 bg-gray-100" />
                <div 
                  className="absolute top-0 left-0 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 words</span>
                <span>50+ words (recommended)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">

        {/* API Configuration Warning */}
        {!apiConfigured && (
          <Card className="border-0 shadow-xl bg-gradient-to-r from-yellow-50 to-orange-50 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-yellow-400 to-orange-500" />
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-yellow-500 text-white flex-shrink-0">
                  <WifiOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-yellow-800 mb-2">API Configuration Required</h3>
                  <p className="text-sm text-yellow-700 leading-relaxed mb-3">
                    To enable advanced emotion analysis, please set your REACT_APP_HUGGING_FACE_API_KEY environment variable.
                    You can get a free API key from{" "}
                    <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                      Hugging Face
                    </a>.
                  </p>
                  <p className="text-xs text-yellow-600">
                    Basic journaling will still work, but emotions will be analyzed using simpler methods.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Writing Prompt Section */}
        {!hasJournaledToday && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-indigo-400 to-pink-500" />
              <CardContent className="p-6">
                <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-800 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-500 text-white">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  Writing Inspiration
                </h3>
                
                <AnimatePresence mode="wait">
                  {!currentPrompt ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <p className="text-gray-600 mb-4">
                        Get a personalized prompt to spark your creativity
                      </p>
                      <Button 
                        onClick={handlePromptClick} 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-full shadow-lg transition-all duration-200"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get Writing Prompt
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/30">
                        <p className="text-gray-700 italic text-center text-lg">"{currentPrompt}"</p>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <Button 
                          onClick={usePrompt}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-full shadow-lg"
                        >
                          Use This Prompt
                        </Button>
                        <Button
                          onClick={handlePromptClick}
                          variant="outline"
                          className="px-6 py-2 rounded-full border-2 hover:bg-white/50"
                        >
                          Get Another
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Timer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-500" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-400 to-cyan-500 text-white">
                    <Timer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Focus Timer</h3>
                    <p className="text-sm text-gray-600">Set a timer for focused writing</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-2xl font-mono font-bold text-gray-800">
                    {formatTime(timeRemaining)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={toggleTimer}
                      size="sm"
                      className={`rounded-full px-4 ${
                        isTimerActive 
                          ? "bg-red-500 hover:bg-red-600" 
                          : "bg-green-500 hover:bg-green-600"
                      } text-white shadow-lg`}
                    >
                      {isTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      onClick={resetTimer}
                      size="sm"
                      variant="outline"
                      className="rounded-full px-3"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Writing Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                  <Heart className="w-6 h-6 text-pink-500" />
                  How are you feeling today?
                </h2>
                
                <Button
                  onClick={handleVoiceToText}
                  variant="outline"
                  className={`rounded-full px-4 py-2 transition-all duration-200 ${
                    isListening 
                      ? "bg-red-50 border-red-300 text-red-700 animate-pulse" 
                      : "hover:bg-purple-50 hover:border-purple-300"
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Voice to Text
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <Textarea
                  placeholder="Share your thoughts, feelings, and experiences from today... Let your emotions flow freely onto the page."
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  className="min-h-80 resize-none text-lg leading-relaxed border-2 border-gray-200 rounded-2xl p-6 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
                
                {/* Floating sentiment indicator */}
                {sentiment && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-4 right-4"
                  >
                    <div className={`flex items-center gap-2 bg-gradient-to-r ${getSentimentColor(sentiment)} text-white px-3 py-2 rounded-full shadow-lg`}>
                      {getSentimentIcon(sentiment)}
                      <span className="text-sm font-medium capitalize">{sentiment}</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Enhanced sentiment result display */}
              {sentimentResult && !isAnalyzing && (
                <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={getMoodColor(sentimentResult.mood)}
                      >
                        {getMoodEmoji(sentimentResult.mood)} {sentimentResult.mood}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {Math.round(sentimentResult.confidence * 100)}% confident
                      </span>
                      {sentimentResult.sarcastic && (
                        <Badge variant="outline" className="border-orange-500 text-orange-700">
                          Sarcastic
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Fine emotions display */}
                  {sentimentResult.fineEmotions.length > 1 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Top emotions detected:</p>
                      <div className="flex flex-wrap gap-1">
                        {sentimentResult.fineEmotions.slice(0, 5).map((emotion, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {emotion.label} ({Math.round(emotion.score * 100)}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{journalText.length} characters</span>
                  <span>•</span>
                  <span>{wordCount} words</span>
                  {isListening && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="flex items-center gap-2 text-red-600"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Recording...</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Tips Section */}
        <AnimatePresence>
          {tips.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20, height: 0 }} 
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${getSentimentColor(sentiment || "neutral")}`} />
                <CardContent className="p-6">
                  <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-800 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getSentimentColor(sentiment || "neutral")} text-white`}>
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    Personalized Insights
                  </h3>

                  <div className="space-y-3">
                    {tips.map((tip, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/40"
                      >
                        <p className="text-gray-700 leading-relaxed">{tip}</p>
                      </motion.div>
                    ))}
                  </div>

                  {sentiment === "negative" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-red-500 text-white flex-shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-red-700">
                            Need Additional Support?
                          </h4>
                          <p className="text-red-600 text-sm leading-relaxed">
                            If you're experiencing persistent negative feelings, consider reaching out for support:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                            <div className="bg-white/50 p-3 rounded-lg text-center">
                              <div className="text-red-600 font-medium text-sm">Professional Help</div>
                              <div className="text-xs text-red-500">Mental health counselor</div>
                            </div>
                            <div className="bg-white/50 p-3 rounded-lg text-center">
                              <div className="text-red-600 font-medium text-sm">Crisis Support</div>
                              <div className="text-xs text-red-500">988 (US Hotline)</div>
                            </div>
                            <div className="bg-white/50 p-3 rounded-lg text-center">
                              <div className="text-red-600 font-medium text-sm">Personal Support</div>
                              <div className="text-xs text-red-500">Trusted friend or family</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Previous Entries Section */}
        {userData.journalEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-800 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-500 text-white">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  Recent Entries
                </h3>
                
                <div className="space-y-4">
                  {userData.journalEntries
                    .slice()
                    .reverse()
                    .slice(0, 3)
                    .map((entry: any, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Card className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:shadow-md transition-all duration-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(entry.date).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {entry.mood ? (
                                  <Badge variant="outline" className={`text-xs ${getMoodColor(entry.mood)}`}>
                                    {getMoodEmoji(entry.mood)} {entry.mood}
                                  </Badge>
                                ) : (
                                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getSentimentColor(entry.sentiment)} text-white`}>
                                    {getSentimentIcon(entry.sentiment)}
                                    <span className="capitalize">{entry.sentiment}</span>
                                  </div>
                                )}
                                {entry.confidence && (
                                  <span className="text-xs text-gray-500">
                                    {Math.round(entry.confidence * 100)}%
                                  </span>
                                )}
                                {entry.sarcastic && (
                                  <Badge variant="outline" className="text-xs border-orange-500 text-orange-700">
                                    Sarcastic
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {entry.content.slice(0, 200)}
                              {entry.content.length > 200 && "..."}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </div>
                
                {userData.journalEntries.length > 3 && (
                  <div className="text-center mt-6">
                    <Button variant="outline" className="rounded-full px-6">
                      View All Entries ({userData.journalEntries.length})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="pb-6"
        >
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">{wordCount}</div>
                    <div className="text-xs text-gray-500">Words</div>
                  </div>
                  
                  {estimatedCoins > 0 && (
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-lg font-bold text-yellow-600">
                        <Coins className="w-5 h-5" />
                        <span>+{estimatedCoins}</span>
                      </div>
                      <div className="text-xs text-gray-500">Coins</div>
                    </div>
                  )}
                  
                  {sentiment && (
                    <div className="text-center">
                      <div className={`flex items-center gap-1 text-lg font-bold bg-gradient-to-r ${getSentimentColor(sentiment)} bg-clip-text text-transparent`}>
                        {getSentimentIcon(sentiment)}
                        <span className="capitalize">{sentiment}</span>
                      </div>
                      <div className="text-xs text-gray-500">Mood</div>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={handleSave}
                  disabled={journalText.trim().length < 20 || isSaving || (isAnalyzing && apiConfigured)}
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  {isSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Saving...
                    </motion.div>
                  ) : isAnalyzing && apiConfigured ? (
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 animate-pulse" />
                      Analyzing emotions...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-5 h-5" />
                      Save Entry
                      {estimatedCoins > 0 && (
                        <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                          +{estimatedCoins} coins
                        </span>
                      )}
                    </div>
                  )}
                </Button>
              </div>
              
              {journalText.trim().length < 20 && (
                <div className="text-center text-sm text-gray-500">
                  Write at least 20 characters to save your entry ({20 - journalText.trim().length} more needed)
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default JournalPage; 