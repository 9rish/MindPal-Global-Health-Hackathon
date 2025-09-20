"use client";

import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Pet } from "../types";
import { PetAnimation } from "./PetAnimation";
import PetTrainerDuel from "./games/PetTrainerDuel";
import { StarGazingGame } from "./games/StarGazingGame";
import CandyCrushGame from "./games/CandyCrushGame";
import WordscapeGame from "./games/WordscapeGame";
import { BreathingBuddyGame } from "./games/BreathingBuddyGame";

interface PlayScreenProps {
  pet: Pet;
  onBack: () => void;
  onCoinsUpdate: (coins: number) => void;
  coins: number;
}

const playActivities = [
  {
    id: "duel",
    name: "Trainer Duel",
    emoji: "⚔️",
    description: "Race and dodge obstacles in a pet duel!",
    happiness: 30,
    coinReward: 25,
    gradient: "from-red-900 via-orange-900 to-yellow-800",
  },
  {
    id: "stargazing",
    name: "Star Gazing",
    emoji: "🔭",
    description: "Connect the stars and find constellations!",
    happiness: 22,
    coinReward: 18,
    gradient: "from-indigo-900 via-purple-900 to-blue-800",
  },
  {
    id: "candycrush",
    name: "Candy Crush",
    emoji: "🍭",
    description: "Match candies and clear the board!",
    happiness: 28,
    coinReward: 20,
    gradient: "from-pink-900 via-rose-900 to-purple-800",
  },
  {
    id: "wordscape",
    name: "Wordscape",
    emoji: "🔤",
    description: "Find hidden words from scrambled letters!",
    happiness: 25,
    coinReward: 15,
    gradient: "from-green-900 via-emerald-900 to-teal-800",
  },
  {
    id: "breathing",
    name: "Breathing Buddy",
    emoji: "🌬️",
    description: "Follow calming breaths with your pet.",
    happiness: 35,
    coinReward: 20,
    gradient: "from-cyan-900 via-blue-900 to-indigo-800",
  },
];

