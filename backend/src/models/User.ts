import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  totalCoins: number;
  currentStreak: number;
  maxStreak: number;
  lastJournalDate: Date | null;
  level: number;
  petData: {
    name: string;
    breed: string;
    happiness: number;
    health: number;
    items: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  totalCoins: {
    type: Number,
    default: 0,
    min: 0
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  maxStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastJournalDate: {
    type: Date,
    default: null
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  petData: {
    name: {
      type: String,
      default: 'Buddy'
    },
    breed: {
      type: String,
      default: 'golden_retriever'
    },
    happiness: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    health: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    items: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

// Index for leaderboard queries
UserSchema.index({ totalCoins: -1 });
UserSchema.index({ currentStreak: -1 });

export default mongoose.model<IUser>('User', UserSchema);