export interface VideoMetadata {
  id: string;
  url: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration?: string;
  description?: string;
  hasTranscript: boolean;
  transcriptSnippet?: string;
  detectedLanguage?: string;
  detectedLanguageCode?: string;
}

export interface TranscriptSegment {
  text: string;
  start: number; // in seconds
  duration: number; // in seconds
}
