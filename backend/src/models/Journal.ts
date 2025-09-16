import mongoose, { Document, Schema } from 'mongoose';

export type AnalyzedMood = 'happy' | 'excited' | 'energetic' | 'content' | 'calm' | 'sad' | 'anxious' | 'angry' | 'irritated' | 'frustrated';

export interface IJournalEntry extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  mood: AnalyzedMood;
  confidence?: number;
  aiAnalysis?: string;
  wordCount: number;
  coinsEarned: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 5000
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'excited', 'energetic', 'content', 'calm', 'sad', 'anxious', 'angry', 'irritated', 'frustrated']
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  aiAnalysis: {
    type: String,
    maxlength: 1000
  },
  wordCount: {
    type: Number,
    required: true,
    min: 1
  },
  coinsEarned: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
JournalSchema.index({ userId: 1, date: -1 });
JournalSchema.index({ userId: 1, createdAt: -1 });
JournalSchema.index({ date: -1 });

export default mongoose.model<IJournalEntry>('Journal', JournalSchema);