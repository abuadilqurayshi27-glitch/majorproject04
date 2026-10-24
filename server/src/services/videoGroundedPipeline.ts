import {
  TranscriptSegment,
  SmartNotes,
  Flashcard,
  QuizQuestion,
  StudentProfile,
} from '../types/index.js';
import { GroundingValidator } from './groundingValidator.js';

export interface TranscriptChunk {
  chunkId: string;
  chunkIndex: number;
  startSec: number;
  endSec: number;
  timestampRange: string;
  segments: TranscriptSegment[];
  chunkText: string;
}

export class VideoGroundedPipeline {
  /**
   * Divides a transcript into manageable chronological chunks (e.g., 2 to 5 minutes each)
   */
  public static chunkTranscript(
    segments: TranscriptSegment[],
    targetChunkDurationSeconds = 180 // 3 minutes per chunk default
  ): TranscriptChunk[] {
    if (!segments || segments.length === 0) return [];

    const chunks: TranscriptChunk[] = [];
    let currentSegments: TranscriptSegment[] = [];
    let chunkStartSec = segments[0].start;
    let currentChunkIndex = 0;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      currentSegments.push(seg);

      const currentDuration = seg.start + seg.duration - chunkStartSec;
      const isLast = i === segments.length - 1;

      if (currentDuration >= targetChunkDurationSeconds || isLast) {
        const endSec = seg.start + seg.duration;
        const chunkText = currentSegments.map((s) => s.text).join(' ');

        chunks.push({
          chunkId: `chunk_${currentChunkIndex}`,
          chunkIndex: currentChunkIndex,
          startSec: chunkStartSec,
          endSec,
          timestampRange: `${this.formatSeconds(chunkStartSec)}–${this.formatSeconds(endSec)}`,
          segments: [...currentSegments],
          chunkText,
        });

        currentChunkIndex++;
        currentSegments = [];
        if (!isLast && i + 1 < segments.length) {
          chunkStartSec = segments[i + 1].start;
        }
      }
    }

