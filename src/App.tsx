import { useState, useEffect } from "react";
import { PetSelection } from "./components/PetSelection";
import { PetCompanion } from "./components/PetCompanion";
import { JournalScreen } from "./components/JournalScreen";
import { QuestsAndCoins } from "./components/QuestsAndCoins";
import { CustomizationScreen } from "./components/CustomizationScreen";
import { PlayScreen } from "./components/PlayScreen";
import { FeedScreen } from "./components/FeedScreen";
import { AnalyticsScreen } from "./components/AnalyticsScreen";
import { analyzeMoods } from "./utils/moodAnalytics";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { motion } from "motion/react";
import  MindPalLeaderboard from "./components/mindpal_leaderboard";
import { Pet } from './types';


interface JournalEntry {
  mood:
    | "happy"
    | "sad"
    | "calm"
    | "anxious"
    | "excited"
    | "angry"
    | "irritated"
    | "frustrated"
    | "content"
    | "energetic";
  content: string;
  date: Date;
  confidence?: number;
  aiAnalysis?: string;
}

type Screen =
  | "pet-selection"
  | "home"
  | "journal"
  | "quests"
  | "customization"
  | "play"
  | "feed"
  | "subscription"
  | "analytics"
  | "leaderboard";
type PetMood = "happy" | "sad" | "calm" | "angry";

