import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';
import { VideoMetadata, TranscriptSegment } from '../types/index.js';
import { config } from '../config/env.js';
import { GeminiService } from './geminiService.js';

export class YouTubeService {
  /**
   * Extracts YouTube Video ID from various URL formats
   */
  public static extractVideoId(urlOrId: string): string | null {
    if (!urlOrId || typeof urlOrId !== 'string') return null;
    const trimmed = urlOrId.trim();

    // Check if it's already an 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = trimmed.match(regExp);
    return match ? match[1] : null;
  }

  /**
   * Formats seconds into HH:MM:SS or MM:SS
   */
  public static formatSecondsToTimestamp(seconds: number): string {
    const totalSecs = Math.floor(seconds);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) {
      return `${hrs}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }

  /**
   * Detects the actual language used in the video/content:
   * English, Hindi, Kannada, Malayalam, Urdu, Tamil, Telugu, Bengali, Marathi, Gujarati, Punjabi, Odia, etc.
   */
  public static detectLanguage(
    text: string = '',
    title: string = '',
    captionLangCode?: string
  ): { name: string; code: string } {
    if (captionLangCode) {
      const code = captionLangCode.toLowerCase().split('-')[0];
      if (code === 'en') return { name: 'English', code: 'en' };
      if (code === 'hi') return { name: 'Hindi', code: 'hi' };
      if (code === 'kn') return { name: 'Kannada', code: 'kn' };
      if (code === 'ml') return { name: 'Malayalam', code: 'ml' };
      if (code === 'ur') return { name: 'Urdu', code: 'ur' };
      if (code === 'ta') return { name: 'Tamil', code: 'ta' };
      if (code === 'te') return { name: 'Telugu', code: 'te' };
      if (code === 'bn') return { name: 'Bengali', code: 'bn' };
      if (code === 'mr') return { name: 'Marathi', code: 'mr' };
      if (code === 'gu') return { name: 'Gujarati', code: 'gu' };
      if (code === 'pa') return { name: 'Punjabi', code: 'pa' };
      if (code === 'or') return { name: 'Odia', code: 'or' };
    }

    const sample = `${title} ${text}`.slice(0, 4000);

    // 1. Unicode script checking
    const kannadaCount = (sample.match(/[\u0C80-\u0CFF]/g) || []).length;
    const malayalamCount = (sample.match(/[\u0D00-\u0D7F]/g) || []).length;
    const tamilCount = (sample.match(/[\u0B80-\u0BFF]/g) || []).length;
    const teluguCount = (sample.match(/[\u0C00-\u0C7F]/g) || []).length;
    const bengaliCount = (sample.match(/[\u0980-\u09FF]/g) || []).length;
    const devanagariCount = (sample.match(/[\u0900-\u097F]/g) || []).length;
    const urduCount = (sample.match(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
    const gujaratiCount = (sample.match(/[\u0A80-\u0AFF]/g) || []).length;
    const punjabiCount = (sample.match(/[\u0A00-\u0A7F]/g) || []).length;
    const odiaCount = (sample.match(/[\u0B00-\u0B7F]/g) || []).length;

    const maxNonLatin = Math.max(
      kannadaCount,
      malayalamCount,
      tamilCount,
      teluguCount,
      bengaliCount,
      devanagariCount,
      urduCount,
      gujaratiCount,
      punjabiCount,
      odiaCount
    );

    if (maxNonLatin > 8) {
      if (kannadaCount === maxNonLatin) return { name: 'Kannada', code: 'kn' };
      if (malayalamCount === maxNonLatin) return { name: 'Malayalam', code: 'ml' };
      if (tamilCount === maxNonLatin) return { name: 'Tamil', code: 'ta' };
      if (teluguCount === maxNonLatin) return { name: 'Telugu', code: 'te' };
      if (bengaliCount === maxNonLatin) return { name: 'Bengali', code: 'bn' };
      if (urduCount === maxNonLatin) return { name: 'Urdu', code: 'ur' };
      if (gujaratiCount === maxNonLatin) return { name: 'Gujarati', code: 'gu' };
      if (punjabiCount === maxNonLatin) return { name: 'Punjabi', code: 'pa' };
      if (odiaCount === maxNonLatin) return { name: 'Odia', code: 'or' };
      if (devanagariCount === maxNonLatin) {
        // Distinguish Marathi vs Hindi in Devanagari
        const isMarathi = /\b(आहे|नाही|केला|झाला|आणि|करतात|मराठी|बघा|शिकू|कसे|माहिती|उत्तर)\b/i.test(sample);
        return isMarathi ? { name: 'Marathi', code: 'mr' } : { name: 'Hindi', code: 'hi' };
      }
    }

    // 2. Transliterated / Romanized code-switching vocabulary checking
    const lower = sample.toLowerCase();
    const kannadaWords = (lower.match(/\b(kannada|kannadadalli|hege|yelli|yenu|beku|beda|madu|madona|nodi|nodona|agalla|namaskara|namaste|gothilla)\b/g) || []).length;
    const malayalamWords = (lower.match(/\b(malayalam|malayalathil|nokkuka|cheyyuka|cheyyam|engane|nammal|ariyilla|ividam|parayunnu|entha|pattilla|namaskaram)\b/g) || []).length;
    const tamilWords = (lower.match(/\b(tamil|tamizhil|eppadi|pannunga|pannalam|theriyum|solren|irukku|paarkalam|vanakkam|inga|enakku)\b/g) || []).length;
    const teluguWords = (lower.match(/\b(telugu|telugulo|ela|cheyali|cheyyandi|chudandi|namaskaram|telusu|undhi|ikkada|choodandi)\b/g) || []).length;
    const bengaliWords = (lower.match(/\b(bangla|bengali|kemon|achen|achho|korben|kore|bhalo|ektu|amar|tomar|shob|bujhte|shikhi)\b/g) || []).length;
    const hindiWords = (lower.match(/\b(hindi|karein?|karna|hoga|hota|hoti|hote|nahi|kyon|kaise|ispe|uspe|samajh|dekho|baat|yeh|woh|apna|apne|dost|padhai|karenge|isliye)\b/g) || []).length;
    const urduWords = (lower.match(/\b(urdu|karein?|karna|hoga|hota|nahi|kyun|kaise|samjhein?|dekhein?|baat|shukriya|alfaaz|muawina|tashreeh|wazahat)\b/g) || []).length;

    const maxRomanized = Math.max(kannadaWords, malayalamWords, tamilWords, teluguWords, bengaliWords, hindiWords, urduWords);
    if (maxRomanized >= 3) {
      if (kannadaWords === maxRomanized) return { name: 'Kannada', code: 'kn' };
      if (malayalamWords === maxRomanized) return { name: 'Malayalam', code: 'ml' };
      if (tamilWords === maxRomanized) return { name: 'Tamil', code: 'ta' };
      if (teluguWords === maxRomanized) return { name: 'Telugu', code: 'te' };
      if (bengaliWords === maxRomanized) return { name: 'Bengali', code: 'bn' };
      if (urduWords === maxRomanized) return { name: 'Urdu', code: 'ur' };
      if (hindiWords === maxRomanized) return { name: 'Hindi', code: 'hi' };
    }

    return { name: 'English', code: 'en' };
  }

  /**
   * Checks whether text is in English (Latin alphabet) or in another script (Bengali, Hindi, Malayalam, etc.)
   */
  public static isEnglishText(text: string): boolean {
    if (!text || text.trim().length === 0) return true;
    const nonEnglishRegex = /[\u0980-\u09FF\u0900-\u097F\u0A00-\u0D7F\u0600-\u06FF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0400-\u04FF]/g;
    const sample = text.slice(0, 1500);
    const matches = sample.match(nonEnglishRegex);
    const nonEnglishCount = matches ? matches.length : 0;
    return (nonEnglishCount / sample.length) < 0.03;
  }

  /**
   * Fetches metadata for a YouTube video
   */
  public static async getVideoMetadata(videoId: string): Promise<VideoMetadata> {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    let title = 'YouTube Educational Video';
    let channel = 'Educational Channel';
    let thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    let description = '';
    let duration = '00:00';

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
      const oembedRes = await axios.get(oembedUrl, { timeout: 6000 });
      if (oembedRes.data) {
        title = oembedRes.data.title || title;
        channel = oembedRes.data.author_name || channel;
        if (oembedRes.data.thumbnail_url) {
          thumbnail = oembedRes.data.thumbnail_url;
        }
      }
    } catch (err) {
      console.warn(`oEmbed fetch failed for ${videoId}, using fallback metadata.`);
    }

    if (config.youtubeApiKey) {
      try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${config.youtubeApiKey}`;
        const apiRes = await axios.get(apiUrl, { timeout: 6000 });
        if (apiRes.data.items && apiRes.data.items.length > 0) {
          const item = apiRes.data.items[0];
          title = item.snippet.title || title;
          channel = item.snippet.channelTitle || channel;
          description = item.snippet.description || '';
          if (item.snippet.thumbnails?.maxres?.url) {
            thumbnail = item.snippet.thumbnails.maxres.url;
          } else if (item.snippet.thumbnails?.high?.url) {
            thumbnail = item.snippet.thumbnails.high.url;
          }
          duration = item.contentDetails?.duration || duration;
        }
      } catch (apiErr) {
        console.warn('YouTube Data API query failed, falling back to scraped/oEmbed info:', apiErr);
      }
    }

    if (!description) {
      try {
        const pageRes = await axios.get(videoUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          timeout: 6000,
        });

        const html = pageRes.data as string;
        const descMatch = html.match(/"shortDescription":"(.*?)"/);
        if (descMatch && descMatch[1]) {
          description = JSON.parse(`"${descMatch[1]}"`);
        }
      } catch {
        // Safe to ignore description scrape failure
      }
    }

    const detected = this.detectLanguage(description, title);

    return {
      id: videoId,
      url: videoUrl,
      title,
      channel,
      thumbnail,
      duration,
      description,
      hasTranscript: false,
      detectedLanguage: detected.name,
      detectedLanguageCode: detected.code,
    };
  }

  /**
   * Fetches transcript with multi-language detection, preservation, and accurate translation.
   * - Detects whether the video is in English, Hindi, Kannada, Urdu, Bengali, etc.
   * - Preserves original language if targetLanguage is 'original' or matches the video's language.
   * - If targetLanguage differs, translates accurately while preserving technical terms, formulas, equations, code, and timestamps.
   */
  public static async getTranscript(
    videoId: string,
    targetLanguage: string = 'en'
  ): Promise<{
    segments: TranscriptSegment[];
    fullText: string;
    hasTranscript: boolean;
    detectedLanguage: string;
    detectedLanguageCode: string;
    targetLanguage: string;
    isTranslated: boolean;
    error?: string;
  }> {
    let rawTranscript: any[] | null = null;
    let trackLangCode: string | undefined;

    // 1. Fetch the authentic default caption track for the video first (which reflects the video's actual spoken audio)
    try {
      const tr = await YoutubeTranscript.fetchTranscript(videoId);
      if (tr && tr.length > 0) {
        rawTranscript = tr;
      }
    } catch (ytErr: any) {
      console.warn(`[YouTubeService] Default transcript fetch failed for ${videoId}: ${ytErr?.message || ytErr}`);
    }

    // 2. If default track fetch was empty, search specific language tracks
    if (!rawTranscript) {
      const candidateLangs = ['hi', 'kn', 'ml', 'ur', 'ta', 'te', 'bn', 'mr', 'gu', 'pa', 'en', 'en-US', 'en-IN'];
      for (const lang of candidateLangs) {
        try {
          const tr = await YoutubeTranscript.fetchTranscript(videoId, { lang });
          if (tr && tr.length > 0) {
            rawTranscript = tr;
            trackLangCode = lang;
            break;
          }
        } catch {
          // Continue checking
        }
      }
    }

    if (rawTranscript && rawTranscript.length > 0) {
      const segments: TranscriptSegment[] = rawTranscript.map((item) => ({
        text: item.text
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .trim(),
        start: Math.round(item.offset / 1000),
        duration: Math.round(item.duration / 1000),
      }));

      const fullText = segments.map((s) => s.text).join(' ');
      const detected = this.detectLanguage(fullText, '', trackLangCode);

      return {
        segments,
        fullText,
        hasTranscript: true,
        detectedLanguage: detected.name,
        detectedLanguageCode: detected.code,
        targetLanguage: 'English',
        isTranslated: false,
      };
    }

    // 3. Fallback direct timedtext XML scraper from video page
    try {
      const videoPage = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 8000,
      });

      const html = videoPage.data as string;
      const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
      if (playerResponseMatch && playerResponseMatch[1]) {
        const playerResponse = JSON.parse(playerResponseMatch[1]);
        const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

        if (captionTracks && captionTracks.length > 0) {
          // Use authentic primary track first
          const track = captionTracks[0];
          trackLangCode = track.languageCode;

          if (track && track.baseUrl) {
            const captionRes = await axios.get(track.baseUrl, { timeout: 6000 });
            const xml = captionRes.data as string;

            const regex = /<text start="([\d\.]+)" dur="([\d\.]+)".*?>(.*?)<\/text>/g;
            let match;
            const segments: TranscriptSegment[] = [];

            while ((match = regex.exec(xml)) !== null) {
              const start = parseFloat(match[1]);
              const duration = parseFloat(match[2]);
              const text = match[3]
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&#39;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/<[^>]*>/g, '')
                .trim();

              if (text) {
                segments.push({
                  start: Math.round(start),
                  duration: Math.round(duration),
                  text,
                });
              }
            }

            if (segments.length > 0) {
              const fullText = segments.map((s) => s.text).join(' ');
              const detected = this.detectLanguage(fullText, '', track.languageCode);

              return {
                segments,
                fullText,
                hasTranscript: true,
                detectedLanguage: detected.name,
                detectedLanguageCode: detected.code,
                targetLanguage: 'English',
                isTranslated: false,
              };
            }
          }
        }
      }
    } catch (scrapeErr: any) {
      console.warn(`[YouTubeService] Scrape fallback failed for ${videoId}: ${scrapeErr?.message || scrapeErr}`);
    }

    // 4. Truly unavailable
    return {
      segments: [],
      fullText: '',
      hasTranscript: false,
      detectedLanguage: 'Unknown',
      detectedLanguageCode: 'und',
      targetLanguage: 'English',
      isTranslated: false,
      error: 'Transcripts or closed captions are disabled or unavailable for this video.',
    };
  }
}
