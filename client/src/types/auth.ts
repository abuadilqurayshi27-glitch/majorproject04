export interface StudentProfile {
  uid: string;
  name: string;
  email: string;
  age?: number;
  education: string;   // e.g. "High School", "PUC", "Undergraduate", "Postgraduate", "Self-Taught"
  stream?: string;     // e.g. "Science", "Commerce", "Arts" (HS/PUC) or "CS & Engineering" (UG)
  course: string;      // e.g. "High School – Science", "PUC Science", "Computer Science & Engineering"
  subjects: string[];  // e.g. ["Physics", "Chemistry", "Mathematics"] or ["DBMS", "Python"]
  learningGoal: string;
  learningLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  classLevel?: string; // e.g. "9", "10", "11", "12"
  boardExam?: string;  // e.g. "CBSE", "ICSE", "Karnataka State Board", "Maharashtra Board", "NEET Foundation"
  photoURL: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isProfileComplete: boolean;
}

/**
 * Checks whether an email address is a placeholder or demo dummy value
 */
export function isDummyEmail(email?: string): boolean {
  if (!email || !email.trim()) return true;
  const lower = email.toLowerCase().trim();
  return (
    lower === 'alex.student@university.edu' ||
    lower === 'student@studymind.ai' ||
    lower.endsWith('@example.com')
  );
}

/**
 * Validates whether a student profile has all mandatory fields completed.
 * Required fields:
 * - name, email, age, education, course, subjects, learningGoal, learningLevel.
 * - Conditional requirements based on education level:
 *   - High School: classLevel, boardExam
 *   - PUC: classLevel, stream, boardExam
 *   - Undergraduate / Postgraduate: stream
 */
export function isProfileDataComplete(profile: Partial<StudentProfile> | null | undefined): boolean {
  if (!profile) return false;
  if (!profile.name || !profile.name.trim()) return false;
  if (!profile.email || !profile.email.trim() || isDummyEmail(profile.email)) return false;
  if (!profile.age || isNaN(Number(profile.age)) || Number(profile.age) <= 0) return false;
  if (!profile.education || !profile.education.trim()) return false;
  if (!profile.course || !profile.course.trim()) return false;
  if (!profile.learningGoal || !profile.learningGoal.trim()) return false;
  if (!profile.learningLevel) return false;
  if (!profile.subjects || profile.subjects.length === 0) return false;

  if (profile.education === 'High School') {
    if (!profile.classLevel || !profile.classLevel.trim()) return false;
    if (!profile.boardExam || !profile.boardExam.trim()) return false;
  } else if (profile.education === 'PUC') {
    if (!profile.classLevel || !profile.classLevel.trim()) return false;
    if (!profile.stream || !profile.stream.trim()) return false;
    if (!profile.boardExam || !profile.boardExam.trim()) return false;
  } else if (profile.education === 'Undergraduate' || profile.education === 'Postgraduate') {
    if (!profile.stream || !profile.stream.trim()) return false;
  }

  return true;
}

/**
 * Returns a list of missing required fields for display in onboarding / setup modals.
 */
export function getMissingProfileFields(profile: Partial<StudentProfile> | null | undefined): string[] {
  const missing: string[] = [];
  if (!profile) return ['Full Profile Details'];

  if (!profile.name || !profile.name.trim()) missing.push('Full Name');
  if (!profile.email || !profile.email.trim() || isDummyEmail(profile.email)) missing.push('Email');
  if (!profile.age || isNaN(Number(profile.age)) || Number(profile.age) <= 0) missing.push('Age');
  if (!profile.education || !profile.education.trim()) missing.push('Education Level');
  if (!profile.course || !profile.course.trim()) missing.push('Course / Track');
  if (!profile.subjects || profile.subjects.length === 0) missing.push('Focus Subjects');
  if (!profile.learningGoal || !profile.learningGoal.trim()) missing.push('Learning Goal');
  if (!profile.learningLevel) missing.push('Proficiency Level');

  if (profile.education === 'High School') {
    if (!profile.classLevel || !profile.classLevel.trim()) missing.push('Class');
    if (!profile.boardExam || !profile.boardExam.trim()) missing.push('Target Board');
  } else if (profile.education === 'PUC') {
    if (!profile.classLevel || !profile.classLevel.trim()) missing.push('PUC Year');
    if (!profile.stream || !profile.stream.trim()) missing.push('Stream');
    if (!profile.boardExam || !profile.boardExam.trim()) missing.push('Target Board');
  } else if (profile.education === 'Undergraduate' || profile.education === 'Postgraduate') {
    if (!profile.stream || !profile.stream.trim()) missing.push('Specialisation');
  }

  return missing;
}
