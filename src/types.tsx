// src/types.ts
export type PetType = "dog" | "cat" | "rabbit" | "penguin";

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  emoji: string;
  description: string;
  color: string;
}
