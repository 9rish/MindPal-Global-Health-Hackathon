"use client";

import { motion } from "motion/react";
import { useState, memo, useCallback, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Pet } from "../types";
import { PetAnimation } from "./PetAnimation";
import { animate } from "motion/react";

// Simple utility function to combine class names
function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

interface FeedScreenProps {
  pet: Pet;
  onBack: () => void;
  onCoinsUpdate: (coins: number) => void;
  coins: number;
}

// Glowing Effect Component
interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = "default",
    glow = false,
    className,
    movementDuration = 2,
    borderWidth = 1,
    disabled = true,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>(0);

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current) return;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          if (!element) return;

          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY };
          }

          const center = [left + width * 0.5, top + height * 0.5];
          const distanceFromCenter = Math.hypot(
            mouseX - center[0],
            mouseY - center[1]
          );
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty("--active", "0");
            return;
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          element.style.setProperty("--active", isActive ? "1" : "0");

          if (!isActive) return;

          const currentAngle =
            parseFloat(element.style.getPropertyValue("--start")) || 0;
          let targetAngle =
            (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
              Math.PI +
            90;

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => {
              element.style.setProperty("--start", String(value));
            },
          });
        });
      },
      [inactiveZone, proximity, movementDuration]
    );

    useEffect(() => {
      if (disabled) return;

      const handleScroll = () => handleMove();
      const handlePointerMove = (e: PointerEvent) => handleMove(e);

      window.addEventListener("scroll", handleScroll, { passive: true });
      document.body.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener("scroll", handleScroll);
        document.body.removeEventListener("pointermove", handlePointerMove);
      };
    }, [handleMove, disabled]);

    return (
      <>
        <div
          className={cn(
            "pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
            glow && "opacity-100",
            variant === "white" && "border-white",
            disabled && "!block"
          )}
        />
        <div
          ref={containerRef}
          style={
            {
              "--blur": `${blur}px`,
              "--spread": spread,
              "--start": "0",
              "--active": "0",
              "--glowingeffect-border-width": `${borderWidth}px`,
              "--repeating-conic-gradient-times": "5",
              "--gradient":
                variant === "white"
                  ? `repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  var(--black),
                  var(--black) calc(25% / var(--repeating-conic-gradient-times))
                )`
                  : `radial-gradient(circle, #22c55e 10%, #22c55e00 20%),
                radial-gradient(circle at 40% 40%, #10b981 5%, #10b98100 15%),
                radial-gradient(circle at 60% 60%, #059669 10%, #05966900 20%), 
                radial-gradient(circle at 40% 60%, #047857 10%, #04785700 20%),
                repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  #22c55e 0%,
                  #10b981 calc(25% / var(--repeating-conic-gradient-times)),
                  #059669 calc(50% / var(--repeating-conic-gradient-times)), 
                  #047857 calc(75% / var(--repeating-conic-gradient-times)),
                  #22c55e calc(100% / var(--repeating-conic-gradient-times))
                )`,
            } as React.CSSProperties
          }
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
            glow && "opacity-100",
            blur > 0 && "blur-[var(--blur)] ",
            className,
            disabled && "!hidden"
          )}
        >
          <div
            className={cn(
              "glow",
              "rounded-[inherit]",
              'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
              "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
              "after:[background:var(--gradient)] after:[background-attachment:fixed]",
              "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
              "after:[mask-clip:padding-box,border-box]",
              "after:[mask-composite:intersect]",
              "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
            )}
          />
        </div>
      </>
    );
  }
);

GlowingEffect.displayName = "GlowingEffect";

const foodItems = [
  { id: "apple", name: "Fresh Apple", emoji: "🍎", description: "Crispy and nutritious!", cost: 5, happiness: 10, health: 15 },
  { id: "fish", name: "Premium Fish", emoji: "🐟", description: "Rich in omega-3!", cost: 15, happiness: 20, health: 25 },
  { id: "cake", name: "Birthday Cake", emoji: "🎂", description: "Special treat for celebrations!", cost: 25, happiness: 35, health: 10 },
  { id: "smoothie", name: "Vitamin Smoothie", emoji: "🥤", description: "Packed with nutrients!", cost: 12, happiness: 15, health: 30 },
  { id: "cookie", name: "Heart Cookie", emoji: "🍪", description: "Made with love!", cost: 8, happiness: 18, health: 8 },
  { id: "salad", name: "Garden Salad", emoji: "🥗", description: "Fresh and healthy!", cost: 10, happiness: 12, health: 35 },
];

