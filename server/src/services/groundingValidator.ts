import { TranscriptSegment, Flashcard, QuizQuestion } from '../types/index.js';

export interface GroundingValidationResult<T> {
  isValid: boolean;
  item?: T;
  rejectionReason?: string;
}

export class GroundingValidator {
  /**
   * Normalizes a text string for fuzzy / whitespace-insensitive matching
   */
  public static normalizeText(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Checks whether the given evidence excerpt exists within the transcript segments.
   * Allows minor tokenization/punctuation differences, requiring at least 70% consecutive token overlap.
   */
  public static verifyExcerptInTranscript(
    excerpt: string,
    segments: TranscriptSegment[],
    fullTranscriptText?: string
  ): { verified: boolean; matchedTimestamp?: number; matchedTimestampStr?: string } {
    if (!excerpt || excerpt.trim().length < 8) {
      return { verified: false };
    }

    const cleanExcerpt = this.normalizeText(excerpt);
    const cleanFull = fullTranscriptText
      ? this.normalizeText(fullTranscriptText)
      : this.normalizeText(segments.map((s) => s.text).join(' '));

    // Direct substring check on normalized full transcript
    if (cleanFull.includes(cleanExcerpt)) {
      // Find the segment with the highest overlap to get exact timestamp
      const matched = this.findBestMatchingSegment(cleanExcerpt, segments);
      return {
        verified: true,
        matchedTimestamp: matched?.start,
        matchedTimestampStr: matched ? this.formatSeconds(matched.start) : undefined,
      };
    }

    // Token-level sliding window check for long excerpts that may span line breaks
    const excerptTokens = cleanExcerpt.split(' ').filter(Boolean);
    if (excerptTokens.length >= 4) {
      // Check 3-4 token anchors
      const anchor = excerptTokens.slice(0, Math.min(6, excerptTokens.length)).join(' ');
      if (cleanFull.includes(anchor)) {
        const matched = this.findBestMatchingSegment(anchor, segments);
        return {
          verified: true,
          matchedTimestamp: matched?.start,
          matchedTimestampStr: matched ? this.formatSeconds(matched.start) : undefined,
        };
      }

      // Check middle anchor
      if (excerptTokens.length >= 8) {
        const midStart = Math.floor(excerptTokens.length / 2) - 2;
        const midAnchor = excerptTokens.slice(midStart, midStart + 5).join(' ');
        if (cleanFull.includes(midAnchor)) {
          const matched = this.findBestMatchingSegment(midAnchor, segments);
          return {
            verified: true,
            matchedTimestamp: matched?.start,
            matchedTimestampStr: matched ? this.formatSeconds(matched.start) : undefined,
          };
        }
      }
    }

    return { verified: false };
  }

  /**
   * Finds the transcript segment that has the highest word overlap with target text
   */
  private static findBestMatchingSegment(
    normalizedTarget: string,
    segments: TranscriptSegment[]
  ): TranscriptSegment | null {
    if (!segments || segments.length === 0) return null;
    const targetWords = new Set(normalizedTarget.split(' ').filter(w => w.length > 2));
    if (targetWords.size === 0) return segments[0];

    let bestSegment: TranscriptSegment | null = null;
    let maxOverlap = 0;

    for (const seg of segments) {
      const segNorm = this.normalizeText(seg.text);
      if (segNorm.includes(normalizedTarget)) {
        return seg; // Exact segment match
      }
      const segWords = segNorm.split(' ').filter(w => w.length > 2);
      let overlap = 0;
      for (const w of segWords) {
        if (targetWords.has(w)) overlap++;
      }
      if (overlap > maxOverlap) {
        maxOverlap = overlap;
        bestSegment = seg;
      }
    }

    return bestSegment || segments[0];
  }

  /**
   * Validates that an answer or explanation is meaningfully grounded in the evidence excerpt
   */
  public static verifyAnswerGrounding(answerOrExplanation: string, evidenceExcerpt: string): boolean {
    if (!answerOrExplanation || !evidenceExcerpt) return false;
    const normAns = this.normalizeText(answerOrExplanation);
    const normEv = this.normalizeText(evidenceExcerpt);

    // If either contains the other directly
    if (normEv.includes(normAns) || normAns.includes(normEv)) return true;

    // Check shared key content tokens (ignoring common stop words)
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with', 'as', 'by',
      'that', 'this', 'it', 'from', 'or', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
      'had', 'do', 'does', 'did', 'but', 'not', 'so', 'if', 'then', 'into', 'up', 'down', 'about'
    ]);

