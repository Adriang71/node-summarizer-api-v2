export interface AnalyzeRequest {
  url: string;
}

export interface WebContent {
  title: string;
  content: string;
  url: string;
}

export interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  wordCount: number;
}

export interface AudioResult {
  audioUrl: string;
  audioId: string;
  duration: number;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: {
    url: string;
    analysis: AnalysisResult;
    audio: AudioResult;
    timestamp: Date;
  };
  error?: string;
  cached?: boolean;
}

export interface AnalysisRecord {
  _id?: string;
  url: string;
  analysis: AnalysisResult;
  audio: AudioResult;
  timestamp: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id?: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserRegistration {
  email: string;
  password: string;
  name: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
    };
    token: string;
  };
  error?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface AIConfig {
  _id?: string;
  userId: string;
  modelId: string;
  promptId: string;
  language: 'en' | 'pl';
  maxContentLength: number;
  enableCaching: boolean;
  cacheExpiration: number;
  createdAt: Date;
  updatedAt: Date;
} 