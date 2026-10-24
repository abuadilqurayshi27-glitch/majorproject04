import React, { useState, useEffect, useRef } from 'react';
import { Award, Check, Camera, Upload, X, Loader2, Plus, AlertCircle, BookOpen, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { StudyMindLogo } from '../common/StudyMindLogo.js';
import { uploadProfilePicture } from '../../services/imageUploadService.js';
import { getMissingProfileFields } from '../../types/auth.js';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150',
];

// ── Education level configuration ──────────────────────────────────────────

type StreamConfig = {
  label: string;
  course: string;
  subjects: string[];
  goal: string;
};

type EducationConfig = {
  hasStream: boolean;
  streams?: Record<string, StreamConfig>;
  defaultCourse?: string;
  defaultSubjects?: string[];
  defaultGoal?: string;
};

const EDUCATION_CONFIG: Record<string, EducationConfig> = {
  'PUC': {
    hasStream: true,
    streams: {
      'Science': {
        label: 'Science (PCMB / PCMC)',
        course: 'PUC Science',
        subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Electronics', 'Kannada', 'English'],
        goal: 'Score 90%+ in board exams & crack CET / NEET / JEE',
      },
      'Commerce': {
        label: 'Commerce (EBAC / CS)',
        course: 'PUC Commerce',
        subjects: ['Accountancy', 'Business Studies', 'Economics', 'Computer Science', 'Basic Mathematics', 'Statistics', 'English'],
        goal: 'Master commerce fundamentals & prepare for CA Foundation / BCom entrance',
      },
      'Arts': {
        label: 'Arts / Humanities',
        course: 'PUC Arts',
        subjects: ['History', 'Political Science', 'Economics', 'Psychology', 'Sociology', 'English Literature', 'Geography'],
        goal: 'Build strong humanities foundation & prepare for BA / Law entrance exams',
      },
    },
  },
  'High School': {
    hasStream: true,
    streams: {
      'Science': {
        label: 'Science & Math',
        course: 'High School – Science',
        subjects: ['Mathematics', 'Science (Physics, Chem, Bio)', 'Social Science', 'English', 'Hindi', 'Kannada'],
        goal: 'Score 90%+ in board exams and build a solid foundation for higher studies',
      },
      'Commerce': {
        label: 'Commerce Foundation',
        course: 'High School – Commerce',
        subjects: ['Accountancy Basics', 'Economics', 'Mathematics', 'English', 'Social Science'],
        goal: 'Understand commerce basics and score well in board exams',
      },
      'Arts': {
        label: 'Arts / Social Sciences',
        course: 'High School – Arts',
        subjects: ['History', 'Geography', 'Political Science', 'English', 'Economics'],
        goal: 'Excel in humanities and build a foundation for competitive exams',
      },
    },
  },
  'Undergraduate': {
    hasStream: true,
    streams: {
      'CS & Engineering': {
        label: 'CS & Engineering (B.Tech / B.E.)',
        course: 'Computer Science & Engineering',
        subjects: ['DBMS & SQL', 'Data Structures & Algorithms', 'Operating Systems', 'Computer Networks', 'Python Programming', 'Web Development & React', 'Machine Learning & AI', 'System Design'],
        goal: 'Master core CS concepts & crack technical interviews / placements',
      },
      'BCA / B.Sc CS': {
        label: 'BCA / B.Sc Computer Science',
        course: 'BCA / B.Sc CS',
        subjects: ['C & C++ Programming', 'Data Structures', 'DBMS', 'Web Technologies', 'Software Engineering', 'Computer Networks'],
        goal: 'Build practical programming skills and prepare for MCA / jobs',
      },
      'Commerce / BBA': {
        label: 'Commerce / BBA / BCom',
        course: 'BBA / BCom',
        subjects: ['Financial Accounting', 'Business Statistics', 'Marketing Management', 'Economics', 'Business Law', 'HRM'],
        goal: 'Strengthen business fundamentals and prepare for MBA entrance',
      },
      'Arts / Humanities': {
        label: 'Arts / Humanities (BA)',
        course: 'BA – Arts & Humanities',
        subjects: ['History', 'Political Science', 'Sociology', 'Psychology', 'Economics', 'English Literature'],
        goal: 'Excel in liberal arts and prepare for UPSC / research / teaching',
      },
      'Medical / Life Sciences': {
        label: 'Medical / Life Sciences',
        course: 'Medical Sciences / Life Sciences',
        subjects: ['Anatomy', 'Physiology', 'Biochemistry', 'Pharmacology', 'Microbiology', 'Pathology'],
        goal: 'Master medical concepts and prepare for clinical rotations / PG entrance',
      },
    },
  },
  'Postgraduate': {
    hasStream: true,
    streams: {
      'MCA / M.Sc CS': {
        label: 'MCA / M.Sc Computer Science',
        course: 'MCA / M.Sc CS',
        subjects: ['Advanced Algorithms', 'Machine Learning', 'Cloud Computing', 'Deep Learning', 'Data Engineering', 'Distributed Systems'],
        goal: 'Deepen CS expertise and land senior tech or research roles',
      },
      'MBA': {
        label: 'MBA / PGDM',
        course: 'MBA',
        subjects: ['Strategic Management', 'Financial Management', 'Marketing Analytics', 'Operations Management', 'Business Analytics', 'Organizational Behavior'],
        goal: 'Master business leadership skills and crack placements at top firms',
      },
      'M.Tech': {
        label: 'M.Tech / ME',
        course: 'M.Tech',
        subjects: ['Advanced DBMS', 'Compiler Design', 'High Performance Computing', 'Research Methodology', 'Thesis / Project'],
        goal: 'Complete thesis, publish research, and advance to senior engineering or PhD',
      },
      'Humanities / Social Science': {
        label: 'MA – Humanities / Social Science',
        course: 'MA – Humanities',
        subjects: ['Research Methods', 'Advanced Political Theory', 'Comparative Literature', 'Public Policy', 'Economics'],
        goal: 'Develop research skills and prepare for academia, UPSC, or policy roles',
      },
    },
  },
  'Working Professional': {
    hasStream: false,
    defaultCourse: 'Software Development & Upskilling',
    defaultSubjects: ['System Design', 'Machine Learning & AI', 'Cloud Computing (AWS / GCP)', 'Data Engineering', 'Leadership & Management', 'Product Management'],
    defaultGoal: 'Upskill for senior roles, leadership, or a career transition',
  },
  'Self-Taught': {
    hasStream: false,
    defaultCourse: 'Self-Directed Learning',
    defaultSubjects: ['Python Programming', 'Web Development & React', 'Machine Learning & AI', 'Data Structures & Algorithms', 'System Design', 'Cloud Computing'],
    defaultGoal: 'Build a strong foundation through self-learning and land my dream career role',
  },
};

