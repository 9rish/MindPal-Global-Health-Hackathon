// src/components/PetSelection.tsx
import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Pet } from "../types"; // ← use shared Pet type

const pets: Pet[] = [
  {
    id: "cat",
    name: "Whiskers",
    emoji: "🐱",
    description: "Calm & Wise",
    color: "bg-gradient-to-r from-purple-200 to-purple-300",
    type: "cat", // required by shared Pet type
  },
  {
    id: "dog",
    name: "Buddy",
    emoji: "🐶",
    description: "Loyal & Energetic",
    color: "bg-gradient-to-r from-blue-200 to-blue-300",
    type: "dog",
  },
  {
    id: "penguin",
    name: "Zen",
    emoji: "🐧",
    description: "Peaceful & Mindful",
    color: "bg-gradient-to-r from-green-200 to-green-300",
    type: "penguin",
  },
  {
    id: "rabbit",
    name: "Hop",
    emoji: "🐰",
    description: "Gentle & Caring",
    color: "bg-gradient-to-r from-pink-200 to-pink-300",
    type: "rabbit",
  },
];

interface PetSelectionProps {
  onPetSelected: (pet: Pet) => void;
}

export function PetSelection({ onPetSelected }: PetSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-blue-50 to-teal-100 p-6 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-8"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-4 text-6xl"
        >
          🌟
        </motion.div>
        <h1 className="text-4xl mb-2 bg-gradient-to-r from-violet-600 to-teal-600 bg-clip-text text-transparent">
          Welcome to MindPal!
        </h1>
        <p className="text-lg text-gray-600 max-w-md">
          Choose your companion to start your wellness journey together
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
        {pets.map((pet, index) => (
          <motion.div
            key={pet.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: "easeOut",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card
              className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer rounded-3xl"
              onClick={() => onPetSelected(pet)}
            >
              <div className="text-center">
                <div className="relative mb-4">
                  <div
                    className={`w-20 h-20 rounded-full ${pet.color} flex items-center justify-center mx-auto shadow-md`}
                  >
                    <span className="text-4xl">{pet.emoji}</span>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 text-xl"
                  >
                    ✨
                  </motion.div>
                </div>
                <h3 className="text-lg mb-1 font-medium">{pet.name}</h3>
                <p className="text-sm text-gray-500">{pet.description}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-gray-500">
          Tap on a companion to get started! 🎮
        </p>
      </motion.div>
    </div>
  );
}
