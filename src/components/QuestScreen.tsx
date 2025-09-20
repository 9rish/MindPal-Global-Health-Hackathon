import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ArrowLeft, Sparkles, Calendar, Trophy, Zap } from "lucide-react";
import {
  Target,
  Star,
  Clock,
  CheckCircle,
  Heart,
  Brain,
  Smile,
  Gift,
  Coins,
  BookOpen,
  Flame,
} from "lucide-react";
import { UserData } from "../App";

interface QuestPageProps {
  userData: UserData;
  onUpdateData: (updates: Partial<UserData>) => void;
  onBack: () => void;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  category: "daily" | "weekly" | "special";
  difficulty: "easy" | "medium" | "hard";
  rewards: {
    coins: number;
    xp: number;
    special?: string;
  };
  requirements: {
    type: "journal" | "streak" | "mood" | "time" | "words";
    target: number;
    current?: number;
  };
  timeLimit?: string;
  completed: boolean;
  icon: React.ReactNode;
  bgGradient: string;
}

// Generate Daily Quests
const generateDailyQuests = (userData: UserData): Quest[] => {
  const today = new Date().toISOString().split("T")[0];
  const hasJournaledToday = userData.lastJournalEntry === today;

  return [
    {
      id: "daily-journal",
      title: "Daily Reflection",
      description: "Write a journal entry about your day",
      category: "daily",
      difficulty: "easy",
      rewards: { coins: 15, xp: 30 },
      requirements: {
        type: "journal",
        target: 1,
        current: hasJournaledToday ? 1 : 0,
      },
      completed: hasJournaledToday,
      icon: <BookOpen className="w-5 h-5" />,
      bgGradient: "from-blue-400 to-blue-600",
    },
    {
      id: "daily-mindful",
      title: "Mindful Moments",
      description: "Spend 5 minutes in mindful reflection",
      category: "daily",
      difficulty: "easy",
      rewards: { coins: 10, xp: 20 },
      requirements: { type: "time", target: 300, current: 0 },
      completed: false,
      icon: <Brain className="w-5 h-5" />,
      bgGradient: "from-purple-400 to-purple-600",
    },
    {
      id: "daily-gratitude",
      title: "Gratitude Practice",
      description: "Write about three things you're grateful for",
      category: "daily",
      difficulty: "easy",
      rewards: { coins: 12, xp: 25 },
      requirements: { type: "words", target: 100, current: 0 },
      completed: false,
      icon: <Heart className="w-5 h-5" />,
      bgGradient: "from-pink-400 to-pink-600",
    },
  ];
};

// Generate Weekly Quests
const generateWeeklyQuests = (userData: UserData): Quest[] => {
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  return [
    {
      id: "weekly-streak",
      title: "Week Warrior",
      description: "Maintain a 7-day journaling streak",
      category: "weekly",
      difficulty: "medium",
      rewards: { coins: 50, xp: 100, special: "Week Warrior Badge" },
      requirements: { type: "streak", target: 7, current: userData.streak },
      completed: userData.streak >= 7,
      timeLimit: weekFromNow.toISOString(),
      icon: <Flame className="w-5 h-5" />,
      bgGradient: "from-orange-400 to-red-500",
    },
    {
      id: "weekly-explorer",
      title: "Emotion Explorer",
      description: "Experience and journal about different emotions this week",
      category: "weekly",
      difficulty: "medium",
      rewards: { coins: 40, xp: 80 },
      requirements: {
        type: "mood",
        target: 5,
        current: userData.moodsLogged || 0,
      },
      completed: (userData.moodsLogged || 0) >= 5,
      timeLimit: weekFromNow.toISOString(),
      icon: <Smile className="w-5 h-5" />,
      bgGradient: "from-teal-400 to-green-500",
    },
    {
      id: "weekly-wordsmith",
      title: "Wordsmith Wonder",
      description: "Write over 1000 words in journal entries this week",
      category: "weekly",
      difficulty: "hard",
      rewards: { coins: 60, xp: 120 },
      requirements: {
        type: "words",
        target: 1000,
        current: userData.weeklyWordCount || 0,
      },
      completed: (userData.weeklyWordCount || 0) >= 1000,
      timeLimit: weekFromNow.toISOString(),
      icon: <Zap className="w-5 h-5" />,
      bgGradient: "from-yellow-400 to-orange-500",
    },
  ];
};

