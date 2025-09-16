"use client";

import Lottie from "lottie-react";
import { Pet } from "../types"; // Your shared Pet type

// ---- Import Lottie animations ----
// Dog
import dogHappy from "../../animations/dog/happy.json";
import dogSad from "../../animations/dog/sad.json";
import dogCalm from "../../animations/dog/calm.json";
import dogAngry from "../../animations/dog/angry.json";
import dogHungry from "../../animations/dog/hungry.json";
import dogDancing from "../../animations/dog/dancing.json";
// Cat
import catHappy from "../../animations/cat/happy.json";
import catSad from "../../animations/cat/sad.json";
import catCalm from "../../animations/cat/calm.json";
import catAngry from "../../animations/cat/angry.json";
import catHungry from "../../animations/cat/hungry.json";
import catDancing from "../../animations/cat/dancing.json";
// Rabbit
import rabbitHappy from "../../animations/rabbit/happy.json";
import rabbitSad from "../../animations/rabbit/sad.json";
import rabbitCalm from "../../animations/rabbit/calm.json";
import rabbitAngry from "../../animations/rabbit/angry.json";
import rabbitHungry from "../../animations/rabbit/hungry.json";
import rabbitDancing from "../../animations/rabbit/dancing.json";
// Penguin
import penguinHappy from "../../animations/penguin/happy.json";
import penguinSad from "../../animations/penguin/sad.json";
import penguinCalm from "../../animations/penguin/calm.json";
import penguinAngry from "../../animations/penguin/angry.json";
import penguinHungry from "../../animations/penguin/hungry.json";
import penguinDancing from "../../animations/penguin/dancing.json";

export type Mood = "happy" | "sad" | "calm" | "angry" | "hungry" | "dancing";

interface PetAnimationProps {
  pet: Pet;
  mood?: Mood;
  size?: number; // in pixels
}

// ---- Animation Map ----
const petAnimations: Record<Pet["type"], Record<Mood, any>> = {
  dog: {
    happy: dogHappy,
    sad: dogSad,
    calm: dogCalm,
    angry: dogAngry,
    hungry: dogHungry,
    dancing: dogDancing,
  },
  cat: {
    happy: catHappy,
    sad: catSad,
    calm: catCalm,
    angry: catAngry,
    hungry: catHungry,
    dancing: catDancing,
  },
  rabbit: {
    happy: rabbitHappy,
    sad: rabbitSad,
    calm: rabbitCalm,
    angry: rabbitAngry,
    hungry: rabbitHungry,
    dancing: rabbitDancing,
  },
  penguin: {
    happy: penguinHappy,
    sad: penguinSad,
    calm: penguinCalm,
    angry: penguinAngry,
    hungry: penguinHungry,
    dancing: penguinDancing,
  },
};

export function PetAnimation({ pet, mood = "calm", size = 180 }: PetAnimationProps) {
  const animationData = petAnimations[pet.type][mood] ?? petAnimations[pet.type]["calm"];

  return (
    <div className="flex items-center justify-center">
      <Lottie animationData={animationData} loop style={{ width: size, height: size }} />
    </div>
  );
}
