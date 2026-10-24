export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  quickAction?: string;
}

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';