// Generate Special Quests
const generateSpecialQuests = (userData: UserData): Quest[] => {
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  return [
    {
      id: "special-milestone",
      title: "Journal Milestone",
      description: "Reach 10 total journal entries",
      category: "special",
      difficulty: "medium",
      rewards: { coins: 75, xp: 150, special: "Milestone Achievement" },
      requirements: {
        type: "journal",
        target: 10,
        current: userData.journalEntries.length,
      },
      completed: userData.journalEntries.length >= 10,
      timeLimit: weekFromNow.toISOString(),
      icon: <Trophy className="w-5 h-5" />,
      bgGradient: "from-purple-500 to-indigo-600",
    },
    {
      id: "special-consistency",
      title: "Consistency Champion",
      description: "Journal for 5 consecutive days",
      category: "special",
      difficulty: "hard",
      rewards: { coins: 100, xp: 200, special: "Consistency Crown" },
      requirements: { type: "streak", target: 5, current: userData.streak },
      completed: userData.streak >= 5,
      timeLimit: weekFromNow.toISOString(),
      icon: <Target className="w-5 h-5" />,
      bgGradient: "from-indigo-500 to-purple-600",
    },
  ];
};

// Quest Card Component
const QuestCard = ({
  quest,
  onComplete,
  completingQuest,
  onStartActivity,
}: {
  quest: Quest;
  onComplete: () => void;
  completingQuest: string | null;
  onStartActivity: (questId: string, activityType: string) => void;
}) => {
  const getQuestProgress = () =>
    Math.min(((quest.requirements.current || 0) / quest.requirements.target) * 100, 100);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "daily":
        return <Calendar className="w-4 h-4" />;
      case "weekly":
        return <Clock className="w-4 h-4" />;
      case "special":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const formatTimeLimit = (timeLimit: string) => {
    const date = new Date(timeLimit);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Expired";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
  };

  const isCompleted = quest.completed;
  const canComplete = getQuestProgress() >= 100 && !isCompleted;

  const getActionButtonText = () => {
    if (isCompleted) return "Completed";
    if (completingQuest === quest.id) return "Processing...";
    
    switch (quest.requirements.type) {
      case "time":
        return canComplete ? "Complete Quest" : "Start Timer";
      case "words":
        return canComplete ? "Complete Quest" : "Start Writing";
      case "mood":
        return canComplete ? "Complete Quest" : "Log Mood";
      case "journal":
        return canComplete ? "Complete Quest" : "Write Entry";
      default:
        return canComplete ? "Complete Quest" : "Start Quest";
    }
  };

  const handleButtonClick = () => {
    if (isCompleted || completingQuest === quest.id) return;
    
    if (canComplete) {
      onComplete();
    } else {
      // Start the appropriate activity
      onStartActivity(quest.id, quest.requirements.type);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isCompleted ? { scale: 1.02, y: -2 } : {}}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`relative overflow-hidden border-0 shadow-lg rounded-2xl transition-all duration-300 ${
          isCompleted 
            ? "bg-gradient-to-r from-green-50 to-emerald-50 ring-2 ring-green-200" 
            : "bg-white hover:shadow-xl"
        }`}
      >
        {/* Gradient header bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${quest.bgGradient}`} />
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  isCompleted 
                    ? "bg-green-100 text-green-600" 
                    : `bg-gradient-to-r ${quest.bgGradient} text-white shadow-lg`
                }`}
              >
                {isCompleted ? <CheckCircle className="w-6 h-6" /> : quest.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-lg text-gray-800">{quest.title}</CardTitle>
                  
                  {/* Category icon placed next to title */}
                  <div className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {getCategoryIcon(quest.category)}
                    <span className="text-xs font-medium capitalize">{quest.category}</span>
                  </div>
                  
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{quest.description}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-end">
              <Badge
                variant="secondary"
                className={`text-xs font-medium ${getDifficultyColor(quest.difficulty)}`}
              >
                {quest.difficulty}
              </Badge>
              {quest.timeLimit && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimeLimit(quest.timeLimit)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Progress Section */}
          <div className="mb-6">
            <div className="flex justify-between text-sm font-medium mb-3">
              <span className="text-gray-700">Progress</span>
              <span className="text-gray-600">
                {quest.requirements.current || 0} / {quest.requirements.target}
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={getQuestProgress()} 
                className="h-3 bg-gray-100 rounded-full overflow-hidden"
              />
              {getQuestProgress() > 0 && (
                <div 
                  className={`absolute top-0 left-0 h-3 bg-gradient-to-r ${quest.bgGradient} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${getQuestProgress()}%` }}
                />
              )}
            </div>
          </div>

          {/* Rewards and Action Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Coins */}
              <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full">
                <Coins className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">+{quest.rewards.coins}</span>
              </div>
              
              {/* XP */}
              <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">+{quest.rewards.xp}</span>
              </div>
              
              {/* Special Reward */}
              {quest.rewards.special && (
                <div className="flex items-center gap-1.5 bg-pink-50 px-3 py-1.5 rounded-full">
                  <Gift className="w-4 h-4 text-pink-600" />
                  <span className="text-xs font-medium text-pink-700">{quest.rewards.special}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div>
              {isCompleted ? (
                <Badge className="bg-green-100 text-green-700 border-green-300 px-4 py-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed
                </Badge>
              ) : (
                <Button
                  onClick={handleButtonClick}
                  disabled={completingQuest === quest.id}
                  className={`bg-gradient-to-r ${quest.bgGradient} hover:opacity-90 text-white px-6 py-2 rounded-full font-medium shadow-lg transition-all duration-200`}
                >
                  {completingQuest === quest.id ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="flex items-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      {getActionButtonText()}
                    </motion.div>
                  ) : (
                    getActionButtonText()
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, gradient }: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
}) => (
  <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
    <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          <div className="text-sm text-gray-600">{title}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function QuestPage({ userData, onUpdateData, onBack }: QuestPageProps) {
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [weeklyQuests, setWeeklyQuests] = useState<Quest[]>([]);
  const [specialQuests, setSpecialQuests] = useState<Quest[]>([]);
  const [completingQuest, setCompletingQuest] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "special">("daily");
  const [activeActivity, setActiveActivity] = useState<{
    questId: string;
    type: string;
    timeRemaining?: number;
    wordCount?: number;
  } | null>(null);

  useEffect(() => {
    setDailyQuests(generateDailyQuests(userData));
    setWeeklyQuests(generateWeeklyQuests(userData));
    setSpecialQuests(generateSpecialQuests(userData));
  }, [userData]);

  // Timer effect for time-based quests
  useEffect(() => {
    let interval: number; // <-- change here
    if (activeActivity?.type === "time" && activeActivity.timeRemaining && activeActivity.timeRemaining > 0) {
      interval = window.setInterval(() => { // <-- use window.setInterval
        setActiveActivity(prev => {
          if (!prev || !prev.timeRemaining) return prev;
          const newTime = prev.timeRemaining - 1;
          
          if (newTime <= 0) {
            // Time's up! Update quest progress
            updateQuestProgress(prev.questId, "time", 300);
            return null;
          }
          
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeActivity]);

  const updateQuestProgress = (questId: string, type: string, value: number) => {
    const updateQuests = (quests: Quest[]) => 
      quests.map(quest => 
        quest.id === questId 
          ? { ...quest, requirements: { ...quest.requirements, current: value } }
          : quest
      );

    setDailyQuests(prev => updateQuests(prev));
    setWeeklyQuests(prev => updateQuests(prev));
    setSpecialQuests(prev => updateQuests(prev));
  };

  const handleStartActivity = (questId: string, activityType: string) => {
    switch (activityType) {
      case "time":
        // Start 5-minute timer (300 seconds)
        setActiveActivity({
          questId,
          type: "time",
          timeRemaining: 300
        });
        break;
      
      case "words":
        // Open writing interface
        setActiveActivity({
          questId,
          type: "words",
          wordCount: 0
        });
        break;
      
      case "mood":
        // Open mood selector
        setActiveActivity({
          questId,
          type: "mood"
        });
        break;
      
      case "journal":
        // Redirect to journal (you might want to implement this differently)
        alert("Please use the journal section to write an entry!");
        break;
        
      default:
        break;
    }
  };

  const handleCompleteActivity = (value?: number) => {
    if (!activeActivity) return;
    
    updateQuestProgress(activeActivity.questId, activeActivity.type, value || activeActivity.timeRemaining || 0);
    setActiveActivity(null);
  };

  const handleCancelActivity = () => {
    setActiveActivity(null);
  };

  const handleCompleteQuest = (quest: Quest) => {
    if (quest.completed || completingQuest === quest.id) return;

    setCompletingQuest(quest.id);

    setTimeout(() => {
      const newCoins = userData.coins + quest.rewards.coins;
      const newXP = userData.petXP + quest.rewards.xp;
      const newLevel = Math.floor(newXP / 100) + 1;
      const leveledUp = newLevel > userData.petLevel;

      const newAchievements = [...userData.achievements];
      if (quest.rewards.special) {
        const achievementId = quest.id + "-completed";
        if (!newAchievements.includes(achievementId)) newAchievements.push(achievementId);
      }

      onUpdateData({
        coins: newCoins,
        petXP: newXP,
        petLevel: newLevel,
        achievements: newAchievements,
        completedQuests: [...(userData.completedQuests || []), quest.id],
      });

      // Show success animation
      const celebration = document.createElement('div');
      celebration.innerHTML = `🎉 +${quest.rewards.coins} coins, +${quest.rewards.xp} XP${leveledUp ? ` 🚀 Level ${newLevel}!` : ''}`;
      celebration.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-purple-600 pointer-events-none z-50 animate-bounce bg-white px-6 py-3 rounded-2xl shadow-2xl';
      document.body.appendChild(celebration);
      setTimeout(() => celebration.remove(), 3000);

      setCompletingQuest(null);
    }, 1000);
  };

  const allQuests = [...dailyQuests, ...weeklyQuests, ...specialQuests];
  const completedQuests = allQuests.filter(q => q.completed).length;
  const totalCoinsAvailable = allQuests.reduce((sum, q) => sum + q.rewards.coins, 0);
  const earnedCoins = allQuests.filter(q => q.completed).reduce((sum, q) => sum + q.rewards.coins, 0);

  const questGroups = {
    daily: dailyQuests,
    weekly: weeklyQuests,
    special: specialQuests
  };

  const tabInfo = {
    daily: { icon: <Calendar className="w-4 h-4" />, label: "Daily", gradient: "from-blue-400 to-blue-600" },
    weekly: { icon: <Clock className="w-4 h-4" />, label: "Weekly", gradient: "from-purple-400 to-purple-600" },
    special: { icon: <Sparkles className="w-4 h-4" />, label: "Special", gradient: "from-pink-400 to-pink-600" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-blue-50 to-teal-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-full px-4 py-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-200 to-yellow-300 px-4 py-2 rounded-full shadow-lg">
            <Coins className="w-5 h-5 text-yellow-700" />
            <span className="font-bold text-yellow-800">{userData.coins}</span>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="text-6xl mb-4"
          >
            🎯
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Daily Quests
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Complete challenges to earn coins, gain XP, and strengthen your bond with your pet companion!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard 
            title="Quests Completed"
            value={completedQuests}
            icon={<Trophy className="w-6 h-6" />}
            gradient="from-green-400 to-green-600"
          />
          <StatsCard 
            title="Coins Earned"
            value={`${earnedCoins} / ${totalCoinsAvailable}`}
            icon={<Coins className="w-6 h-6" />}
            gradient="from-yellow-400 to-orange-500"
          />
          <StatsCard 
            title="Current Level"
            value={userData.petLevel}
            icon={<Star className="w-6 h-6" />}
            gradient="from-purple-400 to-purple-600"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-lg border border-white/20">
            {Object.entries(tabInfo).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === key
                    ? `bg-gradient-to-r ${info.gradient} text-white shadow-lg`
                    : "text-gray-600 hover:bg-white/50"
                }`}
              >
                {info.icon}
                {info.label}
                <Badge variant="secondary" className="ml-1 bg-white/20 text-current border-0">
                  {questGroups[key as keyof typeof questGroups].length}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Quest Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6"
          >
            {questGroups[activeTab].map((quest, index) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <QuestCard
                  quest={quest}
                  onComplete={() => handleCompleteQuest(quest)}
                  completingQuest={completingQuest}
                  onStartActivity={handleStartActivity}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Activity Modal */}
        {activeActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            >
              {/* Timer Activity */}
              {activeActivity.type === "time" && (
                <div className="text-center">
                  <div className="text-6xl mb-4">🧘‍♀️</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Mindful Moments</h3>
                  <p className="text-gray-600 mb-6">Take a deep breath and be present</p>
                  
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {Math.floor((activeActivity.timeRemaining || 0) / 60)}:
                      {String((activeActivity.timeRemaining || 0) % 60).padStart(2, '0')}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${100 - ((activeActivity.timeRemaining || 0) / 300) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleCancelActivity}
                    variant="outline"
                    className="rounded-full px-6"
                  >
                    Stop Session
                  </Button>
                </div>
              )}

              {/* Writing Activity */}
              {activeActivity.type === "words" && (
                <div>
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">✍️</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Gratitude Practice</h3>
                    <p className="text-gray-600">Write about what you're grateful for</p>
                  </div>
                  
                  <textarea
                    className="w-full h-40 p-4 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="I'm grateful for..."
                    onChange={(e) => {
                      const wordCount = e.target.value.trim().split(/\s+/).length;
                      setActiveActivity(prev => prev ? { ...prev, wordCount } : null);
                    }}
                  />
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-500">
                      Words: {activeActivity.wordCount || 0} / 100
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCancelActivity}
                        variant="outline"
                        className="rounded-full px-4"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleCompleteActivity(activeActivity.wordCount)}
                        disabled={(activeActivity.wordCount || 0) < 100}
                        className="bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-full px-6"
                      >
                        Complete
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mood Activity */}
              {activeActivity.type === "mood" && (
                <div>
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">😊</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">How are you feeling?</h3>
                    <p className="text-gray-600">Select your current mood</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { emoji: "😊", label: "Happy", value: 1 },
                      { emoji: "😔", label: "Sad", value: 2 },
                      { emoji: "😤", label: "Angry", value: 3 },
                      { emoji: "😰", label: "Anxious", value: 4 },
                      { emoji: "😴", label: "Tired", value: 5 },
                      { emoji: "🤗", label: "Grateful", value: 6 }
                    ].map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => handleCompleteActivity(mood.value)}
                        className="p-4 rounded-2xl border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-all duration-200 text-center"
                      >
                        <div className="text-2xl mb-1">{mood.emoji}</div>
                        <div className="text-xs text-gray-600">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                  
                  <Button
                    onClick={handleCancelActivity}
                    variant="outline"
                    className="w-full rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Completion Message */}
        {completedQuests === allQuests.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="mt-12 text-center"
          >
            <Card className="bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 border-0 shadow-2xl rounded-3xl p-12">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="text-8xl mb-6"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Quest Master!
              </h2>
              <p className="text-gray-700 text-lg">
                You've completed all available quests! Your pet is incredibly proud of your dedication. 🌟
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}