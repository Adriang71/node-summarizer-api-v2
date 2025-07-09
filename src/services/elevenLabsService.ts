import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { AudioResult } from '../types';
import { v4 as uuid } from 'uuid';
import { createWriteStream } from 'fs';
import path from 'path';

export class ElevenLabsService {
  private static readonly DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
  private static client: ElevenLabsClient | null = null;

  /**
   * Gets or creates ElevenLabs client instance
   */
  private static getClient(): ElevenLabsClient {
    if (!this.client) {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY is not defined in environment variables');
      }

      this.client = new ElevenLabsClient({
        apiKey: apiKey,
      });
    }
    
    return this.client;
  }

  /**
   * Generates speech from text using ElevenLabs API
   */
  static async generateSpeech(text: string): Promise<AudioResult> {
    try {
      const client = this.getClient();
      
      // Prepare text for speech synthesis
      const cleanText = this.prepareTextForSpeech(text);
      
      if (cleanText.length === 0) {
        throw new Error('Text is empty after cleaning');
      }

      // Generate unique ID for audio
      const audioId = this.generateAudioId();
      const fileName = `${audioId}.mp3`;
      const filePath = path.join(process.cwd(), 'uploads', 'audio', fileName);

      // Ensure uploads/audio directory exists
      const fs = require('fs');
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const audioDir = path.join(uploadsDir, 'audio');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      // Convert text to speech
      const audio = await client.textToSpeech.convert(this.DEFAULT_VOICE_ID, {
        modelId: 'eleven_multilingual_v2',
        text: cleanText,
        outputFormat: 'mp3_44100_128',
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.75,
          useSpeakerBoost: true,
          speed: 1.0,
        },
      });

      // Save audio to file
      return new Promise<AudioResult>((resolve, reject) => {
        const fileStream = createWriteStream(filePath);
        
        // Convert ReadableStream to Node.js stream
        const { Readable } = require('stream');
        const audioStream = Readable.from(audio);
        audioStream.pipe(fileStream);
        
        fileStream.on('finish', () => {
          const audioUrl = `/audio/${fileName}`; // URL path for serving the file
          
          resolve({
            audioUrl,
            audioId,
            duration: this.estimateDuration(cleanText)
          });
        });
        
        fileStream.on('error', (error) => {
          reject(new Error(`Failed to save audio file: ${error.message}`));
        });
      });

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Invalid ElevenLabs API key');
        }
        if (error.message.includes('429')) {
          throw new Error('ElevenLabs API rate limit exceeded');
        }
        if (error.message.includes('400')) {
          throw new Error('Invalid request parameters for ElevenLabs');
        }
        throw new Error(`ElevenLabs API error: ${error.message}`);
      }
      throw new Error(`Speech generation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Prepares text for speech synthesis
   */
  private static prepareTextForSpeech(text: string): string {
    return text
      .replace(/[^\w\sąćęłńóśźżĄĆĘŁŃÓŚŹŻ.,!?;:()]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Remove multiple spaces
      .trim()
      .substring(0, 2000); // Limit text length for ElevenLabs
  }

  /**
   * Generates unique ID for audio file
   */
  private static generateAudioId(): string {
    return `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Estimates audio duration based on text length
   */
  private static estimateDuration(text: string): number {
    // Average 150 words per minute
    const wordsPerMinute = 150;
    const wordCount = text.split(/\s+/).length;
    return Math.round((wordCount / wordsPerMinute) * 60);
  }

  /**
   * Fetches available voices from ElevenLabs
   */
  static async getAvailableVoices(): Promise<any[]> {
    try {
      const client = this.getClient();
      const voices = await client.voices.getAll();
      return Array.isArray(voices) ? voices : [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }
} 