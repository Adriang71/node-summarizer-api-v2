import mongoose, { Schema, Document } from 'mongoose';
import { AnalysisRecord } from '../types';

const AnalysisSchema = new Schema<AnalysisRecord>({
  url: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  analysis: {
    summary: {
      type: String,
      required: true
    },
    keyPoints: [{
      type: String,
      required: true
    }],
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      required: true
    },
    wordCount: {
      type: Number,
      required: true
    }
  },
  audio: {
    audioUrl: {
      type: String,
      required: true
    },
    audioId: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    }
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for faster searching
AnalysisSchema.index({ url: 1, userId: 1 });
AnalysisSchema.index({ userId: 1, createdAt: -1 });

export const Analysis = mongoose.model<AnalysisRecord>('Analysis', AnalysisSchema); 