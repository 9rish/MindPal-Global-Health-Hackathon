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

// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  isPremium: boolean;
  premiumExpiresAt?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Voice Journal Types
export interface VoiceJournalEntry {
  id: string;
  audioUrl: string;
  audioBlob: Blob;
  duration: number; // in seconds
  transcription?: string;
  mood?: string;
  date: Date;
  userId: string;
}

// Therapist Booking Types
export interface Therapist {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  avatar: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  bio: string;
  languages: string[];
  verified: boolean;
  availability: TherapistAvailability[];
}

export interface TherapistAvailability {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  timezone: string;
}

export interface Appointment {
  id: string;
  userId: string;
  therapistId: string;
  date: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  sessionType: 'video' | 'phone' | 'chat';
  notes?: string;
  meetingUrl?: string;
  price: number;
}

// Community Types
export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: 'anxiety' | 'depression' | 'stress' | 'general' | 'youth' | 'seniors';
  memberCount: number;
  isPrivate: boolean;
  rules: string[];
  moderators: string[]; // user IDs
  createdAt: Date;
  lastActivity: Date;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  reactions: MessageReaction[];
  isEdited?: boolean;
  replyTo?: string; // message ID
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface GroupMembership {
  userId: string;
  groupId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: Date;
  isActive: boolean;
}

// Journal Entry (Extended)
export interface JournalEntry {
  id?: string;
  mood: "happy" | "sad" | "calm" | "anxious" | "excited" | "angry" | "irritated" | "frustrated" | "content" | "energetic";
  content: string;
  date: Date;
  confidence?: number;
  aiAnalysis?: string;
  userId?: string;
  type: 'text' | 'voice';
  voiceData?: {
    audioUrl: string;
    duration: number;
    transcription?: string;
  };
}

// Subscription Types
export interface Subscription {
  id: string;
  userId: string;
  plan: 'basic' | 'premium' | 'premium_plus';
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

// Crisis Support Types
export interface CrisisResource {
  id: string;
  name: string;
  phoneNumber: string;
  website?: string;
  description: string;
  availability: '24/7' | 'business_hours' | 'limited';
  region: string;
  languages: string[];
}

// Safety & Moderation Types
export interface ContentReport {
  id: string;
  reporterId: string;
  contentType: 'message' | 'profile' | 'group';
  contentId: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
}