// Glass Activity Card Component
// Glass Activity Card Component with Dynamic Tilt
const GlassActivityCard = ({ 
  activity, 
  index, 
  onPlay 
}: { 
  activity: typeof playActivities[0]; 
  index: number; 
  onPlay: (activity: typeof playActivities[0]) => void;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Normalize to -1 to 1 range
    const normalizedX = (mouseX / (rect.width / 2)) * 0.5;
    const normalizedY = (mouseY / (rect.height / 2)) * 0.5;
    
    setMousePosition({ x: normalizedX, y: normalizedY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const getTransform = () => {
    if (!isHovered) return '';
    
    // Create 3D rotation based on mouse position
    // Invert X for opposite tilt (right hover tilts left forward)
    const rotateY = -mousePosition.x * 25; // Inverted for opposite effect
    const rotateX = mousePosition.y * 15;
    
    return `rotate3d(${rotateX}, ${rotateY}, 0, ${Math.abs(rotateY) + Math.abs(rotateX)}deg)`;
  };

  const getShadow = () => {
    if (!isHovered) return '';
    
    const shadowX = mousePosition.x * 30;
    const shadowY = mousePosition.y * 20;
    
    return `rgba(0,0,0,0.3) ${shadowX}px ${30 + shadowY}px 25px -20px, rgba(0,0,0,0.1) 0px 25px 30px 0px`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + index * 0.1 }}
      className="group h-[280px] w-full [perspective:1000px] cursor-pointer"
      onClick={() => onPlay(activity)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={cardRef}
    >
      <div 
        className={`relative h-full rounded-[25px] bg-gradient-to-br ${activity.gradient} shadow-2xl transition-all duration-300 ease-out [transform-style:preserve-3d]`}
        style={{
          transform: getTransform(),
          boxShadow: getShadow() || 'rgba(0,0,0,0.2) 0px 10px 20px 0px',
        }}
      >
        
        {/* Glass layer */}
        <div className="absolute inset-2 rounded-[30px] border-b border-l border-white/20 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm [transform-style:preserve-3d] [transform:translate3d(0,0,25px)]"></div>
        
        {/* Main content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between [transform:translate3d(0,0,26px)]">
          
          {/* Top section with emoji */}
          <div className="text-center">
            <div 
              className="text-5xl mb-4 transition-all duration-300"
              style={{
                transform: isHovered ? `translate3d(${mousePosition.x * 10}px, ${mousePosition.y * 5}px, 20px) scale(1.1)` : 'scale(1)',
              }}
            >
              {activity.emoji}
            </div>
            <h4 className="font-bold text-black text-xl mb-2">{activity.name}</h4>
            <p className="text-white/80 text-sm leading-relaxed">
              {activity.description}
            </p>
          </div>

          {/* Bottom section with rewards */}
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-pink-300">
                <span className="text-lg">💖</span>
                <span className="font-medium">+{activity.happiness}</span>
              </div>
              <div className="text-xs text-white/60 mt-1">Happiness</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-yellow-300">
                <span className="text-lg">🪙</span>
                <span className="font-medium">+{activity.coinReward}</span>
              </div>
              <div className="text-xs text-white/60 mt-1">Coins</div>
            </div>
          </div>
        </div>

        {/* Floating circles decoration with parallax */}
        <div className="absolute top-0 right-0 [transform-style:preserve-3d]">
          {[
            { size: "80px", pos: "5px", z: "20px", delay: "0s" },
            { size: "60px", pos: "8px", z: "40px", delay: "0.2s" },
            { size: "40px", pos: "12px", z: "60px", delay: "0.4s" },
            { size: "25px", pos: "15px", z: "80px", delay: "0.6s" },
          ].map((circle, idx) => (
            <div
              key={idx}
              className="absolute aspect-square rounded-full bg-white/10 shadow-[rgba(100,100,111,0.2)_-5px_5px_15px_0px] transition-all duration-300 ease-out"
              style={{
                width: circle.size,
                top: circle.pos,
                right: circle.pos,
                transform: `translate3d(${isHovered ? mousePosition.x * (5 + idx * 2) : 0}px, ${isHovered ? mousePosition.y * (3 + idx) : 0}px, ${circle.z})`,
                transitionDelay: circle.delay,
              }}
            ></div>
          ))}
          
          {/* Central activity icon with enhanced parallax */}
          <div
            className="absolute grid aspect-square w-[30px] place-content-center rounded-full bg-white shadow-[rgba(100,100,111,0.2)_-5px_5px_15px_0px] transition-all duration-300 ease-out [transition-delay:0.8s]"
            style={{ 
              top: "18px", 
              right: "18px",
              transform: `translate3d(${isHovered ? mousePosition.x * 15 : 0}px, ${isHovered ? mousePosition.y * 10 : 0}px, ${isHovered ? '120px' : '100px'})`,
            }}
          >
            <span className="text-sm">{activity.emoji}</span>
          </div>
        </div>

        {/* Interactive reward buttons with parallax */}
        <div className="absolute bottom-4 left-4 flex gap-2 [transform-style:preserve-3d] [transform:translate3d(0,0,26px)]">
          {[
            { icon: "💖", value: activity.happiness, color: "bg-pink-500", delay: "300ms" },
            { icon: "🪙", value: activity.coinReward, color: "bg-yellow-500", delay: "500ms" },
          ].map(({ icon, value, color, delay }, idx) => (
            <button
              key={idx}
              className={`group/reward grid h-[28px] w-[28px] place-content-center rounded-full border-none ${color} shadow-[rgba(0,0,0,0.5)_0px_5px_5px_-3px] transition-all duration-200 ease-in-out hover:scale-110`}
              style={{ 
                transitionDelay: delay,
                transform: isHovered 
                  ? `translate3d(${mousePosition.x * 8}px, ${mousePosition.y * 5}px, 30px)` 
                  : 'translate3d(0,0,0)',
              }}
            >
              <span className="text-xs">{icon}</span>
            </button>
          ))}
        </div>

        {/* Play indicator with parallax */}
        <div 
          className="absolute top-4 left-4 transition-all duration-300 [transform:translate3d(0,0,26px)]"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: `translate3d(${isHovered ? mousePosition.x * 5 : 0}px, ${isHovered ? mousePosition.y * 3 : 0}px, 26px)`,
          }}
        >
          <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
            Click to Play
          </div>
        </div>

        {/* Light reflection effect */}
        <div 
          className="absolute inset-0 rounded-[25px] pointer-events-none transition-opacity duration-300"
          style={{
            background: isHovered 
              ? `linear-gradient(${45 + mousePosition.x * 20}deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)`
              : 'transparent',
            opacity: isHovered ? 1 : 0,
          }}
        ></div>
      </div>
    </motion.div>
  );
};