// Enhanced Food Card Component with Glowing Effect
const FoodCard = ({ food, onFeed, canAfford, isFull, index }: { 
  food: typeof foodItems[0]; 
  onFeed: (food: typeof foodItems[0]) => void; 
  canAfford: boolean;
  isFull: boolean;
  index: number;
}) => {
  const isDisabled = !canAfford || isFull;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ delay: 0.4 + index * 0.1 }} 
      whileHover={!isDisabled ? { scale: 1.02 } : {}} 
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className="relative h-full"
    >
      <div className="relative h-full rounded-2xl border-[0.75px] border-gray-200 p-2">
        <GlowingEffect
          spread={30}
          glow={!isDisabled}
          disabled={isDisabled}
          proximity={80}
          inactiveZone={0.1}
          borderWidth={2}
          movementDuration={1.5}
        />
        <Card className={`relative h-full backdrop-blur-sm border-0 shadow-lg rounded-xl overflow-hidden transition-all duration-300 ${
          isDisabled ? 'bg-gray-200/70' : 'bg-white/90 hover:shadow-2xl'
        }`}>
          <Button 
            onClick={() => onFeed(food)} 
            variant="ghost" 
            disabled={isDisabled} 
            className={`w-full h-full p-4 flex flex-col items-center text-left transition-colors ${
              isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/50'
            }`}
          >
            <motion.div 
              className="text-4xl mb-3"
              whileHover={!isDisabled ? { scale: 1.1, rotate: 5 } : {}}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {food.emoji}
            </motion.div>
            <h4 className="font-medium mb-2 text-gray-800">{food.name}</h4>
            <p className="text-sm text-gray-600 mb-3 text-center leading-relaxed">{food.description}</p>
            <div className="flex items-center justify-between w-full text-xs mt-auto">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-pink-100 px-2 py-1 rounded-full">
                  <span>💖</span>
                  <span className="text-pink-700 font-medium">+{food.happiness}</span>
                </div>
                <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                  <span>🏥</span>
                  <span className="text-green-700 font-medium">+{food.health}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 font-medium bg-yellow-100 px-3 py-1 rounded-full">
                <span>🪙</span>
                <span className="text-yellow-700">{food.cost}</span>
              </div>
            </div>
          </Button>
        </Card>
      </div>
    </motion.div>
  );
};