    return chunks;
  }

  /**
   * Extracts grounded key concepts and definitions from a transcript chunk
   */
  public static extractChunkConcepts(
    chunk: TranscriptChunk
  ): Array<{ term: string; definition: string; timestamp: number; evidenceExcerpt: string }> {
    const concepts: Array<{ term: string; definition: string; timestamp: number; evidenceExcerpt: string }> = [];
    const text = chunk.chunkText;

    // Pattern 1: Definitions and core properties
    const defRegex = /\b([A-Z0-9][a-zA-Z0-9_\s]{1,35})\s+(?:is defined as|refers to|is called|is known as|means|is an?|requires|eliminates|states that)\s+([^.!?\n]{10,140})/gi;
    let match;
    while ((match = defRegex.exec(text)) !== null) {
      const term = match[1].trim();
      const definition = match[2].trim();
      const seg = chunk.segments.find(s => s.text.toLowerCase().includes(term.toLowerCase())) || chunk.segments[0];

      if (term.length > 2 && definition.length > 6) {
        concepts.push({
          term,
          definition,
          timestamp: seg?.start ?? chunk.startSec,
          evidenceExcerpt: seg?.text || match[0].trim(),
        });
      }
    }

    // Pattern 2: Mathematical formulas & laws ("V = I * R", "F = m * a", "Ohm's Law: ...")
    const formulaRegex = /\b([A-Za-z0-9'\s]{2,35})\s*(?:states that|is given by|formula is|equation is|=|is expressed as)\s*([A-Za-z0-9\s*\/^+\-()=]{2,40})/gi;
    while ((match = formulaRegex.exec(text)) !== null) {
      const name = match[1].trim();
      const formula = match[2].trim();
      if (name.length > 2 && formula.length >= 3 && /[0-9+\-*\/=^]/.test(formula)) {
        const seg = chunk.segments.find(s => s.text.includes(name) || s.text.includes(formula)) || chunk.segments[0];
        concepts.push({
          term: name,
          definition: `${name} is expressed as: ${formula}`,
          timestamp: seg?.start ?? chunk.startSec,
          evidenceExcerpt: seg?.text || match[0].trim(),
        });
      }
    }

    return concepts;
  }

  /**
   * Generates candidate flashcards grounded strictly in a transcript chunk
   */
  public static generateChunkFlashcards(
    chunk: TranscriptChunk,
    videoId: string,
    topicName: string
  ): Flashcard[] {
    const cards: Flashcard[] = [];
    const concepts = this.extractChunkConcepts(chunk);

    for (let i = 0; i < concepts.length; i++) {
      const c = concepts[i];
      cards.push({
        id: `card_${chunk.chunkId}_${i + 1}`,
        videoId,
        sourceChunkId: chunk.chunkId,
        category: 'Definition',
        question: `In the lecture on ${topicName}, how is "${c.term}" defined?`,
        answer: c.definition,
        difficulty: 'Easy',
        topic: topicName,
        timestamp: this.formatSeconds(c.timestamp),
        timestampSeconds: c.timestamp,
        evidenceExcerpt: c.evidenceExcerpt,
        groundingVerified: true,
      });
    }

    // Also extract important factual statements from chunk sentences
    const sentences = chunk.chunkText.split(/(?<=[.?!])\s+/).filter(s => s.length > 25 && s.length < 160);
    for (let i = 0; i < sentences.length && cards.length < 6; i++) {
      const sent = sentences[i].trim();
      // Look for sentences with strong instructional markers
      if (
        /\b(crucial|important|key|remember|note that|primary|advantage|disadvantage|because|step|first|second|formula|equation)\b/i.test(sent) &&
        !sent.toLowerCase().includes('welcome') &&
        !sent.toLowerCase().includes('subscribe') &&
        !sent.toLowerCase().includes('today we are')
      ) {
        const seg = chunk.segments.find(s => s.text.toLowerCase().includes(sent.slice(0, 20).toLowerCase())) || chunk.segments[0];
        cards.push({
          id: `card_${chunk.chunkId}_fact_${i + 1}`,
          videoId,
          sourceChunkId: chunk.chunkId,
          category: 'Fact',
          question: `According to the video at ${this.formatSeconds(seg?.start ?? chunk.startSec)}, what is an important principle regarding ${topicName}?`,
          answer: sent,
          difficulty: 'Medium',
          topic: topicName,
          timestamp: this.formatSeconds(seg?.start ?? chunk.startSec),
          timestampSeconds: seg?.start ?? chunk.startSec,
          evidenceExcerpt: seg?.text || sent,
          groundingVerified: true,
        });
      }
    }

    return cards;
  }

  /**
   * Generates candidate MCQs grounded strictly in a transcript chunk
   */
  public static generateChunkMCQs(
    chunk: TranscriptChunk,
    allChunks: TranscriptChunk[],
    videoId: string,
    topicName: string
  ): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const concepts = this.extractChunkConcepts(chunk);

    // Collect terms across other chunks to form plausible, domain-consistent distractors
    const otherTerms: string[] = [];
    for (const otherChunk of allChunks) {
      if (otherChunk.chunkId !== chunk.chunkId) {
        const otherConcepts = this.extractChunkConcepts(otherChunk);
        for (const oc of otherConcepts) {
          if (oc.term && !otherTerms.includes(oc.term)) {
            otherTerms.push(oc.term);
          }
        }
      }
    }

    // 1. Concept / Definition MCQs
    for (let i = 0; i < concepts.length; i++) {
      const c = concepts[i];
      const correctOption = c.definition;

      // Create distractors from other concepts in the video or inverted claims
      const distractors: string[] = [];
      if (otherTerms.length >= 3) {
        distractors.push(`Refers strictly to the operation of ${otherTerms[0]} rather than ${c.term}`);
        distractors.push(`The inverse property where ${c.term} decreases as related factors increase`);
        distractors.push(`An alternate mechanism specifically superseded by ${otherTerms[1]}`);
      } else {
        distractors.push(`A static constant that does not vary with input conditions in ${topicName}`);
        distractors.push(`The inverse relationship where output values decrease as ${c.term} increases`);
        distractors.push(`A redundant configuration explicitly discouraged in the lecture`);
      }

      const options = [correctOption, ...distractors.slice(0, 3)];
      const shuffled = this.shuffleWithIndex(options, 0);

      questions.push({
        id: `quiz_${chunk.chunkId}_${i + 1}`,
        videoId,
        sourceChunkId: chunk.chunkId,
        question: `According to the lecture, what accurately describes "${c.term}"?`,
        options: shuffled.options,
        correctAnswerIndex: shuffled.newIndex,
        explanation: `In the video at ${this.formatSeconds(c.timestamp)}, the instructor explains: "${c.evidenceExcerpt}".`,
        topic: topicName,
        difficulty: 'Medium',
        timestamp: this.formatSeconds(c.timestamp),
        timestampSeconds: c.timestamp,
        evidenceExcerpt: c.evidenceExcerpt,
        groundingVerified: true,
      });
    }

    // 2. If concepts were not extracted by regex, extract factual questions from strong sentences
    if (questions.length === 0) {
      for (let sIdx = 0; sIdx < chunk.segments.length; sIdx++) {
        const seg = chunk.segments[sIdx];
        const sent = seg.text.trim();
        if (sent.length > 20 && !sent.toLowerCase().includes('welcome') && !sent.toLowerCase().includes('subscribe')) {
          const isMatch = sent.match(/^([^,]+?)\s+(?:is|are|requires|eliminates|states that)\s+(.+)$/i);
          if (isMatch) {
            const subject = isMatch[1].trim();
            const predicate = isMatch[2].trim();
            const correctOpt = predicate;
            const distractors = [
              `Inverted constraint where ${subject} does not apply in standard operations`,
              `A legacy requirement deprecated in modern implementations of ${topicName}`,
              `A theoretical condition that cannot be applied in practice`,
            ];
            const shuffled = this.shuffleWithIndex([correctOpt, ...distractors], 0);
            questions.push({
              id: `quiz_${chunk.chunkId}_sent_${sIdx + 1}`,
              videoId,
              sourceChunkId: chunk.chunkId,
              question: `According to the video, what is true regarding ${subject}?`,
              options: shuffled.options,
              correctAnswerIndex: shuffled.newIndex,
              explanation: `In the lecture at ${this.formatSeconds(seg.start)}: "${sent}".`,
              topic: topicName,
              difficulty: 'Medium',
              timestamp: this.formatSeconds(seg.start),
              timestampSeconds: seg.start,
              evidenceExcerpt: seg.text,
              groundingVerified: true,
            });
            break;
          }
        }
      }
    }

    return questions;
  }

  /**
   * Validates, deduplicates, and coverage-balances candidate items into the final set
   */
  public static processPipelineFlashcards(
    candidates: Flashcard[],
    segments: TranscriptSegment[],
    totalDurationSeconds: number,
    targetCount = 12
  ): Flashcard[] {
    const fullText = segments.map((s) => s.text).join(' ');

    // Step 5: Validate each against evidence
    const verified: Flashcard[] = [];
    for (const c of candidates) {
      const res = GroundingValidator.validateFlashcard(c, segments, fullText);
      if (res.isValid && res.item) {
        verified.push(res.item);
      }
    }

    // Step 6: Deduplicate
    const unique = GroundingValidator.deduplicateItems(verified, 0.70);

    // Step 7: Combine and balance across full video timeline
    return GroundingValidator.balanceCoverage(unique, totalDurationSeconds, targetCount);
  }

  /**
   * Validates, deduplicates, and coverage-balances candidate MCQs into the final set
   */
  public static processPipelineMCQs(
    candidates: QuizQuestion[],
    segments: TranscriptSegment[],
    totalDurationSeconds: number,
    targetCount = 10
  ): QuizQuestion[] {
    const fullText = segments.map((s) => s.text).join(' ');

    // Step 5: Validate each against evidence
    const verified: QuizQuestion[] = [];
    for (const q of candidates) {
      const res = GroundingValidator.validateQuizQuestion(q, segments, fullText);
      if (res.isValid && res.item) {
        verified.push(res.item);
      }
    }

    // Step 6: Deduplicate
    const unique = GroundingValidator.deduplicateItems(verified, 0.70);

    // Step 7: Combine and balance across full video timeline
    return GroundingValidator.balanceCoverage(unique, totalDurationSeconds, targetCount);
  }

  private static shuffleWithIndex(options: string[], correctIndex: number): { options: string[]; newIndex: number } {
    const correctVal = options[correctIndex];
    const indexed = options.map((opt, idx) => ({ opt, isCorrect: idx === correctIndex }));

    // Deterministic pseudo-shuffle based on string length
    for (let i = indexed.length - 1; i > 0; i--) {
      const j = (correctVal.length + i) % (i + 1);
      [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
    }

    const shuffledOptions = indexed.map(item => item.opt);
    const newIndex = indexed.findIndex(item => item.isCorrect);

    return { options: shuffledOptions, newIndex: Math.max(0, newIndex) };
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