// ── Component ──────────────────────────────────────────────────────────────

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onComplete }) => {
  const { user, profile, saveProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile?.name || user?.displayName || '');
  const [age, setAge] = useState<number>(profile?.age || 17);
  const [education, setEducation] = useState(profile?.education || 'PUC');
  const [stream, setStream] = useState(profile?.stream || 'Science');
  const [course, setCourse] = useState(profile?.course || 'PUC Science');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    profile?.subjects && profile.subjects.length > 0
      ? profile.subjects
      : ['Physics', 'Chemistry', 'Mathematics']
  );
  const [learningGoal, setLearningGoal] = useState(
    profile?.learningGoal || 'Score 90%+ in board exams & crack CET / NEET / JEE'
  );
  const [learningLevel, setLearningLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    profile?.learningLevel || 'Beginner'
  );
  const [classLevel, setClassLevel] = useState(profile?.classLevel || '12');
  const [boardExam, setBoardExam] = useState(profile?.boardExam || 'Karnataka State Board');
  const [customBoardInput, setCustomBoardInput] = useState('');
  const [customSubjectInput, setCustomSubjectInput] = useState('');

  // Avatar state
  const [selectedAvatar, setSelectedAvatar] = useState(
    profile?.photoURL || user?.photoURL || AVATAR_OPTIONS[0]
  );
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Synchronize modal state whenever opened or when profile loads
  useEffect(() => {
    if (isOpen) {
      if (profile) {
        setName(profile.name || user?.displayName || '');
        setAge(profile.age || 17);
        setEducation(profile.education || 'PUC');
        setStream(profile.stream || 'Science');
        setCourse(profile.course || 'PUC Science');
        setSelectedSubjects(
          profile.subjects && profile.subjects.length > 0
            ? profile.subjects
            : ['Physics', 'Chemistry', 'Mathematics']
        );
        setLearningGoal(profile.learningGoal || '');
        setLearningLevel(profile.learningLevel || 'Beginner');
        setClassLevel(profile.classLevel || (profile.education === 'High School' ? '10' : profile.education === 'PUC' ? '12' : ''));
        setBoardExam(profile.boardExam || '');
        setSelectedAvatar(profile.photoURL || user?.photoURL || AVATAR_OPTIONS[0]);
        setUploadedPhotoUrl(null);
        setUploadError(null);
        setFormError(null);
        setSaveSuccess(false);
      } else if (user) {
        setName(user.displayName || '');
        setSelectedAvatar(user.photoURL || AVATAR_OPTIONS[0]);
      }
    }
  }, [isOpen, profile, user]);

  if (!isOpen) return null;

  const eduConfig = EDUCATION_CONFIG[education] || EDUCATION_CONFIG['PUC'];
  const availableStreams = eduConfig.hasStream && eduConfig.streams ? Object.keys(eduConfig.streams) : [];
  const presetSubjects: string[] = eduConfig.hasStream && eduConfig.streams
    ? (eduConfig.streams[stream]?.subjects ?? [])
    : (eduConfig.defaultSubjects ?? []);

  // The active photo to use: uploaded > selected preset
  const activePhoto = uploadedPhotoUrl || selectedAvatar;

  // ── User-driven education change ──
  const handleEducationChange = (newEdu: string) => {
    setEducation(newEdu);
    const cfg = EDUCATION_CONFIG[newEdu];
    if (!cfg) return;

    if (cfg.hasStream && cfg.streams) {
      const firstStream = Object.keys(cfg.streams)[0];
      setStream(firstStream);
      const s = cfg.streams[firstStream];
      if (s) {
        setCourse(s.course);
        // Suggest subjects for this new education level
        setSelectedSubjects(s.subjects.slice(0, 4));
        if (!learningGoal || learningGoal.trim() === '') {
          setLearningGoal(s.goal);
        }
      }
    } else {
      setStream('');
      setCourse(cfg.defaultCourse ?? '');
      setSelectedSubjects(cfg.defaultSubjects ? cfg.defaultSubjects.slice(0, 4) : []);
      if (!learningGoal || learningGoal.trim() === '') {
        setLearningGoal(cfg.defaultGoal ?? '');
      }
    }

    if (newEdu === 'High School') {
      setClassLevel('10');
      setBoardExam((prev) => prev || 'CBSE');
    } else if (newEdu === 'PUC') {
      setClassLevel('12');
      setBoardExam((prev) => prev || 'Karnataka State Board');
    } else {
      setClassLevel('');
    }
  };

  // ── User-driven stream change ──
  const handleStreamChange = (newStream: string) => {
    setStream(newStream);
    const cfg = EDUCATION_CONFIG[education];
    if (cfg?.hasStream && cfg.streams && cfg.streams[newStream]) {
      const s = cfg.streams[newStream];
      setCourse(s.course);
      setSelectedSubjects(s.subjects.slice(0, 4));
      if (!learningGoal || learningGoal.trim() === '') {
        setLearningGoal(s.goal);
      }
    }
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleAddCustomSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customSubjectInput.trim();
    if (!trimmed) return;
    if (!selectedSubjects.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedSubjects((prev) => [...prev, trimmed]);
    }
    setCustomSubjectInput('');
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image must be under 10 MB');
      return;
    }

    setUploadError(null);
    setUploadingPhoto(true);
    try {
      const url = await uploadProfilePicture(user?.uid || profile?.uid || 'local_user', file);
      setUploadedPhotoUrl(url);
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearUploadedPhoto = () => {
    setUploadedPhotoUrl(null);
    setUploadError(null);
  };

  // Determine if authenticated via Google
  const isGoogleUser = Boolean(
    user?.email &&
    (user.photoURL?.includes('googleusercontent.com') || (!user.uid.startsWith('student_') && !user.uid.startsWith('demo_')))
  );

  // Missing fields for completeness check
  const missingFields = getMissingProfileFields({
    name,
    email: user?.email || profile?.email || '',
    age,
    education,
    stream,
    course,
    subjects: selectedSubjects,
    learningGoal,
    learningLevel,
    classLevel,
    boardExam,
  });

  const handleSkipWithDefaults = async () => {
    setLoading(true);
    setFormError(null);
    try {
      const finalBoard = boardExam === 'Other' ? (customBoardInput.trim() || 'State Board') : (boardExam || 'Karnataka State Board');
      await saveProfile({
        name: name.trim() || user?.displayName || 'Student',
        email: user?.email || profile?.email || 'student@studymind.ai',
        age: Number(age) || 17,
        education: education || 'PUC',
        stream: stream || 'Science',
        course: course.trim() || `${education || 'PUC'} ${stream || 'Science'}`.trim(),
        subjects: selectedSubjects.length > 0 ? selectedSubjects : ['Physics', 'Chemistry', 'Mathematics'],
        learningGoal: learningGoal.trim() || 'Score 90%+ in exams & master concepts',
        learningLevel: learningLevel || 'Beginner',
        classLevel: classLevel || (education === 'High School' ? '10' : '12'),
        boardExam: finalBoard,
        photoURL: activePhoto,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onComplete();
      }, 500);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save profile defaults');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter your full name');
      return;
    }
    if (!age || isNaN(Number(age)) || Number(age) <= 0) {
      setFormError('Please enter a valid age (e.g. 17)');
      return;
    }
    if (selectedSubjects.length === 0) {
      setFormError('Please select or add at least one subject of focus');
      return;
    }
    if (!learningGoal.trim()) {
      setFormError('Please describe your main academic or learning goal');
      return;
    }

    setFormError(null);
    setLoading(true);

    const finalBoard = boardExam === 'Other' ? (customBoardInput.trim() || 'State Board') : boardExam;

    try {
      await saveProfile({
        name: name.trim(),
        email: user?.email || profile?.email || 'student@studymind.ai',
        age: Number(age) || 17,
        education,
        stream: stream || '',
        course: course.trim() || `${education} ${stream}`.trim(),
        subjects: selectedSubjects,
        learningGoal: learningGoal.trim() || 'Score 90%+ in exams & master concepts',
        learningLevel,
        classLevel: classLevel || '',
        boardExam: finalBoard || '',
        photoURL: activePhoto,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onComplete();
      }, 500);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setFormError(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl my-8 space-y-6">

        {/* Close Button */}
        <button
          type="button"
          onClick={onComplete}
          className="absolute top-4 right-4 p-2 rounded-xl text-surface-muted hover:text-white hover:bg-[#0E0E1B] border border-transparent hover:border-surface-border transition-all"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex justify-center mb-1">
            <StudyMindLogo size="md" variant="badge" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Student Profile & Learning Goals</h2>
          <p className="text-xs text-surface-muted max-w-md mx-auto">
            Personalize your StudyMind AI experience. High school and PUC options customize chapter tags, quiz difficulty, and recommendations.
          </p>
        </div>

        {/* Status Banners */}
        {formError && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Profile details saved successfully!</span>
          </div>
        )}

        {/* ── Missing Fields / Onboarding Guidance Banner ── */}
        {missingFields.length > 0 ? (
          <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
                <span className="text-xs font-bold text-indigo-200">
                  Complete Your Learning Profile ({missingFields.length} remaining)
                </span>
              </div>
              <span className="text-[10px] text-indigo-300/80 font-medium hidden sm:inline">
                Required for AI Tutor & Recommendations
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {missingFields.map((field) => (
                <span
                  key={field}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-900/60 border border-indigo-600/50 text-indigo-300 font-medium"
                >
                  • {field}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>All essential profile fields completed. You can update details anytime.</span>
          </div>
        )}

        {/* ── Photo Section ─────────────────────────────────────────── */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <img
                src={activePhoto}
                alt="Profile"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-500/80 shadow-lg shadow-brand-500/20"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 rounded-2xl bg-black/60 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Upload custom photo"
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-white" />
                    <span className="text-[10px] text-white font-semibold">Change</span>
                  </>
                )}
              </button>

              {uploadedPhotoUrl && (
                <button
                  type="button"
                  onClick={clearUploadedPhoto}
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 rounded-full p-0.5 text-white shadow-md transition-colors"
                  title="Remove uploaded photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isGoogleUser && activePhoto === user?.photoURL && !uploadedPhotoUrl && (
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Retrieved from Google account
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-500/40 text-brand-300 text-xs font-semibold hover:bg-brand-600/10 transition-all disabled:opacity-60"
              >
                {uploadingPhoto ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                ) : (
                  <><Upload className="w-3.5 h-3.5" /> Upload Photo</>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoFileChange}
              />
            </div>

            {uploadError && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <X className="w-3 h-3" /> {uploadError}
              </p>
            )}
            {uploadedPhotoUrl && !uploadError && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Photo updated
              </p>
            )}
          </div>

          <div>
            <p className="text-[10px] text-surface-muted text-center mb-1.5">
              {uploadedPhotoUrl ? 'Or select a preset avatar:' : 'Or choose an avatar:'}
            </p>
            <div className="flex items-center justify-center gap-2.5">
              {AVATAR_OPTIONS.map((avatar, idx) => {
                const isActive = !uploadedPhotoUrl && selectedAvatar === avatar;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setSelectedAvatar(avatar); setUploadedPhotoUrl(null); }}
                    className={`relative rounded-full p-0.5 transition-transform ${
                      isActive
                        ? 'ring-2 ring-brand-500 scale-110 shadow-lg shadow-brand-500/30'
                        : 'opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-9 h-9 rounded-full object-cover" />
                    {isActive && (
                      <div className="absolute -bottom-1 -right-1 bg-brand-600 rounded-full p-0.5 text-white">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Profile Form ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Full Name *</label>
                {isGoogleUser && name === user?.displayName && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-semibold inline-flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> From Google
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 bg-[#0E0E1B] border border-surface-border rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Age *</label>
                <span className="text-[10px] text-surface-muted">Tunes explanation maturity</span>
              </div>
              <input
                type="number"
                min="10"
                max="99"
                required
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10) || 17)}
                className="w-full px-3.5 py-2.5 bg-[#0E0E1B] border border-surface-border rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Account Email (Retrieved from Firebase / Google Auth) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Account Email</label>
              {isGoogleUser ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-semibold inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Google Account
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-300 font-semibold inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Authenticated
                </span>
              )}
            </div>
            <input
              type="email"
              readOnly
              value={user?.email || profile?.email || 'student@studymind.ai'}
              className="w-full px-3.5 py-2.5 bg-[#0A0A12] border border-surface-border/60 rounded-xl text-xs text-slate-400 cursor-not-allowed select-none"
            />
          </div>

          {/* Education Level */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Education Level *</label>
              <span className="text-[10px] text-brand-400">✦ Selects syllabus & question types</span>
            </div>
            <select
              value={education}
              onChange={(e) => handleEducationChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0E0E1B] border border-surface-border rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="PUC">PUC / Pre-University (11th–12th / +1 & +2)</option>
              <option value="High School">High School (9th–10th / Secondary)</option>
              <option value="Undergraduate">Undergraduate (College / B.Tech / B.E. / B.Sc / B.Com)</option>
              <option value="Postgraduate">Postgraduate (Master's / M.Tech / MCA / MBA)</option>
              <option value="Working Professional">Working Professional</option>
              <option value="Self-Taught">Self-Taught Learner</option>
            </select>
          </div>

          {/* ── Class Level + Board Exam — customized for High School & PUC ── */}
          {(education === 'High School' || education === 'PUC') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3.5 rounded-2xl border border-brand-800/40 bg-brand-950/20">
              {/* Class Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Class / Year
                  <span className="ml-1 text-[10px] text-brand-400 font-normal">✦ Direct syllabus tuning</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(education === 'High School' ? ['9', '10'] : ['11', '12']).map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setClassLevel(cls)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        classLevel === cls
                          ? 'bg-brand-600/40 border-brand-500 text-brand-200 shadow-sm'
                          : 'bg-[#0E0E1B] border-surface-border text-surface-muted hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      {education === 'PUC' ? (cls === '11' ? '1st PUC (11th)' : '2nd PUC (12th)') : `Class ${cls}th`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Board Exam */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Board / Target Exam
                  <span className="ml-1 text-[10px] text-brand-400 font-normal">✦ Exam recommendations</span>
                </label>
                <select
                  value={boardExam}
                  onChange={(e) => setBoardExam(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0E0E1B] border border-surface-border rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select Target Board</option>
                  <option value="Karnataka State Board">Karnataka State Board (KSEEB / Pre-University)</option>
                  <option value="CBSE">CBSE (Central Board)</option>
                  <option value="ICSE">ICSE / ISC</option>
                  <option value="Maharashtra Board">Maharashtra Board (SSC / HSC)</option>
                  <option value="Tamil Nadu State Board">Tamil Nadu State Board</option>
                  <option value="Andhra Pradesh Board">Andhra Pradesh Board</option>
                  <option value="Telangana Board">Telangana Board</option>
                  <option value="Kerala Board">Kerala Board (DHSE)</option>
                  <option value="NEET Foundation">NEET Target (Medical)</option>
                  <option value="JEE Foundation">JEE Target (Engineering)</option>
                  <option value="CET">CET Target (State Engineering)</option>
                  <option value="Other">Other / Custom Board</option>
                </select>
                {boardExam === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter your board or exam name..."
                    value={customBoardInput}
                    onChange={(e) => setCustomBoardInput(e.target.value)}
                    className="w-full mt-2 px-3 py-1.5 bg-[#0E0E1B] border border-surface-border rounded-xl text-xs text-white placeholder-surface-muted focus:outline-none focus:border-brand-500"
                  />
                )}
              </div>
            </div>
          )}

          {/* Stream Selector */}
          {availableStreams.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Stream / Academic Track
                <span className="ml-1.5 text-[10px] text-brand-400 font-normal">✦ Auto-aligns syllabus</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableStreams.map((s) => {
                  const cfg = (eduConfig.streams as Record<string, StreamConfig>)[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleStreamChange(s)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                        stream === s
                          ? 'bg-brand-600/30 border-brand-500 text-brand-300 shadow-sm'
                          : 'bg-[#0E0E1B] border-surface-border text-surface-muted hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {cfg?.label || s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Course / Major */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Course / Major Title
            </label>
            <input
              type="text"
              placeholder="e.g. PUC Science (PCMB) / Computer Science"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0E0E1B] border border-surface-border rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Learning Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Proficiency Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLearningLevel(lvl)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    learningLevel === lvl
                      ? 'bg-brand-600/30 border-brand-500 text-brand-300 shadow-sm'
                      : 'bg-[#0E0E1B] border-surface-border text-surface-muted hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Focus Subjects & Chapters ({selectedSubjects.length})</span>
              <span className="text-[10px] text-surface-muted">Click to toggle or add custom below</span>
            </label>

            {presetSubjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {presetSubjects.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                          : 'bg-[#0E0E1B] text-slate-300 border-surface-border hover:border-brand-500/50'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{sub}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Custom subjects added */}
            {selectedSubjects.some((s) => !presetSubjects.includes(s)) && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {selectedSubjects
                  .filter((s) => !presetSubjects.includes(s))
                  .map((customSub) => (
                    <span
                      key={customSub}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-indigo-950/80 border border-indigo-700 text-indigo-300"
                    >
                      <span>✓ {customSub}</span>
                      <button
                        type="button"
                        onClick={() => toggleSubject(customSub)}
                        className="text-indigo-400 hover:text-white"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}

            {/* Add Custom Subject Input */}
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                placeholder="Add custom subject (e.g. Kannada, Sanskrit, French, IT)..."
                value={customSubjectInput}
                onChange={(e) => setCustomSubjectInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSubject();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-[#0E0E1B] border border-surface-border rounded-xl text-xs text-white placeholder-surface-muted/60 focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => handleAddCustomSubject()}
                disabled={!customSubjectInput.trim()}
                className="px-3 py-1.5 rounded-xl bg-[#0E0E1B] hover:bg-brand-950 border border-surface-border hover:border-brand-600 text-xs font-semibold text-brand-300 disabled:opacity-40 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Learning Goal */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Primary Academic & Learning Goal *
              </label>
              <span className="text-[10px] text-brand-400">✦ Powers AI Tutor prompts</span>
            </div>
            <textarea
              rows={2}
              required
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              placeholder="e.g. Score 90%+ in 2nd PUC board exams, crack CET rank under 1000, master Python..."
              className="w-full px-3.5 py-2 bg-[#0E0E1B] border border-surface-border rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          {/* Educational Purpose & Privacy Note */}
          <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 text-[11px] text-indigo-300/80 space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-200 font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>How StudyMind AI uses your profile</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              We personalize your Smart Notes, chapter syllabus tagging, quiz questions, and AI Tutor explanations to your target education level. Sensitive credentials like passwords or Google access tokens are never stored.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-surface-border/50">
            <button
              type="button"
              onClick={handleSkipWithDefaults}
              disabled={loading}
              className="text-xs text-surface-muted hover:text-brand-300 underline decoration-surface-border hover:decoration-brand-400 transition-all cursor-pointer"
            >
              Skip for now (use defaults)
            </button>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onComplete}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-surface-border text-xs text-surface-muted hover:text-white hover:border-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingPhoto}
                className="px-6 py-2.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile…</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