export function FeedScreen({ pet, onBack, onCoinsUpdate, coins }: FeedScreenProps) {
  const [isFeeding, setIsFeeding] = useState(false);
  const [feedingFood, setFeedingFood] = useState<string | null>(null);
  const [petSatisfaction, setPetSatisfaction] = useState(75);
  const [showReward, setShowReward] = useState(false);
  const [lastReward, setLastReward] = useState({ happiness: 0, health: 0 });
  const [showOverfeedMessage, setShowOverfeedMessage] = useState(false);
  const [lastFeedTime, setLastFeedTime] = useState<number>(Date.now());

  // Satisfaction decay system - decreases by 1% every 30 seconds, minimum 50%
  useEffect(() => {
    const decayInterval = setInterval(() => {
      setPetSatisfaction(prev => {
        const newSatisfaction = Math.max(50, prev - 1); // Minimum 50%, decrease by 1%
        return newSatisfaction;
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(decayInterval);
  }, []);

  const handleFeedPet = (food: typeof foodItems[0]) => {
    // Check if pet is already full
    if (petSatisfaction >= 100) {
      setShowOverfeedMessage(true);
      setTimeout(() => setShowOverfeedMessage(false), 3000);
      return;
    }

    // Check if player has enough coins
    if (coins < food.cost) {
      alert("Not enough coins! 🪙");
      return;
    }

    setIsFeeding(true);
    setFeedingFood(food.id);
    setLastFeedTime(Date.now());
    onCoinsUpdate(coins - food.cost);

    setTimeout(() => {
      setIsFeeding(false);
      setPetSatisfaction(prev => Math.min(100, prev + food.happiness)); // Cap at 100%
      setLastReward({ happiness: food.happiness, health: food.health });
      setShowReward(true);

      setTimeout(() => {
        setShowReward(false);
        setFeedingFood(null);
      }, 3000);
    }, 3000);
  };

  const getSatisfactionColor = () => {
    if (petSatisfaction >= 100) return "text-purple-600 bg-purple-100";
    if (petSatisfaction >= 80) return "text-green-600 bg-green-100";
    if (petSatisfaction >= 60) return "text-yellow-600 bg-yellow-100";
    if (petSatisfaction >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getSatisfactionMessage = () => {
    if (isFeeding) return "Nom nom nom! 🍽️";
    if (petSatisfaction >= 100) return "I'm completely full! Can't eat another bite! 😋";
    if (petSatisfaction >= 80) return "I'm so full and happy!";
    if (petSatisfaction >= 60) return "I could eat a little more!";
    if (petSatisfaction >= 40) return "I'm getting hungry...";
    return "I'm really hungry! 🥺";
  };

  // Decide pet mood based on satisfaction
  const petMood = isFeeding ? "happy" : petSatisfaction >= 80 ? "dancing" : "hungry";
  const isFull = petSatisfaction >= 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="ghost" className="rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/70">← Back</Button>
          <h1 className="text-2xl bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Feed {pet.name}</h1>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-200 to-yellow-300 px-3 py-1 rounded-full">
            <span>🪙</span>
            <span className="text-sm font-medium">{coins}</span>
          </div>
        </motion.div>

        {/* Pet Display */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
          <Card className={`p-6 ${pet.color} border-0 shadow-lg rounded-3xl relative overflow-hidden`}>
            <div className="text-center relative z-10">
              {/* Pet Animation */}
              <PetAnimation pet={pet} mood={petMood} size={180} />

              {feedingFood && isFeeding && (
                <motion.div initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl">
                  {foodItems.find(f => f.id === feedingFood)?.emoji}
                </motion.div>
              )}

              <h3 className="text-xl text-gray-800 mt-4 mb-2">
                {isFeeding ? `${pet.name} is enjoying the meal!` : `${pet.name}'s Hunger Status`}
              </h3>

              <Badge className={`px-3 py-1 ${getSatisfactionColor()}`}>
                Satisfaction: {petSatisfaction}%
                {isFull && " 🔥"}
              </Badge>

              <div className="w-full bg-gray-200 rounded-full h-3 mt-2 mb-2">
                <motion.div 
                  className={`h-3 rounded-full transition-all duration-800 ${
                    isFull 
                      ? 'bg-gradient-to-r from-purple-400 to-purple-500' 
                      : 'bg-gradient-to-r from-green-400 to-green-500'
                  }`}
                  style={{ width: `${petSatisfaction}%` }} 
                  initial={{ width: 0 }} 
                  animate={{ width: `${petSatisfaction}%` }} 
                />
              </div>

              <p className="text-gray-600">
                {getSatisfactionMessage()}
              </p>

              {/* Decay warning when satisfaction is dropping */}
              {petSatisfaction < 80 && petSatisfaction > 50 && (
                <p className="text-xs text-orange-600 mt-2">
                  💭 Satisfaction naturally decreases over time (min 50%)
                </p>
              )}
            </div>

            {/* Eating particles */}
            {isFeeding && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div key={i} className="absolute text-xl" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                    animate={{ y: [0, -20, 0], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: Math.random() * 1.5 }}>
                    {["✨","💫","🌟","💖","🍽️"][Math.floor(Math.random()*5)]}
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Overfeed Warning Message */}
        {showOverfeedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="mb-6"
          >
            <Card className="p-4 bg-gradient-to-r from-orange-100 to-red-100 border-orange-300 border-2 shadow-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">🚫</div>
                <h3 className="text-lg font-bold text-orange-800 mb-2">Can't Overfeed!</h3>
                <p className="text-orange-700">
                  {pet.name} is completely full! Wait for the satisfaction to decrease before feeding again.
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Food Menu with Glowing Effects */}
        {!isFeeding && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                🍽️ Delicious Food Menu
                {isFull && (
                  <span className="ml-2 text-lg text-orange-600">(Pet is Full!)</span>
                )}
              </h3>
              <p className="text-gray-600">
                {isFull 
                  ? `${pet.name} can't eat anymore right now!` 
                  : `Choose the perfect meal for ${pet.name}!`
                }
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {foodItems.map((food, index) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onFeed={handleFeedPet}
                  canAfford={coins >= food.cost}
                  isFull={isFull}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Reward Modal */}
        {showReward && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" initial={{ opacity:0 }} animate={{ opacity:1 }}>
            <motion.div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center" initial={{ scale:0, y:50 }} animate={{ scale:1, y:0 }}>
              <div className="text-6xl mb-4">😋</div>
              <h3 className="text-2xl mb-4 text-gray-800">Delicious!</h3>
              <p className="text-gray-600 mb-6">{pet.name} loved that meal and feels much better!</p>
              <div className="flex justify-center space-x-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl mb-1">💖</div>
                  <div className="text-sm text-gray-600">Happiness</div>
                  <div className="font-medium">+{lastReward.happiness}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-1">🏥</div>
                  <div className="text-sm text-gray-600">Health</div>
                  <div className="font-medium">+{lastReward.health}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
