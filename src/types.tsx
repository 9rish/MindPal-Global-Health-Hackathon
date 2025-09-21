export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  is_Premium: boolean;
  coins: number;
  selected_pet: Pet | null;
  journal_entries: any[];
  pet_mood: string;
  createdAt: Date;
  user_type: 'user' | 'therapist';
}

export interface Pet {
    id: string;
    name: string;
    emoji: string;
    description: string;
    color: string;
    type: 'cat' | 'dog' | 'penguin' | 'rabbit';
}

export interface Therapist {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  description: string;
  avatar: string;
  rating: number;
  isOnline: boolean;
  price: number;
  languages: string[];
  responseTime: string;
  user_type: 'therapist';
}

export interface ConnectionRequest {
  id: string;
  userId: string;
  userName: string;
  therapistId: string;
  therapistName: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Date;
  userNote: string;
  userMoodSummary: string;
}