export default function App() {
  const [openGroup, setOpenGroup] =
  useState<null | "tracking" | "pet" | "explore">(null);
  const toggleGroup = (g: "tracking" | "pet" | "explore") =>
  setOpenGroup(prev => (prev === g ? null : g));

  const [currentScreen, setCurrentScreen] =
    useState<Screen>("pet-selection");
  const [selectedPet, setSelectedPet] = useState<Pet | null>(
    null,
  );
  const [coins, setCoins] = useState(100);
  const [journalEntries, setJournalEntries] = useState<
    JournalEntry[]
  >([]);
  const [petMood, setPetMood] = useState<PetMood>("calm");
  const [lastJournaled, setLastJournaled] =
    useState<Date | null>(null);
  const [showWelcomeAnimation, setShowWelcomeAnimation] =
    useState(false);
  const [showRiskNudge, setShowRiskNudge] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] =
    useState(false);
  const [showMoodReward, setShowMoodReward] = useState(false);
  const [currentMoodReward, setCurrentMoodReward] =
    useState<any>(null);
  const [showPremiumSuccess, setShowPremiumSuccess] =
    useState(false);
    
  // Load data from localStorage on mount
  useEffect(() => {
    // Load saved coins
    const savedCoins = localStorage.getItem("mindpal-coins");
    if (savedCoins) {
      setCoins(parseInt(savedCoins));
    }

    // Load saved journal entries
    const savedEntries = localStorage.getItem("mindpal-entries");
    if (savedEntries) {
      const entries = JSON.parse(savedEntries);
      setJournalEntries(entries);
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1];
        setLastJournaled(new Date(lastEntry.date));
        updatePetMood(lastEntry.mood);
      }
    }

    // Load saved pet mood if available
    const savedPetMood = localStorage.getItem("mindpal-pet-mood");
    if (savedPetMood) {
      setPetMood(savedPetMood as PetMood);
    }

    // Load premium status
    const savedPremium = localStorage.getItem("mindpal-premium");
    if (savedPremium === "true") {
      setIsPremium(true);
    }

    // Load saved pet - but don't automatically go to home screen
    const savedPet = localStorage.getItem("mindpal-pet");
    if (savedPet) {
      const pet = JSON.parse(savedPet);
      setSelectedPet(pet);
      // Remove this line to stay on pet selection screen:
      // setCurrentScreen("home");
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (selectedPet) {
      localStorage.setItem(
        "mindpal-pet",
        JSON.stringify(selectedPet),
      );
    }
  }, [selectedPet]);

  useEffect(() => {
    localStorage.setItem("mindpal-coins", coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem(
      "mindpal-entries",
      JSON.stringify(journalEntries),
    );
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem(
      "mindpal-premium",
      isPremium.toString(),
    );
  }, [isPremium]);

  // Check for risk patterns and show nudges
  useEffect(() => {
    if (journalEntries.length >= 3) {
      const recentEntries = journalEntries.slice(-3);
      const negativeEntries = recentEntries.filter(
        (entry) =>
          entry.mood === "sad" || entry.mood === "anxious",
      );

      if (negativeEntries.length >= 2) {
        setTimeout(() => setShowRiskNudge(true), 2000);
      }
    }
  }, [journalEntries]);

  const updatePetMood = (journalMood: string) => {
    const moodMapping: { [key: string]: PetMood } = {
      happy: "happy",
      excited: "happy",
      energetic: "happy",
      content: "calm",
      calm: "calm",
      sad: "sad",
      anxious: "sad",
      angry: "sad",
      irritated: "sad",
      frustrated: "sad",
    };
    const newPetMood = moodMapping[journalMood] || "calm";
    setPetMood(newPetMood);

    // Store pet mood in localStorage for persistence
    localStorage.setItem("mindpal-pet-mood", newPetMood);
  };

  const handlePetSelected = (pet: Pet) => {
    setSelectedPet(pet);
    setShowWelcomeAnimation(true);
    setTimeout(() => {
      setCurrentScreen("home");
      setShowWelcomeAnimation(false);
    }, 2000);
  };

  const handleJournalSubmit = (entry: JournalEntry) => {
    const newEntries = [...journalEntries, entry];
    setJournalEntries(newEntries);
    setLastJournaled(entry.date);
    updatePetMood(entry.mood);
    setCoins((prev) => prev + 25); // Reward for journaling

    // Check for mood-based rewards
    const analytics = analyzeMoods(newEntries);
    const unclaimedRewards = analytics.rewards.filter(
      (reward) => {
        // Simple check - in a real app you'd track claimed rewards properly
        return (
          reward.type === "positive_streak" ||
          reward.type === "consistency_bonus"
        );
      },
    );

    if (unclaimedRewards.length > 0) {
      setCurrentMoodReward(unclaimedRewards[0]);
      setTimeout(() => setShowMoodReward(true), 1000);
    }

    setCurrentScreen("home");

    // Show confetti animation
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.innerHTML = "🎉✨🎊";
      confetti.className =
        "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl pointer-events-none z-50";
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 2000);
    }, 500);
  };

  const getStreakCount = () => {
    if (journalEntries.length === 0) return 0;
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const hasEntry = journalEntries.some((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.toDateString() === checkDate.toDateString()
        );
      });

      if (hasEntry) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  };

  const handlePremiumFeature = (feature: string) => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }

    // Handle premium features
    if (feature === "play") {
      setCurrentScreen("play");
    } else if (feature === "feed") {
      setCurrentScreen("feed");
    }
  };

  const handleSubscribe = () => {
    setIsPremium(true);
    setShowPremiumModal(false);
    setShowPremiumSuccess(true);

    // Add bonus coins for subscribing
    setCoins((prev) => prev + 200);

    // Show success message and confetti
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.innerHTML = "🎉👑✨🎊💎";
      confetti.className =
        "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl pointer-events-none z-50 animate-pulse";
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }, 500);

    // In a real app, this would handle payment processing
  };

  // Add a function to reset and go back to pet selection
  const resetToPetSelection = () => {
    setCurrentScreen("pet-selection");
    setSelectedPet(null);
    localStorage.removeItem("mindpal-pet");
  };

  if (showWelcomeAnimation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-violet-100 via-blue-50 to-teal-100">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated confetti */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 360, 720],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 0.5,
              }}
            >
              {
                ["🎉", "✨", "🎊", "🌟", "💫"][
                  Math.floor(Math.random() * 5)
                ]
              }
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <div
            className={`p-12 rounded-full ${selectedPet?.color} mb-6 shadow-2xl`}
          >
            <div className="text-8xl">{selectedPet?.emoji}</div>
          </div>
          <h2 className="text-3xl mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-medium">
            Welcome to MindPal!
          </h2>
          <p className="text-xl text-gray-700">
            {selectedPet?.name} is excited to be your wellness
            companion! 🌟
          </p>
        </motion.div>
      </div>
    );
  }

  if (currentScreen === "pet-selection") {
    return <PetSelection onPetSelected={handlePetSelected} />;
  }

  if (currentScreen === "journal") {
    return (
      <JournalScreen
        onJournalSubmit={handleJournalSubmit}
        onBack={() => setCurrentScreen("home")}
        petName={selectedPet?.name || ""}
      />
    );
  }

  if (currentScreen === "quests") {
    return (
      <QuestsAndCoins
        coins={coins}
        onCoinsUpdate={setCoins}
        onBack={() => setCurrentScreen("home")}
      />
    );
  }

  if (currentScreen === "customization") {
    return (
      <CustomizationScreen
        pet={selectedPet!}
        coins={coins}
        onCoinsUpdate={setCoins}
        onBack={() => setCurrentScreen("home")}
      />
    );
  }

  if (currentScreen === "play") {
    return (
      <PlayScreen
        pet={selectedPet!}
        coins={coins}
        onCoinsUpdate={setCoins}
        onBack={() => setCurrentScreen("home")}
      />
    );
  }

  if (currentScreen === "feed") {
    return (
      <FeedScreen
        pet={selectedPet!}
        coins={coins}
        onCoinsUpdate={setCoins}
        onBack={() => setCurrentScreen("home")}
      />
    );
  }

  if (currentScreen === "analytics") {
    return (
      <AnalyticsScreen
        journalEntries={journalEntries}
        coins={coins}
        onCoinsUpdate={setCoins}
        onBack={() => setCurrentScreen("home")}
        petName={selectedPet?.name || "Your Pet"}
      />
    );
  }

  if (currentScreen === "leaderboard") {
  return (
    <MindPalLeaderboard
      league="Gold League"
      timeRemaining="3 days"
      players={[
        { id: 1, name: "Prisha", country: "🇮🇹", xp: 73, streak: 7, avatar: "P", delta: +1 },
        { id: 2, name: "Ibrahim", country: "🇺🇸", xp: 72, streak: 11, avatar: "🦖", delta: -1 },
        { id: 3, name: "Andreana N.", country: "🇺🇸", xp: 70, streak: 9, avatar: "A", delta: 0 },
        { id: 4, name: "Liam", country: "🇨🇦", xp: 68, streak: 5, avatar: "L", delta: +2 },]}
        onNavigate={setCurrentScreen}
        />
      );
    }


  // Home Dashboard 
  return (
    <div className="min-h-screen p-6 relative overflow-hidden bg-gradient-to-br from-violet-100 via-blue-50 to-teal-100">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-16 left-8 text-6xl animate-pulse">
          🌸
        </div>
        <div className="absolute top-32 right-16 text-5xl animate-bounce delay-1000">
          ✨
        </div>
        <div className="absolute bottom-40 left-12 text-7xl animate-pulse delay-2000">
          🌈
        </div>
        <div className="absolute bottom-16 right-8 text-4xl animate-bounce delay-500">
          💫
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-gray-800 mb-2 font-medium">
              Hello! 👋
            </h1>
            <p className="text-gray-600">
              How are you feeling today?
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Add button to go back to pet selection */}
            <Button
              onClick={resetToPetSelection}
              variant="outline"
              size="sm"
              className="rounded-full px-3 py-1 text-xs"
            >
              🔄 Change Pet
            </Button>
            
            {isPremium && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-pink-200 to-purple-300 px-3 py-1 rounded-full">
                <span>👑</span>
                <span className="text-sm font-medium">
                  Premium
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-200 to-purple-300 px-3 py-1 rounded-full">
              <span>🔥</span>
              <span className="text-sm font-medium">
                {getStreakCount()} day streak
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-200 to-yellow-300 px-3 py-1 rounded-full">
              <span>🪙</span>
              <span className="text-sm font-medium">
                {coins}
              </span>
            </div>
          </div>
        </div>

        {/* Pet Companion */}
        <div className="mb-8">
          <PetCompanion
            pet={selectedPet!}
            mood={petMood}
            lastJournaled={lastJournaled || undefined}
          />
        </div>

        {/* Current Mood Display */}
        {journalEntries.length > 0 && (
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 backdrop-blur-sm border-0 shadow-lg rounded-2xl mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {petMood === "happy" && "😊"}
                  {petMood === "sad" && "😢"}
                  {petMood === "calm" && "😌"}
                  {petMood === "angry" && "😡"}

                </div>
                <div>
                  <h3 className="font-medium text-gray-800 flex items-center space-x-1">
                    <span>Current Mood</span>
                    <span className="text-purple-600">🤖</span>
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {petMood}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500 text-center">
                <div>AI-detected from</div>
                <div>your journal writing</div>
              </div>
            </div>
          </Card>
        )}

       {/* Action Buttons — Grouped + Expandable */}
<div className="space-y-6 mb-8">


  {/* === GROUP: TRACKING === */}
  <motion.div
    whileHover={{ scale: 1.01 }}
    className="rounded-2xl overflow-hidden shadow-lg"
  >
    {/* Header (click to open/close) */}
    <button
      onClick={() => toggleGroup("tracking")}
      className="w-full h-18 md:h-20 bg-gradient-to-r from-blue-400 to-blue-500 text-white
                 flex items-center justify-between px-6 md:px-6 py-4 md:py-5 mt-4 rounded-2xl"
    >
      <div className="flex items-center gap-3 md:gap-4">
        <span className="text-2xl">📈</span>
        <div className="text-left">
          <div className="text-lg md:text-xl font-semibold">Tracking</div>
          <div className="text-xs md:text-sm opacity-90">Journal & daily quests</div>
        </div>
      </div>
      <span className="text-xl md:text-2xl">{openGroup === "tracking" ? "▴" : "▾"}</span>
    </button>

    {/* Expanded Content */}
    <motion.div
      initial={false}
      animate={{ height: openGroup === "tracking" ? "auto" : 0, opacity: openGroup === "tracking" ? 1 : 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white"
      style={{ overflow: "hidden" }}
    >
      <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setCurrentScreen("journal")}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-blue-400 to-blue-500 text-white
                       shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 relative"
          >
            <span className="text-2xl">📔</span>
            <span className="text-lg font-medium">Write Journal</span>
            {!isPremium && journalEntries.length > 0 && (
              <span className="absolute top-2 right-3 text-[10px] px-2 py-0.5 rounded-full bg-white/20">🤖 AI</span>
            )}
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setCurrentScreen("quests")}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white
                       shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🎯</span>
            <span className="text-lg font-medium">Daily Quests</span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  </motion.div>

  {/* === GROUP: PET === */}
  <motion.div
    whileHover={{ scale: 1.01 }}
    className="rounded-2xl overflow-hidden shadow-lg"
  >
    <button
      onClick={() => toggleGroup("pet")}
      className="w-full h-18 md:h-20 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 text-white
                 flex items-center justify-between px-6 md:px-6 py-4 md:py-5 mt-4 rounded-2xl "
    >
      <div className="flex items-center gap-3 md:gap-4">
        <span className="text-2xl">🐾</span>
        <div className="text-left">
          <div className="text-lg md:text-xl font-semibold">Pet</div>
          <div className="text-xs md:text-sm opacity-90">Customize, play, feed</div>
        </div>
      </div>
      <span className="text-xl md:text-2xl">{openGroup === "pet" ? "▴" : "▾"}</span>
    </button>

    <motion.div
      initial={false}
      animate={{ height: openGroup === "pet" ? "auto" : 0, opacity: openGroup === "pet" ? 1 : 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white"
      style={{ overflow: "hidden" }}
    >
      <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setCurrentScreen("customization")}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-purple-500 via-violet-600 to-indigo-600 text-white
                       shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🛍️</span>
            <span className="text-lg font-medium">Customize</span>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => handlePremiumFeature("play")}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 text-white
                       shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 relative"
          >
            <span className="text-2xl">🎮</span>
            <span className="text-lg font-medium">Play</span>
            {!isPremium && (
              <span className="absolute top-2 right-3 text-[10px] px-2 py-0.5 rounded-full bg-white/25">👑 PRO</span>
            )}
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => handlePremiumFeature("feed")}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 text-white
                       shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 relative"
          >
            <span className="text-2xl">🍽️</span>
            <span className="text-lg font-medium">Feed</span>
            {!isPremium && (
              <span className="absolute top-2 right-3 text-[10px] px-2 py-0.5 rounded-full bg-white/25">👑 PRO</span>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  </motion.div>

  {/* === GROUP: EXPLORE === */}
  <motion.div
    whileHover={{ scale: 1.01 }}
    className="rounded-2xl overflow-hidden shadow-lg"
  >
    <button
      onClick={() => toggleGroup("explore")}
      className="w-full h-18 md:h-20 bg-gradient-to-r from-indigo-400 to-purple-500 text-white
           flex items-center justify-between px-6 md:px-6 py-4 md:py-5 mt-4 rounded-2xl"

    >
      <div className="flex items-center gap-3 md:gap-4">
        <span className="text-2xl">🧭</span>
        <div className="text-left">
          <div className="text-lg md:text-xl font-semibold">Explore</div>
          <div className="text-xs md:text-sm opacity-90">Leaderboard & premium</div>
        </div>
      </div>
      <span className="text-xl md:text-2xl">{openGroup === "explore" ? "▴" : "▾"}</span>
    </button>

    <motion.div
      initial={false}
      animate={{ height: openGroup === "explore" ? "auto" : 0, opacity: openGroup === "explore" ? 1 : 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white"
      style={{ overflow: "hidden" }}
    >
      <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setCurrentScreen("leaderboard")}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-500 text-white
                       shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🏆</span>
            <span className="text-lg font-medium">Leaderboard</span>
          </Button>
        </motion.div>

        {!isPremium ? (
          <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => setShowPremiumModal(true)}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500 text-white
                         shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
            >
              <span className="text-2xl">👑</span>
              <span className="text-lg font-medium">Get Premium</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => {
                alert("👑 Premium Active!\nManage subscription in the real app.");
              }}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-purple-400 to-fuchsia-500 text-white
                         shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
            >
              <span className="text-2xl">👑</span>
              <span className="text-lg font-medium">Premium Active</span>
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  </motion.div>

</div>

        {/* Analytics Button */}
        {journalEntries.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={() => setCurrentScreen("analytics")}
              className="w-full h-16 bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 text-white rounded-2xl shadow-lg flex items-center justify-center space-x-3 font-medium"
            >
              <span className="text-3xl">📊</span>
              <div className="text-left">
                <div className="text-lg">
                  View Mood Analytics
                </div>
                <div className="text-sm opacity-90">
                  Complete history & insights
                </div>
              </div>
            </Button>
          </motion.div>
        )}

        {/* Recent Journal Entries */}
        {journalEntries.length > 0 && (
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-800 font-medium">
                Recent Journal Entries
              </h3>
              {journalEntries.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full px-3 py-1"
                  onClick={() => {
                    // Could implement a full journal history view here
                    alert(
                      `You have ${journalEntries.length} total journal entries! 📖`,
                    );
                  }}
                >
                  View All ({journalEntries.length})
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {journalEntries
                .slice(-3)
                .reverse()
                .map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white"
                  >
                    <div className="text-2xl">
                      {entry.mood === "happy" && "😊"}
                      {entry.mood === "excited" && "🤗"}
                      {entry.mood === "energetic" && "⚡"}
                      {entry.mood === "content" && "😌"}
                      {entry.mood === "calm" && "🕯️"}
                      {entry.mood === "sad" && "😢"}
                      {entry.mood === "anxious" && "😰"}
                      {entry.mood === "angry" && "😡"}
                      {entry.mood === "irritated" && "😤"}
                      {entry.mood === "frustrated" && "😓"}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 text-sm mb-1">
                        {entry.content.slice(0, 100)}
                        {entry.content.length > 100 && "..."}
                      </p>
                      {entry.aiAnalysis && (
                        <p className="text-xs text-purple-600 bg-purple-50 rounded-lg px-2 py-1 mb-2">
                          🤖 {entry.aiAnalysis.slice(0, 80)}
                          {entry.aiAnalysis.length > 80 &&
                            "..."}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {new Date(
                            entry.date,
                          ).toLocaleDateString()}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize bg-purple-100 text-purple-700 hover:bg-purple-200"
                        >
                          🤖 {entry.mood}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>

            {journalEntries.length === 1 && (
              <div className="text-center mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="text-2xl mb-2">🌱</div>
                <p className="text-sm text-gray-600">
                  Great start! Keep journaling to track your
                  emotional journey with {selectedPet?.name}.
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Risk Nudge Modal */}
        {showRiskNudge && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 50 }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🫂</div>
                <h3 className="text-xl mb-4 text-gray-800 font-medium">
                  {selectedPet?.name} Notices You Might Need
                  Extra Care
                </h3>
                <p className="text-gray-600 mb-6">
                  It's okay to have difficult days. Would you
                  like to try a calming breathing exercise
                  together?
                </p>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-2xl py-3 font-medium"
                    onClick={() => {
                      setShowRiskNudge(false);
                      // Could implement breathing exercise here
                    }}
                  >
                    Try Breathing Exercise 🧘‍♀️
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl py-3 font-medium"
                    onClick={() => setShowRiskNudge(false)}
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Premium Subscription Modal */}
        {showPremiumModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowPremiumModal(false);
              }
            }}
          >
            <motion.div
              className="bg-white rounded-3xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with close button */}
              <div className="flex items-center justify-between p-6 pb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl"
                >
                  👑
                </motion.div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPremiumModal(false)}
                  className="rounded-full h-8 w-8 p-0 hover:bg-gray-100"
                >
                  ✕
                </Button>
              </div>

              {/* Scrollable content */}
              <div className="px-6 overflow-y-auto flex-1">
                <div className="text-center mb-6">
                  <h3 className="text-2xl mb-4 text-gray-800 font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Upgrade to MindPal Premium
                  </h3>
                  <p className="text-gray-600">
                    Unlock advanced features for a deeper bond
                    with {selectedPet?.name}!
                  </p>
                </div>

                <div className="space-y-4 mb-6 text-left">
                  <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="text-2xl">🎮</div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Interactive Play Activities
                      </h4>
                      <p className="text-sm text-gray-600">
                        Play fetch, dance, solve puzzles and go
                        on adventures together!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
                    <div className="text-2xl">🍽️</div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Pet Feeding System
                      </h4>
                      <p className="text-sm text-gray-600">
                        Feed your pet delicious meals and watch
                        their happiness grow!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="text-2xl">🧠</div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Advanced AI Insights
                      </h4>
                      <p className="text-sm text-gray-600">
                        Deeper emotional analysis and
                        personalized wellness recommendations!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                    <div className="text-2xl">🔮</div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Therapy Add-ons
                      </h4>
                      <p className="text-sm text-gray-600">
                        Guided meditation, breathing exercises,
                        and therapeutic activities!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                    <div className="text-2xl">✨</div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Enhanced Personalization
                      </h4>
                      <p className="text-sm text-gray-600">
                        Exclusive pet customizations,
                        environments, and premium content!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-6">
                  <div className="text-3xl mb-2">🎉</div>
                  <h4 className="font-medium text-gray-800 mb-1">
                    Special Demo Price!
                  </h4>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg line-through text-gray-500">
                      $9.99/month
                    </span>
                    <span className="text-2xl font-bold text-purple-600">
                      FREE
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    This is a demo - enjoy all features!
                  </p>
                </div>
              </div>

              {/* Fixed footer with buttons */}
              <div className="p-6 pt-4 border-t border-gray-100">
                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white rounded-2xl py-4 font-medium text-lg shadow-lg"
                    onClick={handleSubscribe}
                  >
                    🚀 Activate Premium Features (Demo)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl py-3 font-medium"
                    onClick={() => setShowPremiumModal(false)}
                  >
                    Maybe Later
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  This is a prototype demo. In the real app,
                  this would connect to payment processing! 💜
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Mood Reward Modal */}
        {showMoodReward && currentMoodReward && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 50 }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 1, repeat: 2 }}
                className="text-6xl mb-4"
              >
                {currentMoodReward.emoji}
              </motion.div>

              <h3 className="text-xl mb-4 text-gray-800 font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentMoodReward.title}
              </h3>

              <p className="text-gray-600 mb-6">
                {currentMoodReward.description}
              </p>

              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 mb-6">
                <div className="text-3xl mb-2">🪙</div>
                <h4 className="font-medium text-gray-800 mb-1">
                  Bonus Reward!
                </h4>
                <p className="text-2xl font-bold text-orange-600">
                  +{currentMoodReward.coinReward} Coins
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl py-3 font-medium"
                  onClick={() => {
                    setCoins(
                      (prev) =>
                        prev + currentMoodReward.coinReward,
                    );
                    setShowMoodReward(false);
                    setCurrentMoodReward(null);
                  }}
                >
                  Claim Reward! 🎉
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-2xl py-3 font-medium"
                  onClick={() => {
                    setShowMoodReward(false);
                    setCurrentMoodReward(null);
                  }}
                >
                  Maybe Later
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Keep up the great work with your emotional
                wellness journey! 💜
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Premium Success Modal */}
        {showPremiumSuccess && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 50 }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{ duration: 2, repeat: 1 }}
                className="text-6xl mb-4"
              >
                👑
              </motion.div>

              <h3 className="text-2xl mb-4 text-gray-800 font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome to Premium!
              </h3>

              <p className="text-gray-600 mb-6">
                🎉 You now have access to all premium features!{" "}
                {selectedPet?.name} is excited to play and
                explore with you.
              </p>

              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 mb-6">
                <div className="text-3xl mb-2">🪙</div>
                <h4 className="font-medium text-gray-800 mb-1">
                  Welcome Bonus!
                </h4>
                <p className="text-2xl font-bold text-orange-600">
                  +200 Coins
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  For joining premium!
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl py-3 font-medium"
                  onClick={() => setShowPremiumSuccess(false)}
                >
                  Start Exploring! 🚀
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-2xl py-3 font-medium"
                  onClick={() => {
                    setShowPremiumSuccess(false);
                    handlePremiumFeature("play");
                  }}
                >
                  Play with {selectedPet?.name} Now! 🎮
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Try the new Play and Feed features from the main
                menu! 💜
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