export function PlayScreen({ pet, onBack, onCoinsUpdate, coins }: PlayScreenProps) {
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [lastReward, setLastReward] = useState({ happiness: 0, coins: 0 });

  const [floatingRewards, setFloatingRewards] = useState<{ id: number; amount: number }[]>([]);
  const rewardId = useRef(0);

  const handleCoinEarned = (amount: number) => {
    rewardId.current++;
    const id = rewardId.current;
    setFloatingRewards((prev) => [...prev, { id, amount }]);

    setTimeout(() => {
      setFloatingRewards((prev) => prev.filter((r) => r.id !== id));
    }, 1500);
  };

  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => {
        setShowReward(false);
        setCurrentActivity(null);
        setIsPlaying(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  const handlePlayActivity = (activity: typeof playActivities[0]) => {
    setCurrentActivity(activity.id);
    setIsPlaying(true);
    setLastReward({ happiness: activity.happiness, coins: activity.coinReward });
  };

  const handleGameWin = (reward?: { happiness: number; coins: number }) => {
    if (!reward) {
      setCurrentActivity(null);
      setIsPlaying(false);
      return;
    }

    onCoinsUpdate(coins + reward.coins);
    setLastReward(reward);
    setShowReward(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 p-6">
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
          <h1 className="text-2xl bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Play with {pet.name}
          </h1>
          <div className="relative flex items-center space-x-2 bg-gradient-to-r from-yellow-200 to-yellow-300 px-3 py-1 rounded-full">
            <span>🪙</span>
            <span className="text-sm font-medium">{coins}</span>

            {floatingRewards.map((r) => (
              <motion.span
                key={r.id}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -20 }}
                transition={{ duration: 1.5 }}
                className="absolute right-0 text-green-600 font-bold"
              >
                +{r.amount}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Pet Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <Card
            className={`p-8 ${pet.color} border-0 shadow-lg rounded-3xl relative overflow-hidden`}
          >
            <div className="relative z-10 flex flex-col items-center">
              <PetAnimation
                pet={pet}
                mood={isPlaying ? "happy" : "calm"}
                size={200}
              />

              {isPlaying && currentActivity && (
                <div className="mt-6">
                  {currentActivity === "duel" && (
                    <PetTrainerDuel
                      petEmoji={pet.emoji}
                      onBack={onBack}
                      onFinish={handleGameWin}
                    />
                  )}
                  {currentActivity === "stargazing" && (
                    <StarGazingGame onWin={() => handleGameWin()} />
                  )}
                  {currentActivity === "candycrush" && (
                    <CandyCrushGame onWin={handleGameWin} />
                  )}
                  {currentActivity === "wordscape" && (
                    <WordscapeGame
                      petEmoji={pet.emoji}
                      onBack={onBack}
                      onWin={handleGameWin}
                      onCoinsUpdate={onCoinsUpdate}
                      coins={coins}
                      onCoinEarned={handleCoinEarned}
                    />
                  )}
                  {currentActivity === "breathing" && (
                    <BreathingBuddyGame onWin={handleGameWin} />
                  )}
                </div>
              )}

              <h3 className="text-xl text-gray-800 mt-4 mb-2">
                {isPlaying
                  ? `Playing ${
                      playActivities.find((a) => a.id === currentActivity)?.name
                    }!`
                  : `${pet.name} is ready to play!`}
              </h3>
              <p className="text-gray-600">
                {isPlaying
                  ? "Having so much fun! 🎉"
                  : "Choose an activity to play together"}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Play Activities with Glass Cards */}
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {playActivities.map((activity, index) => (
              <GlassActivityCard
                key={activity.id}
                activity={activity}
                index={index}
                onPlay={handlePlayActivity}
              />
            ))}
          </motion.div>
        )}

        {/* Reward Modal */}
        {showReward && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl mb-4 text-gray-800">Great Job!</h3>
              <p className="text-gray-600 mb-6">
                {pet.name} had an amazing time playing with you!
              </p>
              <div className="flex justify-center space-x-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl mb-1">💖</div>
                  <div className="text-sm text-gray-600">Happiness</div>
                  <div className="font-medium">+{lastReward.happiness}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-1">🪙</div>
                  <div className="text-sm text-gray-600">Coins</div>
                  <div className="font-medium">+{lastReward.coins}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
