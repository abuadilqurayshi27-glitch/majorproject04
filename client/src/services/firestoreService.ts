import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { StudentProfile, UserAccount } from '../types/auth.js';
import {
  SmartNotes,
  Flashcard,
  QuizQuestion,
  QuizResult,
  LearningHistoryItem,
  StudentAnalytics,
  RevisionData,
  RevisionSessionAttempt,
  BlurtingLog,
  ActiveRecallLog,
  RevisionNotification,
  SmartNotesCorrection,
} from '../types/learning.js';
import { VideoMetadata } from '../types/video.js';
import { TutorMessage } from '../types/tutor.js';

// Local storage storage helper for fallback mode
class LocalStore {
  private static getKey(collectionName: string, id: string): string {
    return `studymind_${collectionName}_${id}`;
  }

  public static set<T>(collectionName: string, id: string, data: T): void {
    try {
      localStorage.setItem(this.getKey(collectionName, id), JSON.stringify(data));
      // Also maintain collection index
      const indexKey = `studymind_index_${collectionName}`;
      const existing = JSON.parse(localStorage.getItem(indexKey) || '[]');
      if (!existing.includes(id)) {
        existing.push(id);
        localStorage.setItem(indexKey, JSON.stringify(existing));
      }
    } catch (e) {
      console.warn('LocalStore set error:', e);
    }
  }

  public static get<T>(collectionName: string, id: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(collectionName, id));
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  public static getAll<T>(collectionName: string): T[] {
    try {
      const indexKey = `studymind_index_${collectionName}`;
      const ids: string[] = JSON.parse(localStorage.getItem(indexKey) || '[]');
      const results: T[] = [];
      for (const id of ids) {
        const item = this.get<T>(collectionName, id);
        if (item) results.push(item);
      }
      return results;
    } catch {
      return [];
    }
  }
}

export class FirestoreService {
  // -------------------------------------------------------------
  // USERS & PROFILES
  // -------------------------------------------------------------
  public static async saveUserProfile(profile: StudentProfile): Promise<void> {
    // Sanitize profile object: remove any undefined keys so Firestore doesn't reject with "Unsupported field value: undefined"
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(profile)) {
      if (value !== undefined) {
        sanitized[key] = value;
      }
    }

    // Always mirror to LocalStore and active profile backup
    LocalStore.set('profiles', profile.uid, sanitized as StudentProfile);
    try {
      localStorage.setItem('studymind_active_profile', JSON.stringify(sanitized));
    } catch (e) {
      console.warn('Could not cache active profile to localStorage:', e);
    }

