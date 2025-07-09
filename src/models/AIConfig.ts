import mongoose, { Schema, Document } from 'mongoose';
import { AIConfig } from '../types';

const AIConfigSchema = new Schema<AIConfig>({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  modelId: {
    type: String,
    required: true,
    default: 'deepseek-chat'
  },
  promptId: {
    type: String,
    required: true,
    default: 'analysis-en'
  },
  language: {
    type: String,
    required: true,
    enum: ['en', 'pl'],
    default: 'en'
  },
  maxContentLength: {
    type: Number,
    required: true,
    min: 1000,
    max: 50000,
    default: 10000
  },
  enableCaching: {
    type: Boolean,
    required: true,
    default: true
  },
  cacheExpiration: {
    type: Number,
    required: true,
    min: 300,
    max: 86400,
    default: 3600
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

// Index for faster queries
AIConfigSchema.index({ userId: 1 });

export const AIConfigModel = mongoose.model<AIConfig>('AIConfig', AIConfigSchema); 