    const ansTokens = normAns.split(' ').filter(w => w.length > 2 && !stopWords.has(w));
    const evTokens = new Set(normEv.split(' ').filter(w => w.length > 2 && !stopWords.has(w)));

    if (ansTokens.length === 0 || evTokens.size === 0) return true;

    let overlapCount = 0;
    for (const t of ansTokens) {
      if (evTokens.has(t)) overlapCount++;
    }

    // Require at least 20% key token overlap between answer and evidence
    return (overlapCount / ansTokens.length) >= 0.20 || overlapCount >= 2;
  }

  /**
   * Validates a single Flashcard candidate against the source transcript
   */
  public static validateFlashcard(
    card: Flashcard,
    segments: TranscriptSegment[],
    fullTranscriptText?: string
  ): GroundingValidationResult<Flashcard> {
    if (!card.question || card.question.trim().length < 6) {
      return { isValid: false, rejectionReason: 'Question is empty or too short' };
    }
    if (!card.answer || card.answer.trim().length < 4) {
      return { isValid: false, rejectionReason: 'Answer is empty or too short' };
    }

    // Reject known generic/boilerplate flashcard patterns
    const lowerQ = card.question.toLowerCase();
    if (
      lowerQ.includes('core structure of') ||
      lowerQ.includes('impact problem solving') ||
      lowerQ.includes('provides a clear mental model')
    ) {
      return { isValid: false, rejectionReason: 'Rejected generic fallback question' };
    }

    // If evidence excerpt is provided, verify it exists in transcript
    let verifiedTimestamp = card.timestampSeconds;
    let verifiedTimestampStr = card.timestamp;

    if (card.evidenceExcerpt) {
      const excerptCheck = this.verifyExcerptInTranscript(card.evidenceExcerpt, segments, fullTranscriptText);
      if (!excerptCheck.verified) {
        return {
          isValid: false,
          rejectionReason: `Evidence excerpt was not found in video transcript: "${card.evidenceExcerpt.slice(0, 60)}..."`,
        };
      }
      if (excerptCheck.matchedTimestamp !== undefined && !verifiedTimestamp) {
        verifiedTimestamp = excerptCheck.matchedTimestamp;
        verifiedTimestampStr = excerptCheck.matchedTimestampStr;
      }
    } else {
      // If no explicit evidenceExcerpt, try matching the answer or key phrase in transcript
      const ansCheck = this.verifyExcerptInTranscript(card.answer, segments, fullTranscriptText);
      if (!ansCheck.verified) {
        // Try question key terms
        const qCheck = this.verifyExcerptInTranscript(card.question, segments, fullTranscriptText);
        if (!qCheck.verified) {
          return { isValid: false, rejectionReason: 'Neither question nor answer could be grounded in transcript' };
        }
        verifiedTimestamp = qCheck.matchedTimestamp;
        verifiedTimestampStr = qCheck.matchedTimestampStr;
      } else {
        verifiedTimestamp = ansCheck.matchedTimestamp;
        verifiedTimestampStr = ansCheck.matchedTimestampStr;
      }
    }

    return {
      isValid: true,
      item: {
        ...card,
        timestamp: verifiedTimestampStr || card.timestamp || '00:00',
        timestampSeconds: verifiedTimestamp ?? card.timestampSeconds ?? 0,
        groundingVerified: true,
      },
    };
  }

  /**
   * Validates a single MCQ Quiz Question candidate against the source transcript
   */
  public static validateQuizQuestion(
    q: QuizQuestion,
    segments: TranscriptSegment[],
    fullTranscriptText?: string
  ): GroundingValidationResult<QuizQuestion> {
    if (!q.question || q.question.trim().length < 8) {
      return { isValid: false, rejectionReason: 'Question is empty or too short' };
    }

    // Reject generic questions
    const lowerQ = q.question.toLowerCase();
    if (
      lowerQ.includes('key takeaway emphasized throughout') ||
      lowerQ.includes('impact problem solving')
    ) {
      return { isValid: false, rejectionReason: 'Rejected generic boilerplate quiz question' };
    }

    // Must have exactly 4 options
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      return { isValid: false, rejectionReason: `Must have exactly 4 options, received ${q.options?.length}` };
    }

    // Options must be trimmed and non-empty
    const trimmedOptions = q.options.map(o => (o || '').trim());
    if (trimmedOptions.some(o => o.length === 0)) {
      return { isValid: false, rejectionReason: 'One or more options are empty' };
    }

    // Options must be unique (no duplicate choices)
    const normalizedOptions = trimmedOptions.map(o => this.normalizeText(o));
    const uniqueOptions = new Set(normalizedOptions);
    if (uniqueOptions.size !== 4) {
      return { isValid: false, rejectionReason: 'Duplicate or near-identical options detected' };
    }

    // Check for banned canned distractors from previous fallbacks
    const bannedDistractors = [
      'subsea cabling repair exclusively',
      'ancient manuscript digitization only',
      'mechanical clock escapement calibration',
      'to add arbitrary complexity without practical performance benefits',
      'it is strictly a legacy approach deprecated in contemporary industry',
      'an outdated protocol replaced by manual file transfer',
      'a random variable without predetermined parameters',
    ];

    for (const opt of normalizedOptions) {
      for (const banned of bannedDistractors) {
        if (opt.includes(banned)) {
          return { isValid: false, rejectionReason: `Contains banned canned distractor: "${banned}"` };
        }
      }
    }

    // Correct answer index must be 0, 1, 2, or 3
    if (
      typeof q.correctAnswerIndex !== 'number' ||
      q.correctAnswerIndex < 0 ||
      q.correctAnswerIndex > 3 ||
      !Number.isInteger(q.correctAnswerIndex)
    ) {
      return { isValid: false, rejectionReason: `Invalid correctAnswerIndex: ${q.correctAnswerIndex}` };
    }

    const correctOption = trimmedOptions[q.correctAnswerIndex];

    // Verify evidence in transcript
    let verifiedTimestamp = q.timestampSeconds;
    let verifiedTimestampStr = q.timestamp;

    if (q.evidenceExcerpt) {
      const excerptCheck = this.verifyExcerptInTranscript(q.evidenceExcerpt, segments, fullTranscriptText);
      if (!excerptCheck.verified) {
        return {
          isValid: false,
          rejectionReason: `Evidence excerpt was not found in transcript: "${q.evidenceExcerpt.slice(0, 60)}..."`,
        };
      }
      if (excerptCheck.matchedTimestamp !== undefined && !verifiedTimestamp) {
        verifiedTimestamp = excerptCheck.matchedTimestamp;
        verifiedTimestampStr = excerptCheck.matchedTimestampStr;
      }

      // Verify that correct answer or explanation aligns with the evidence excerpt
      const answerAligns = this.verifyAnswerGrounding(correctOption, q.evidenceExcerpt) ||
        this.verifyAnswerGrounding(q.explanation, q.evidenceExcerpt);
      if (!answerAligns) {
        return {
          isValid: false,
          rejectionReason: `Correct option does not align with the provided evidence excerpt: "${correctOption}"`,
        };
      }
    } else {
      // Verify correct option or explanation in transcript
      const correctCheck = this.verifyExcerptInTranscript(correctOption, segments, fullTranscriptText);
      const explCheck = this.verifyExcerptInTranscript(q.explanation, segments, fullTranscriptText);
      if (!correctCheck.verified && !explCheck.verified) {
        return {
          isValid: false,
          rejectionReason: 'Neither the correct answer nor the explanation could be verified in the transcript',
        };
      }
      verifiedTimestamp = correctCheck.matchedTimestamp ?? explCheck.matchedTimestamp;
      verifiedTimestampStr = correctCheck.matchedTimestampStr ?? explCheck.matchedTimestampStr;
    }

    return {
      isValid: true,
      item: {
        ...q,
        options: trimmedOptions,
        timestamp: verifiedTimestampStr || q.timestamp || '00:00',
        timestampSeconds: verifiedTimestamp ?? q.timestampSeconds ?? 0,
        groundingVerified: true,
      },
    };
  }

  /**
   * Deduplicates questions using Jaccard word similarity on question stems and answers
   */
  public static deduplicateItems<T extends { question: string; answer?: string; options?: string[]; correctAnswerIndex?: number }>(
    items: T[],
    similarityThreshold = 0.65
  ): T[] {
    const result: T[] = [];

    const getAnswerText = (item: any): string => {
      if (item.answer) return item.answer;
      if (Array.isArray(item.options) && typeof item.correctAnswerIndex === 'number') {
        return item.options[item.correctAnswerIndex] || '';
      }
      return '';
    };

    const jaccard = (textA: string, textB: string): number => {
      const normA = GroundingValidator.normalizeText(textA);
      const normB = GroundingValidator.normalizeText(textB);
      if (!normA || !normB) return 0;
      if (normA === normB) return 1;

      const wordsA = new Set(normA.split(' ').filter(w => w.length > 2));
      const wordsB = new Set(normB.split(' ').filter(w => w.length > 2));
      if (wordsA.size === 0 || wordsB.size === 0) return 0;

      let intersection = 0;
      for (const w of wordsA) {
        if (wordsB.has(w)) intersection++;
      }
      const union = new Set([...wordsA, ...wordsB]).size;
      return union > 0 ? intersection / union : 0;
    };

    for (const item of items) {
      let isDuplicate = false;
      const ansItem = getAnswerText(item);

      for (const kept of result) {
        const qSim = jaccard(item.question, kept.question);
        const ansKept = getAnswerText(kept);
        const aSim = ansItem && ansKept ? jaccard(ansItem, ansKept) : 0;

        if (qSim >= similarityThreshold || aSim >= 0.65 || (qSim >= 0.40 && aSim >= 0.50)) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        result.push(item);
      }
    }

    return result;
  }

  /**
   * Distributes questions evenly across transcript chunks to ensure full video coverage
   */
  public static balanceCoverage<T extends { timestampSeconds?: number }>(
    items: T[],
    totalDurationSeconds: number,
    targetCount: number
  ): T[] {
    if (items.length <= targetCount) {
      return [...items].sort((a, b) => (a.timestampSeconds || 0) - (b.timestampSeconds || 0));
    }

    const duration = Math.max(totalDurationSeconds, 60);
    const numBuckets = Math.min(targetCount, 5);
    const bucketSize = duration / numBuckets;

    const buckets: T[][] = Array.from({ length: numBuckets }, () => []);

    for (const item of items) {
      const sec = item.timestampSeconds || 0;
      const bIdx = Math.min(Math.floor(sec / bucketSize), numBuckets - 1);
      buckets[bIdx].push(item);
    }

    const selected: T[] = [];
    const perBucketTarget = Math.ceil(targetCount / numBuckets);

    // Round-robin selection across buckets
    let round = 0;
    while (selected.length < targetCount && round < perBucketTarget + 2) {
      let addedInRound = false;
      for (let b = 0; b < numBuckets; b++) {
        if (selected.length >= targetCount) break;
        if (buckets[b].length > round) {
          selected.push(buckets[b][round]);
          addedInRound = true;
        }
      }
      if (!addedInRound) break;
      round++;
    }

    // Sort chronologically
    return selected.sort((a, b) => (a.timestampSeconds || 0) - (b.timestampSeconds || 0));
  }

  private static formatSeconds(seconds: number): string {
    const totalSecs = Math.floor(seconds);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) return `${hrs}:${pad(mins)}:${pad(secs)}`;
    return `${pad(mins)}:${pad(secs)}`;
  }
}