    if (db) {
      try {
        await setDoc(doc(db, 'profiles', profile.uid), sanitized, { merge: true });
        await setDoc(
          doc(db, 'users', profile.uid),
          { isProfileComplete: true, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore saveUserProfile error, fallback saved to local store:', err);
      }
    }
  }

  public static async getUserProfile(uid: string): Promise<StudentProfile | null> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'profiles', uid));
        if (snap.exists()) {
          const profileData = snap.data() as StudentProfile;
          // Keep local store in sync
          LocalStore.set('profiles', uid, profileData);
          try {
            localStorage.setItem('studymind_active_profile', JSON.stringify(profileData));
          } catch {}
          return profileData;
        }
      } catch (err) {
        console.warn('Firestore getUserProfile error, reading local store:', err);
      }
    }

    const localProfile = LocalStore.get<StudentProfile>('profiles', uid);
    if (localProfile) return localProfile;

    // Additional fallback from active profile
    try {
      const activeStr = localStorage.getItem('studymind_active_profile');
      if (activeStr) {
        const activeProfile = JSON.parse(activeStr) as StudentProfile;
        if (activeProfile && (activeProfile.uid === uid || !uid)) {
          return activeProfile;
        }
      }
    } catch {}

    return null;
  }

  // -------------------------------------------------------------
  // VIDEOS & LEARNING HISTORY
  // -------------------------------------------------------------
  public static async saveVideoMetadata(video: VideoMetadata): Promise<void> {
    if (db) {
      try {
        await setDoc(doc(db, 'videos', video.id), {
          ...video,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        LocalStore.set('videos', video.id, video);
      }
    } else {
      LocalStore.set('videos', video.id, video);
    }
  }

  public static async recordLearningActivity(params: {
    userId: string;
    video: VideoMetadata;
    durationSeconds: number;
    completedNotes?: boolean;
    flashcardsStudied?: number;
    quizCompleted?: boolean;
    lastQuizScore?: number;
    studiedTopics?: string[];
    isCompleted?: boolean;
    watchPercentage?: number;
    videoDuration?: number;
  }): Promise<void> {
    const {
      userId,
      video,
      durationSeconds,
      completedNotes = false,
      flashcardsStudied = 0,
      quizCompleted = false,
      lastQuizScore,
      studiedTopics = [],
      isCompleted: explicitCompleted,
      watchPercentage: incomingWatchPct,
      videoDuration,
    } = params;
    const historyId = `${userId}_${video.id}`;

    // Get existing item if any
    const existing = await this.getLearningHistoryItem(userId, video.id);

    const calculatedWatchPct = incomingWatchPct !== undefined
      ? Math.max(incomingWatchPct, existing?.watchPercentage || 0)
      : existing?.watchPercentage || 0;
    const isCompleted = explicitCompleted || (calculatedWatchPct >= 100) || (existing?.isCompleted || false);

    const historyItem: LearningHistoryItem = {
      id: historyId,
      videoId: video.id,
      videoTitle: video.title,
      channel: video.channel,
      thumbnail: video.thumbnail,
      watchedAt: new Date().toISOString(),
      durationSeconds: (existing?.durationSeconds || 0) + durationSeconds,
      completedNotes: completedNotes || existing?.completedNotes || false,
      flashcardsStudied: Math.max(flashcardsStudied, existing?.flashcardsStudied || 0),
      quizCompleted: quizCompleted || existing?.quizCompleted || false,
      lastQuizScore: lastQuizScore !== undefined ? lastQuizScore : existing?.lastQuizScore,
      studiedTopics: Array.from(new Set([...(existing?.studiedTopics || []), ...studiedTopics])),
      isCompleted,
      videoDuration: videoDuration ?? existing?.videoDuration ?? 0,
      watchPercentage: isCompleted ? 100 : Math.min(100, calculatedWatchPct),
    };

    if (db) {
      try {
        await setDoc(doc(db, 'learningHistory', historyId), {
          ...historyItem,
          userId,
        }, { merge: true });
      } catch (err) {
        LocalStore.set('learningHistory', historyId, historyItem);
      }
    } else {
      LocalStore.set('learningHistory', historyId, historyItem);
    }

    // Also record learning progress (exact seconds per day)
    if (durationSeconds > 0) {
      await this.recordDailyLearningSeconds(userId, durationSeconds);
    }
  }


  public static async getLearningHistoryItem(userId: string, videoId: string): Promise<LearningHistoryItem | null> {
    const historyId = `${userId}_${videoId}`;
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'learningHistory', historyId));
        if (snap.exists()) return snap.data() as LearningHistoryItem;
      } catch {}
    }
    return LocalStore.get<LearningHistoryItem>('learningHistory', historyId);
  }

  public static async getUserLearningHistory(userId: string): Promise<LearningHistoryItem[]> {
    if (db) {
      try {
        const q = query(
          collection(db, 'learningHistory'),
          where('userId', '==', userId),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        const items: LearningHistoryItem[] = [];
        querySnapshot.forEach((d) => items.push(d.data() as LearningHistoryItem));
        if (items.length > 0) {
          return items.sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime());
        }
      } catch (err) {
        console.warn('Firestore getUserLearningHistory error, reading local store:', err);
      }
    }

    const all = LocalStore.getAll<LearningHistoryItem & { userId?: string }>('learningHistory');
    return all
      .filter((item) => item.id.startsWith(userId) || item.userId === userId)
      .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime());
  }

  // -------------------------------------------------------------
  // DAILY LEARNING PROGRESS
  // -------------------------------------------------------------
  public static async recordDailyLearningSeconds(userId: string, seconds: number): Promise<void> {
    if (seconds <= 0) return;
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const docId = `${userId}_${today}`;

    if (db) {
      try {
        const snap = await getDoc(doc(db, 'learningProgress', docId));
        const prevSecs = snap.exists() ? (snap.data().seconds ?? ((snap.data().minutes || 0) * 60)) : 0;
        const totalSecs = prevSecs + seconds;
        await setDoc(doc(db, 'learningProgress', docId), {
          userId,
          date: today,
          seconds: totalSecs,
          minutes: Math.round(totalSecs / 60),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        const existing = LocalStore.get<{ date: string; seconds?: number; minutes?: number }>('learningProgress', docId);
        const prevSecs = existing?.seconds ?? ((existing?.minutes || 0) * 60);
        const totalSecs = prevSecs + seconds;
        LocalStore.set('learningProgress', docId, {
          userId,
          date: today,
          seconds: totalSecs,
          minutes: Math.round(totalSecs / 60),
        });
      }
    } else {
      const existing = LocalStore.get<{ date: string; seconds?: number; minutes?: number }>('learningProgress', docId);
      const prevSecs = existing?.seconds ?? ((existing?.minutes || 0) * 60);
      const totalSecs = prevSecs + seconds;
      LocalStore.set('learningProgress', docId, {
        userId,
        date: today,
        seconds: totalSecs,
        minutes: Math.round(totalSecs / 60),
      });
    }
  }

  public static async recordDailyLearningMinutes(userId: string, minutes: number): Promise<void> {
    if (minutes <= 0) return;
    await this.recordDailyLearningSeconds(userId, minutes * 60);
  }

  public static async getUserDailyLearningProgress(userId: string): Promise<Record<string, { seconds: number; minutes: number }>> {
    const result: Record<string, { seconds: number; minutes: number }> = {};
    if (db) {
      try {
        const q = query(
          collection(db, 'learningProgress'),
          where('userId', '==', userId)
        );
        const snaps = await getDocs(q);
        snaps.forEach((d) => {
          const data = d.data();
          const secs = data.seconds ?? ((data.minutes || 0) * 60);
          result[data.date] = {
            seconds: secs,
            minutes: data.minutes ?? Math.round(secs / 60),
          };
        });
        if (Object.keys(result).length > 0) return result;
      } catch {}
    }

    const all = LocalStore.getAll<{ userId?: string; date: string; seconds?: number; minutes?: number }>('learningProgress');
    all.filter((p) => p.userId === userId || !p.userId).forEach((p) => {
      const secs = p.seconds ?? ((p.minutes || 0) * 60);
      result[p.date] = {
        seconds: secs,
        minutes: p.minutes ?? Math.round(secs / 60),
      };
    });
    return result;
  }


  // -------------------------------------------------------------
  // SMART NOTES & FLASHCARDS & QUIZ
  // -------------------------------------------------------------
  public static async saveSmartNotes(userId: string, videoId: string, notes: SmartNotes): Promise<void> {
    const docId = `${userId}_${videoId}`;
    if (db) {
      try {
        await setDoc(doc(db, 'smartNotes', docId), {
          userId,
          videoId,
          notes,
          savedAt: new Date().toISOString(),
        }, { merge: true });
      } catch {
        LocalStore.set('smartNotes', docId, { userId, videoId, notes });
      }
    } else {
      LocalStore.set('smartNotes', docId, { userId, videoId, notes });
    }
  }

  public static async getSmartNotes(userId: string, videoId: string): Promise<SmartNotes | null> {
    const docId = `${userId}_${videoId}`;
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'smartNotes', docId));
        if (snap.exists()) return snap.data().notes as SmartNotes;
      } catch {}
    }
    const item = LocalStore.get<{ notes: SmartNotes }>('smartNotes', docId);
    return item ? item.notes : null;
  }

  public static async saveFlashcardStatus(
    userId: string,
    videoId: string,
    cardId: string,
    status: 'known' | 'review'
  ): Promise<void> {
    const docId = `${userId}_${videoId}_${cardId}`;
    const payload = { userId, videoId, cardId, status, updatedAt: new Date().toISOString() };
    if (db) {
      try {
        await setDoc(doc(db, 'flashcards', docId), payload, { merge: true });
      } catch {
        LocalStore.set('flashcards', docId, payload);
      }
    } else {
      LocalStore.set('flashcards', docId, payload);
    }
  }

  public static async getFlashcardStatuses(userId: string, videoId: string): Promise<Record<string, 'known' | 'review'>> {
    const result: Record<string, 'known' | 'review'> = {};
    if (db) {
      try {
        const q = query(
          collection(db, 'flashcards'),
          where('userId', '==', userId),
          where('videoId', '==', videoId)
        );
        const snaps = await getDocs(q);
        snaps.forEach((d) => {
          const data = d.data();
          result[data.cardId] = data.status;
        });
        return result;
      } catch {}
    }

    const all = LocalStore.getAll<{ userId: string; videoId: string; cardId: string; status: 'known' | 'review' }>('flashcards');
    all.filter((f) => f.userId === userId && f.videoId === videoId).forEach((f) => {
      result[f.cardId] = f.status;
    });
    return result;
  }

  public static async getAllUserFlashcards(userId: string): Promise<Array<{ cardId: string; status: 'known' | 'review'; videoId: string }>> {
    if (db) {
      try {
        const q = query(
          collection(db, 'flashcards'),
          where('userId', '==', userId)
        );
        const snaps = await getDocs(q);
        const results: Array<{ cardId: string; status: 'known' | 'review'; videoId: string }> = [];
        snaps.forEach((d) => {
          const data = d.data();
          results.push({
            cardId: data.cardId,
            status: data.status,
            videoId: data.videoId,
          });
        });
        if (results.length > 0) return results;
      } catch {}
    }

    const all = LocalStore.getAll<{ userId: string; videoId: string; cardId: string; status: 'known' | 'review' }>('flashcards');
    return all.filter((f) => f.userId === userId || f.cardId?.startsWith(userId));
  }

  public static async saveFlashcards(userId: string, videoId: string, flashcards: Flashcard[]): Promise<void> {
    const docId = `${userId}_${videoId}`;
    const payload = { userId, videoId, flashcards, updatedAt: new Date().toISOString() };
    if (db) {
      try {
        await setDoc(doc(db, 'videoFlashcards', docId), payload, { merge: true });
      } catch {
        LocalStore.set('videoFlashcards', docId, payload);
      }
    } else {
      LocalStore.set('videoFlashcards', docId, payload);
    }
  }

  public static async getFlashcards(userId: string, videoId: string): Promise<Flashcard[] | null> {
    const docId = `${userId}_${videoId}`;
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'videoFlashcards', docId));
        if (snap.exists() && Array.isArray(snap.data().flashcards)) {
          return snap.data().flashcards as Flashcard[];
        }
      } catch {}
    }
    const item = LocalStore.get<{ flashcards: Flashcard[] }>('videoFlashcards', docId);
    return item?.flashcards || null;
  }

  public static async saveQuizQuestions(userId: string, videoId: string, quiz: QuizQuestion[]): Promise<void> {
    const docId = `${userId}_${videoId}`;
    const payload = { userId, videoId, quiz, updatedAt: new Date().toISOString() };
    if (db) {
      try {
        await setDoc(doc(db, 'videoQuizzes', docId), payload, { merge: true });
      } catch {
        LocalStore.set('videoQuizzes', docId, payload);
      }
    } else {
      LocalStore.set('videoQuizzes', docId, payload);
    }
  }

  public static async getQuizQuestions(userId: string, videoId: string): Promise<QuizQuestion[] | null> {
    const docId = `${userId}_${videoId}`;
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'videoQuizzes', docId));
        if (snap.exists() && Array.isArray(snap.data().quiz)) {
          return snap.data().quiz as QuizQuestion[];
        }
      } catch {}
    }
    const item = LocalStore.get<{ quiz: QuizQuestion[] }>('videoQuizzes', docId);
    return item?.quiz || null;
  }

  public static async saveQuizResult(userId: string, result: QuizResult): Promise<void> {
    const docId = `${userId}_${result.videoId}_${Date.now()}`;
    const payload = { ...result, userId, id: docId };

    if (db) {
      try {
        await setDoc(doc(db, 'quizResults', docId), payload);
      } catch {
        LocalStore.set('quizResults', docId, payload);
      }
    } else {
      LocalStore.set('quizResults', docId, payload);
    }

    // Update topics mastery in topics collection
    for (const [topicName, stats] of Object.entries(result.topicBreakdown)) {
      const topicDocId = `${userId}_${topicName.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const mastery = Math.round((stats.correct / stats.total) * 100);
      const topicData = {
        userId,
        topicName,
        mastery,
        lastReviewed: new Date().toISOString(),
      };
      if (db) {
        try {
          await setDoc(doc(db, 'topics', topicDocId), topicData, { merge: true });
        } catch {
          LocalStore.set('topics', topicDocId, topicData);
        }
      } else {
        LocalStore.set('topics', topicDocId, topicData);
      }
    }
  }

  public static async getUserQuizResults(userId: string): Promise<QuizResult[]> {
    if (db) {
      try {
        const q = query(
          collection(db, 'quizResults'),
          where('userId', '==', userId),
          limit(30)
        );
        const snaps = await getDocs(q);
        const results: QuizResult[] = [];
        snaps.forEach((d) => results.push(d.data() as QuizResult));
        if (results.length > 0) {
          return results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        }
      } catch {}
    }

    const all = LocalStore.getAll<QuizResult & { userId: string }>('quizResults');
    return all
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  // -------------------------------------------------------------
  // TUTOR CONVERSATIONS
  // -------------------------------------------------------------
  public static async saveTutorConversation(userId: string, videoId: string, messages: TutorMessage[]): Promise<void> {
    const docId = `${userId}_${videoId}`;
    const payload = { userId, videoId, messages, updatedAt: new Date().toISOString() };
    if (db) {
      try {
        await setDoc(doc(db, 'tutorConversations', docId), payload, { merge: true });
      } catch {
        LocalStore.set('tutorConversations', docId, payload);
      }
    } else {
      LocalStore.set('tutorConversations', docId, payload);
    }
  }

  public static async getTutorConversation(userId: string, videoId: string): Promise<TutorMessage[]> {
    const docId = `${userId}_${videoId}`;
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'tutorConversations', docId));
        if (snap.exists()) return snap.data().messages || [];
      } catch {}
    }
    const item = LocalStore.get<{ messages: TutorMessage[] }>('tutorConversations', docId);
    return item ? item.messages : [];
  }

  // -------------------------------------------------------------
  // DYNAMIC PREFERRED STUDY TIME INFERENCE
  // -------------------------------------------------------------
  public static async getUserPreferredStudyHour(userId: string): Promise<{ preferredHour: number; formatted: string }> {
    const [history, quizzes, revisions] = await Promise.all([
      this.getUserLearningHistory(userId),
      this.getUserQuizResults(userId),
      this.getAllUserRevisions(userId),
    ]);

    const timestamps: string[] = [];

    // History watchedAt (only meaningful watch time >= 30s)
    history.forEach((h) => {
      if (((h.durationSeconds || 0) >= 30 || (h.watchPercentage ?? 0) > 0) && h.watchedAt) {
        timestamps.push(h.watchedAt);
      }
    });

    // Quizzes completedAt
    quizzes.forEach((q) => {
      if (q.completedAt) timestamps.push(q.completedAt);
    });

    // Revisions
    revisions.forEach((r) => {
      if (r.lastRevisionDate) timestamps.push(r.lastRevisionDate);
      r.attempts?.forEach((a) => {
        if (a.date) timestamps.push(a.date);
      });
    });

    // Calculate hour histogram (0 to 23) in student's local timezone
    const hourCounts = new Array(24).fill(0);
    let totalCount = 0;

    timestamps.forEach((ts) => {
      try {
        const d = new Date(ts);
        if (!isNaN(d.getTime())) {
          const hour = d.getHours();
          if (hour >= 0 && hour <= 23) {
            hourCounts[hour]++;
            totalCount++;
          }
        }
      } catch {}
    });

    // Default to 19 (7:00 PM) if insufficient history
    let peakHour = 19;
    let maxCount = 0;

    if (totalCount > 0) {
      for (let h = 0; h < 24; h++) {
        if (hourCounts[h] > maxCount) {
          maxCount = hourCounts[h];
          peakHour = h;
        }
      }
    }

    const formatHourString = (hour: number) => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:00 ${period}`;
    };

    return {
      preferredHour: peakHour,
      formatted: formatHourString(peakHour),
    };
  }

  // -------------------------------------------------------------
  // STUDENT ANALYTICS AGGREGATOR (100% REAL FIREBASE ACTIVITY)
  // -------------------------------------------------------------
  public static async getStudentAnalytics(userId: string): Promise<StudentAnalytics> {
    const [history, quizzes, flashcards, revisions, dailyProgress] = await Promise.all([
      this.getUserLearningHistory(userId),
      this.getUserQuizResults(userId),
      this.getAllUserFlashcards(userId),
      this.getAllUserRevisions(userId),
      this.getUserDailyLearningProgress(userId),
    ]);

    // 1. Calculate actual learning time strictly from real video watch and study progress
    const historySeconds = history.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
    const progressSeconds = Object.values(dailyProgress).reduce((acc, curr) => acc + (curr.seconds || 0), 0);
    const totalSeconds = Math.max(historySeconds, progressSeconds);
    const totalLearningMinutes = Math.round(totalSeconds / 60);
    const totalLearningHours = Math.round((totalSeconds / 3600) * 10) / 10;

    // 2. Videos Completed vs Started
    const totalVideosWatched = history.length;
    const completedVideosCount = history.filter(
      (h) => h.isCompleted || (h.watchPercentage !== undefined && h.watchPercentage >= 100)
    ).length;

    // 3. Unique topics studied
    const topicsSet = new Set<string>();
    history.forEach((h) => h.studiedTopics?.forEach((t) => { if (t?.trim()) topicsSet.add(t.trim()); }));
    revisions.forEach((r) => {
      r.masteredTopics?.forEach((t) => { if (t?.trim()) topicsSet.add(t.trim()); });
      r.weakTopics?.forEach((t) => { if (t?.trim()) topicsSet.add(t.trim()); });
    });
    const topicsStudiedCount = topicsSet.size;

    // 4. Flashcards stats from real reviews
    const flashcardsMasteredCount = flashcards.filter((f) => f.status === 'known').length;
    const flashcardsReviewCount = flashcards.filter((f) => f.status === 'review').length;

    // 5. Quiz score stats & accuracy trend from real quizzes
    const totalQuizzesTaken = quizzes.length;
    const averageQuizScore = totalQuizzesTaken > 0
      ? Math.round(quizzes.reduce((acc, q) => acc + q.percentage, 0) / totalQuizzesTaken)
      : 0;

    const quizScoreTrend = quizzes
      .slice(0, 10)
      .reverse()
      .map((q, idx) => ({
        date: q.completedAt
          ? new Date(q.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          : `Quiz ${idx + 1}`,
        score: q.percentage,
        title: q.videoTitle ? (q.videoTitle.length > 25 ? `${q.videoTitle.slice(0, 25)}...` : q.videoTitle) : `Quiz ${idx + 1}`,
      }));

    // 6. Topic mastery & weak/strong detection from real quiz breakdown & revisions
    const topicScores: Record<string, { correct: number; total: number }> = {};
    quizzes.forEach((q) => {
      if (q.topicBreakdown) {
        Object.entries(q.topicBreakdown).forEach(([topic, s]) => {
          if (!topicScores[topic]) topicScores[topic] = { correct: 0, total: 0 };
          topicScores[topic].correct += s.correct;
          topicScores[topic].total += s.total;
        });
      }
    });

    revisions.forEach((r) => {
      r.masteredTopics?.forEach((topic) => {
        if (!topicScores[topic]) topicScores[topic] = { correct: 0, total: 0 };
        topicScores[topic].correct += 5;
        topicScores[topic].total += 5;
      });
      r.weakTopics?.forEach((topic) => {
        if (!topicScores[topic]) topicScores[topic] = { correct: 0, total: 0 };
        topicScores[topic].correct += 1;
        topicScores[topic].total += 5;
      });
    });

    const strongTopics: string[] = [];
    const weakTopics: string[] = [];
    const topicMasteryList: Array<{ topic: string; mastery: number; category: string }> = [];

    Object.entries(topicScores).forEach(([topic, data]) => {
      if (data.total > 0) {
        const pct = Math.round((data.correct / data.total) * 100);
        topicMasteryList.push({
          topic,
          mastery: pct,
          category: pct >= 75 ? 'Strong' : pct >= 50 ? 'Developing' : 'Needs Practice',
        });
        if (pct >= 75) strongTopics.push(topic);
        else if (pct < 65) weakTopics.push(topic);
      }
    });

    // 7. Day Streak: calculate from actual days the student studied / learned
    const activeDates = new Set<string>();
    Object.entries(dailyProgress).forEach(([dateStr, prog]) => {
      if ((prog.seconds || 0) > 0 || (prog.minutes || 0) > 0) {
        activeDates.add(dateStr);
      }
    });
    history.forEach((h) => {
      if ((h.durationSeconds || 0) > 0 && h.watchedAt) {
        activeDates.add(h.watchedAt.split('T')[0]);
      }
    });
    quizzes.forEach((q) => {
      if (q.completedAt) {
        activeDates.add(q.completedAt.split('T')[0]);
      }
    });
    revisions.forEach((r) => {
      if (r.lastRevisionDate) {
        activeDates.add(r.lastRevisionDate.split('T')[0]);
      }
      r.attempts?.forEach((a) => {
        if (a.date) activeDates.add(a.date.split('T')[0]);
      });
    });

    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const now = new Date();
    const todayStr = formatDate(now);
    let dayStreak = 0;
    let checkDate = new Date(now);

    if (activeDates.has(todayStr)) {
      // Active today: count consecutive days backwards from today
      while (activeDates.has(formatDate(checkDate))) {
        dayStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else {
      // Not active yet today: check if active yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = formatDate(checkDate);
      if (activeDates.has(yesterdayStr)) {
        while (activeDates.has(formatDate(checkDate))) {
          dayStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      } else {
        dayStreak = 0;
      }
    }

    // 8. Consistency Graph: past 7 days study time (strictly actual minutes, 0 if no activity)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const studyTimeByDay: Array<{ day: string; minutes: number; date: string }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const dayName = dayNames[d.getDay()];
      const dayData = dailyProgress[dateStr];
      const minutes = dayData ? (dayData.minutes ?? Math.round((dayData.seconds || 0) / 60)) : 0;

      studyTimeByDay.push({
        day: dayName,
        minutes,
        date: dateStr,
      });
    }

    // Weekly growth percentage: compare past 7 days vs previous 7 days (days 7 to 13 ago)
    let thisWeekMinutes = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const dayData = dailyProgress[dateStr];
      thisWeekMinutes += dayData ? (dayData.minutes ?? Math.round((dayData.seconds || 0) / 60)) : 0;
    }

    let prevWeekMinutes = 0;
    for (let i = 7; i < 14; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const dayData = dailyProgress[dateStr];
      prevWeekMinutes += dayData ? (dayData.minutes ?? Math.round((dayData.seconds || 0) / 60)) : 0;
    }

    let weeklyGrowthPct = 0;
    if (prevWeekMinutes > 0) {
      weeklyGrowthPct = Math.round(((thisWeekMinutes - prevWeekMinutes) / prevWeekMinutes) * 100);
    } else if (thisWeekMinutes > 0) {
      weeklyGrowthPct = 100;
    } else {
      weeklyGrowthPct = 0;
    }

    // 9. Revision sessions & accuracy
    const allAttempts = revisions.flatMap((r) => r.attempts || []);
    const totalRevisionSessions = allAttempts.length;
    const revisionAccuracyAvg = totalRevisionSessions > 0
      ? Math.round(allAttempts.reduce((acc, a) => acc + (a.accuracy || 0), 0) / totalRevisionSessions)
      : 0;

    // 10. Learning Score: real composite metric (0-100%) from completed sections and performance
    let scoreAccumulator = 0;
    let scoreWeights = 0;

    if (history.length > 0) {
      const completionRate = completedVideosCount / history.length;
      scoreAccumulator += completionRate * 100 * 0.30;
      scoreWeights += 0.30;
    }
    if (totalQuizzesTaken > 0) {
      scoreAccumulator += averageQuizScore * 0.30;
      scoreWeights += 0.30;
    }
    const totalCards = flashcardsMasteredCount + flashcardsReviewCount;
    if (totalCards > 0) {
      const cardMasteryRate = (flashcardsMasteredCount / totalCards) * 100;
      scoreAccumulator += cardMasteryRate * 0.20;
      scoreWeights += 0.20;
    }
    if (dayStreak > 0 || totalRevisionSessions > 0) {
      const streakScore = Math.min(100, dayStreak * 20);
      const revScore = revisionAccuracyAvg > 0 ? revisionAccuracyAvg : streakScore;
      scoreAccumulator += ((streakScore + revScore) / 2) * 0.20;
      scoreWeights += 0.20;
    }

    const learningScore = scoreWeights > 0
      ? Math.round(scoreAccumulator / scoreWeights)
      : 0;

    const preferredTime = await this.getUserPreferredStudyHour(userId);

    return {
      totalVideosWatched,
      completedVideosCount,
      totalLearningMinutes,
      totalLearningHours,
      topicsStudiedCount,
      flashcardsMasteredCount,
      flashcardsReviewCount,
      averageQuizScore,
      totalQuizzesTaken,
      strongTopics,
      weakTopics,
      studyTimeByDay,
      quizScoreTrend,
      topicMasteryList,
      dayStreak,
      learningScore,
      weeklyGrowthPct,
      totalRevisionSessions,
      revisionAccuracyAvg,
      preferredStudyHour: preferredTime.preferredHour,
      preferredStudyTimeFormatted: preferredTime.formatted,
      hasCompletedTodayActivity: activeDates.has(todayStr),
    };
  }

  // -------------------------------------------------------------
  // REVISION & SPACED REPETITION & KAIZEN
  // -------------------------------------------------------------
  public static async saveRevisionData(userId: string, videoId: string, data: RevisionData): Promise<void> {
    const docId = `${userId}_${videoId}`;
    if (db) {
      try {
        await setDoc(doc(db, 'revisions', docId), data, { merge: true });
      } catch {
        LocalStore.set('revisions', docId, data);
      }
    } else {
      LocalStore.set('revisions', docId, data);
    }
  }

  public static async getRevisionData(userId: string, videoId: string): Promise<RevisionData | null> {
    const docId = `${userId}_${videoId}`;
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'revisions', docId));
        if (snap.exists()) return snap.data() as RevisionData;
      } catch {}
    }
    return LocalStore.get<RevisionData>('revisions', docId);
  }

  public static async getAllUserRevisions(userId: string): Promise<RevisionData[]> {
    if (db) {
      try {
        const q = query(
          collection(db, 'revisions'),
          where('userId', '==', userId)
        );
        const snaps = await getDocs(q);
        const results: RevisionData[] = [];
        snaps.forEach((d) => results.push(d.data() as RevisionData));
        if (results.length > 0) return results;
      } catch {}
    }
    const all = LocalStore.getAll<RevisionData & { userId?: string }>('revisions');
    return all.filter((r) => r.userId === userId || (r.videoId && r.videoId.startsWith(userId)));
  }

  public static async recordRevisionAttempt(params: {
    userId: string;
    videoId: string;
    videoTitle: string;
    attempt: RevisionSessionAttempt;
    newWeakTopics: string[];
    newMasteredTopics: string[];
  }): Promise<RevisionData> {
    const { userId, videoId, videoTitle, attempt, newWeakTopics, newMasteredTopics } = params;
    const existing = await this.getRevisionData(userId, videoId);

    // Kaizen metrics
    const previousScore = existing ? existing.currentScore : 0;
    const currentScore = attempt.score;
    const improvementPct = previousScore > 0
      ? Math.round(((currentScore - previousScore) / previousScore) * 100)
      : currentScore;

    // Topics improved: previously weak but now mastered
    const prevWeakSet = new Set(existing?.weakTopics || []);
    const topicsImproved = newMasteredTopics.filter((t) => prevWeakSet.has(t));

    // Combine mastered topics, remove currently weak topics
    const currentMastered = Array.from(
      new Set([...(existing?.masteredTopics || []), ...newMasteredTopics])
    ).filter((t) => !newWeakTopics.includes(t));

    const currentWeak = Array.from(
      new Set([...(existing?.weakTopics || []).filter((t) => !newMasteredTopics.includes(t)), ...newWeakTopics])
    );

    // Spaced repetition interval (1d -> 3d -> 7d -> 30d)
    let currentInterval = existing?.spacedRepetitionIntervalDays || 1;
    let currentStage = existing?.spacedRepetitionStage || 1;

    if (attempt.accuracy >= 75) {
      if (currentInterval === 1) {
        currentInterval = 3;
        currentStage = 2;
      } else if (currentInterval === 3) {
        currentInterval = 7;
        currentStage = 3;
      } else if (currentInterval >= 7) {
        currentInterval = 30;
        currentStage = 4;
      }
    } else if (attempt.accuracy < 60) {
      currentInterval = 1;
      currentStage = 1;
    }

    const now = new Date();
    const nextDate = new Date(now.getTime() + currentInterval * 24 * 60 * 60 * 1000);

    // Calculate streak
    let revisionStreak = existing?.revisionStreak || 0;
    if (existing?.lastRevisionDate) {
      const lastDate = new Date(existing.lastRevisionDate);
      const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        revisionStreak += 1;
      } else if (diffDays === 0) {
        revisionStreak = Math.max(1, revisionStreak);
      } else {
        revisionStreak = 1;
      }
    } else {
      revisionStreak = 1;
    }

    const updatedData: RevisionData = {
      userId,
      videoId,
      videoTitle,
      revisionStreak,
      lastRevisionDate: now.toISOString(),
      nextRevisionDate: nextDate.toISOString(),
      spacedRepetitionIntervalDays: currentInterval,
      spacedRepetitionStage: currentStage,
      previousScore,
      currentScore,
      improvementPct,
      masteredTopics: currentMastered,
      weakTopics: currentWeak,
      topicsImproved,
      attempts: [attempt, ...(existing?.attempts || [])],
      blurtingLogs: existing?.blurtingLogs || [],
      activeRecallLogs: existing?.activeRecallLogs || [],
    };

    await this.saveRevisionData(userId, videoId, updatedData);
    return updatedData;
  }

  public static async saveBlurtingLog(userId: string, videoId: string, log: BlurtingLog): Promise<void> {
    const existing = await this.getRevisionData(userId, videoId);
    if (existing) {
      existing.blurtingLogs = [log, ...(existing.blurtingLogs || [])];
      await this.saveRevisionData(userId, videoId, existing);
    }
  }

  public static async saveActiveRecallLog(userId: string, videoId: string, log: ActiveRecallLog): Promise<void> {
    const existing = await this.getRevisionData(userId, videoId);
    if (existing) {
      existing.activeRecallLogs = [log, ...(existing.activeRecallLogs || [])];
      await this.saveRevisionData(userId, videoId, existing);
    }
  }

  // -------------------------------------------------------------
  // REVISION NOTIFICATIONS
  // -------------------------------------------------------------
  public static async saveNotification(notification: RevisionNotification): Promise<void> {
    if (db) {
      try {
        await setDoc(doc(db, 'revisionNotifications', notification.id), notification, { merge: true });
      } catch {
        LocalStore.set('revisionNotifications', notification.id, notification);
      }
    } else {
      LocalStore.set('revisionNotifications', notification.id, notification);
    }
  }

  public static async getUserNotifications(userId: string): Promise<RevisionNotification[]> {
    if (db) {
      try {
        const q = query(
          collection(db, 'revisionNotifications'),
          where('userId', '==', userId),
          limit(50)
        );
        const snaps = await getDocs(q);
        const list: RevisionNotification[] = [];
        snaps.forEach((d) => list.push(d.data() as RevisionNotification));
        if (list.length > 0) {
          return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      } catch {}
    }

    const all = LocalStore.getAll<RevisionNotification & { userId: string }>('revisionNotifications');
    return all
      .filter((n) => n.userId === userId || n.id.startsWith(userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    const existingList = await this.getUserNotifications(userId);
    const target = existingList.find((n) => n.id === notificationId);
    if (target) {
      const updated = { ...target, isRead: true, readAt: new Date().toISOString() };
      await this.saveNotification(updated);
    }
  }

  public static async markNotificationAsCompleted(userId: string, notificationId: string): Promise<void> {
    const existingList = await this.getUserNotifications(userId);
    const target = existingList.find((n) => n.id === notificationId);
    if (target) {
      const updated = { ...target, isRead: true, isCompleted: true };
      await this.saveNotification(updated);
    }
  }

  public static async checkAndGenerateRevisionNotifications(
    userId: string,
    isUserOnline: boolean = true
  ): Promise<RevisionNotification[]> {
    const existingNotifications = await this.getUserNotifications(userId);
    const notifMap = new Map<string, RevisionNotification>();
    existingNotifications.forEach((n) => notifMap.set(n.id, n));

    const [history, quizzes, revisions, dailyProgress] = await Promise.all([
      this.getUserLearningHistory(userId),
      this.getUserQuizResults(userId),
      this.getAllUserRevisions(userId),
      this.getUserDailyLearningProgress(userId),
    ]);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const currentHour = now.getHours();

    // -----------------------------------------------------------------
    // 1. SCHEDULED SPACED REPETITION DUE NOTIFICATION (PRIORITY 1 - HIGHEST)
    // -----------------------------------------------------------------
    for (const item of history) {
      const revData = await this.getRevisionData(userId, item.videoId);
      if (revData && revData.nextRevisionDate) {
        const dueDate = new Date(revData.nextRevisionDate);
        if (dueDate.getTime() <= now.getTime()) {
          const dueDayKey = revData.nextRevisionDate.split('T')[0];
          const dueId = `${userId}_due_${item.videoId}_${dueDayKey}`;
          if (!notifMap.has(dueId)) {
            const newNotif: RevisionNotification = {
              id: dueId,
              userId,
              videoId: item.videoId,
              videoTitle: item.videoTitle,
              type: 'revision_due',
              title: '🔔 Your revision is due',
              message: `Your scheduled ${revData.spacedRepetitionIntervalDays || 1}-day spaced repetition review for "${item.videoTitle}" is due.`,
              createdAt: now.toISOString(),
              dueDate: revData.nextRevisionDate,
              isRead: false,
              priority: 1,
            };
            await this.saveNotification(newNotif);
            notifMap.set(dueId, newNotif);
          }
        }
      }
    }

    // -----------------------------------------------------------------
    // 2. SMART CONSISTENCY & DAY STREAK NOTIFICATIONS (PRIORITY 2)
    // -----------------------------------------------------------------
    // Check if meaningful learning activity was completed today:
    // (Video watch time >= 30s, quiz, flashcard review, or revision attempt)
    // Merely opening the application does NOT count as meaningful learning activity.
    const todayProgress = dailyProgress[todayStr];
    const hasDailyStudyToday = todayProgress
      ? (todayProgress.seconds >= 30 || todayProgress.minutes >= 1)
      : false;
    const hasHistoryToday = history.some(
      (h) => ((h.durationSeconds || 0) >= 30 || (h.watchPercentage ?? 0) > 0) && h.watchedAt?.startsWith(todayStr)
    );
    const hasQuizToday = quizzes.some((q) => q.completedAt?.startsWith(todayStr));
    const hasRevisionToday = revisions.some(
      (r) => r.lastRevisionDate?.startsWith(todayStr) || r.attempts?.some((a) => a.date?.startsWith(todayStr))
    );

    const hasCompletedToday = hasDailyStudyToday || hasHistoryToday || hasQuizToday || hasRevisionToday;

    // Learn student's preferred study time dynamically from usage history
    const { preferredHour, formatted: preferredTimeFormatted } = await this.getUserPreferredStudyHour(userId);

    // Enforce deduplication: maximum 1 streak notification per calendar day
    const motivationalId = `${userId}_streak_motivational_${todayStr}`;
    const reminderId = `${userId}_streak_reminder_${todayStr}`;
    const hasStreakNotifToday = notifMap.has(motivationalId) || notifMap.has(reminderId);

    // If today's learning activity is already completed:
    // DO NOT send any streak reminder or inactivity reminder!
    if (!hasCompletedToday && !hasStreakNotifToday) {
      // Calculate current day streak
      const activeDates = new Set<string>();
      Object.entries(dailyProgress).forEach(([dStr, prog]) => {
        if ((prog.seconds || 0) >= 30 || (prog.minutes || 0) > 0) activeDates.add(dStr);
      });
      history.forEach((h) => {
        if ((h.durationSeconds || 0) >= 30 && h.watchedAt) activeDates.add(h.watchedAt.split('T')[0]);
      });
      quizzes.forEach((q) => {
        if (q.completedAt) activeDates.add(q.completedAt.split('T')[0]);
      });
      revisions.forEach((r) => {
        if (r.lastRevisionDate) activeDates.add(r.lastRevisionDate.split('T')[0]);
        r.attempts?.forEach((a) => {
          if (a.date) activeDates.add(a.date.split('T')[0]);
        });
      });

      let currentStreak = 0;
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (activeDates.has(yesterdayStr)) {
        while (activeDates.has(`${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }

      // Check whether current time is around preferred study time (from 1 hour prior)
      const isAroundUsualStudyTime = currentHour >= (preferredHour - 1);

      if (isAroundUsualStudyTime) {
        if (isUserOnline) {
          // Student is active in app around usual study time: Motivational notification!
          const streakHighlight = currentStreak > 0
            ? `You're online! Keep your ${currentStreak}-day learning streak going 🔥`
            : `You're online! Keep your learning streak going 🔥`;

          const newNotif: RevisionNotification = {
            id: motivationalId,
            userId,
            type: 'streak_motivational',
            title: "You're online! Keep your learning streak going 🔥",
            message: `${streakHighlight} Complete a lesson, quiz, or revision session today to protect your progress.`,
            createdAt: now.toISOString(),
            isRead: false,
            streakCount: currentStreak,
            usualStudyTime: preferredTimeFormatted,
            priority: 2,
          };
          await this.saveNotification(newNotif);
          notifMap.set(motivationalId, newNotif);
        } else if (currentHour >= preferredHour) {
          // Student is inactive past usual study time: Inactivity reminder!
          const streakHighlight = currentStreak > 0
            ? `Protect your ${currentStreak}-day streak!`
            : `Build your daily learning streak!`;

          const newNotif: RevisionNotification = {
            id: reminderId,
            userId,
            type: 'streak_reminder',
            title: '⏰ Time for Your Daily Learning Session',
            message: `It's around your usual study time (${preferredTimeFormatted}). ${streakHighlight} Jump in to complete today's learning activity.`,
            createdAt: now.toISOString(),
            isRead: false,
            streakCount: currentStreak,
            usualStudyTime: preferredTimeFormatted,
            priority: 2,
          };
          await this.saveNotification(newNotif);
          notifMap.set(reminderId, newNotif);
        }
      }
    }

    // -----------------------------------------------------------------
    // 3. 100% VIDEO COMPLETION UNLOCKED NOTIFICATION (PRIORITY 3)
    // -----------------------------------------------------------------
    for (const item of history) {
      const isCompleted = item.isCompleted || (item.watchPercentage ?? 0) >= 100;
      if (isCompleted) {
        const unlockId = `${userId}_unlocked_${item.videoId}`;
        if (!notifMap.has(unlockId)) {
          const newNotif: RevisionNotification = {
            id: unlockId,
            userId,
            videoId: item.videoId,
            videoTitle: item.videoTitle,
            type: 'revision_unlocked',
            title: '🎉 Revision Unlocked!',
            message: `You completed 100% of "${item.videoTitle}". Active Recall and Blurting revision are now ready!`,
            createdAt: item.watchedAt || now.toISOString(),
            isRead: false,
            priority: 3,
          };
          await this.saveNotification(newNotif);
          notifMap.set(unlockId, newNotif);
        }
      }
    }

    // -----------------------------------------------------------------
    // 4. SORT BY PRIORITY: Revision Due (1) > Streak Notifications (2) > Unlocked (3)
    // -----------------------------------------------------------------
    return Array.from(notifMap.values()).sort((a, b) => {
      const pA = a.priority ?? (a.type === 'revision_due' ? 1 : a.type.startsWith('streak') ? 2 : 3);
      const pB = b.priority ?? (b.type === 'revision_due' ? 1 : b.type.startsWith('streak') ? 2 : 3);
      if (pA !== pB) return pA - pB;
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  // -------------------------------------------------------------
  // SMART NOTES HUMAN CORRECTIONS & LEARNING FROM CORRECTIONS
  // -------------------------------------------------------------
  public static async saveSmartNotesCorrection(correction: SmartNotesCorrection): Promise<void> {
    if (!correction.id) {
      correction.id = `corr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }
    if (!correction.createdAt) {
      correction.createdAt = new Date().toISOString();
    }
    correction.isApproved = true;

    // 1. Save to Firestore collection 'smartNotesCorrections'
    if (db) {
      try {
        await setDoc(doc(db, 'smartNotesCorrections', correction.id), correction);
      } catch (e) {
        console.warn('Firestore saveSmartNotesCorrection error, saving locally:', e);
      }
    }

    // 2. Also save to LocalStore for reliable offline / local development
    LocalStore.set('smartNotesCorrections', correction.id, correction);

    // 3. Sync with backend server API
    try {
      await fetch('/api/video/notes-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(correction),
      });
    } catch {
      // Non-fatal if offline
    }
  }

  public static async getSmartNotesCorrections(videoId?: string): Promise<SmartNotesCorrection[]> {
    if (db) {
      try {
        let q;
        if (videoId) {
          q = query(
            collection(db, 'smartNotesCorrections'),
            where('videoId', '==', videoId),
            orderBy('createdAt', 'desc')
          );
        } else {
          q = query(
            collection(db, 'smartNotesCorrections'),
            orderBy('createdAt', 'desc')
          );
        }
        const snap = await getDocs(q);
        const results = snap.docs.map((d) => d.data() as SmartNotesCorrection);
        if (results.length > 0) return results;
      } catch (e) {
        console.warn('Firestore getSmartNotesCorrections error, falling back to LocalStore:', e);
      }
    }

    const all = LocalStore.getAll<SmartNotesCorrection>('smartNotesCorrections');
    const filtered = videoId ? all.filter((c) => c.videoId === videoId) : all;
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}


