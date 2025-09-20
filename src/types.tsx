export interface Pet {
  name: string;
  emoji: string;
  color: string;
}

// src/types.tsx

export type Profile = {
  id: string;
  updated_at?: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  coins: number;
  pet_type?: string;
  pet_name?: string;
  pet_hunger?: number;
  pet_happiness?: number;
  pet_health?: number;
  last_fed?: string;
  last_played?: string;
};

