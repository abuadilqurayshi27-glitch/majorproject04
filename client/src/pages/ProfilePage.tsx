import React, { useState, useRef } from 'react';
import {
  Mail,
  BookOpen,
  Target,
  Edit3,
  Camera,
  Loader2,
  Check,
  X,
  Sparkles,
  Award,
  GraduationCap,
  Layers,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { ProfileSetupModal } from '../components/auth/ProfileSetupModal.js';
import { uploadProfilePicture } from '../services/imageUploadService.js';

export const ProfilePage: React.FC = () => {
  const { user, profile, saveProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editSuccessAlert, setEditSuccessAlert] = useState(false);

  // Quick avatar change directly from the profile page (no modal required)
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image must be under 10 MB');
      return;
    }

    setUploadError(null);
    setUploadSuccess(false);
    setUploadingPhoto(true);

    try {
      const url = await uploadProfilePicture(user?.uid || profile?.uid || 'local_user', file);
      if (profile) {
        await saveProfile({ ...profile, photoURL: url });
      } else {
        await saveProfile({ photoURL: url });
      }
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEditComplete = () => {
    setIsEditOpen(false);
    setEditSuccessAlert(true);
    setTimeout(() => setEditSuccessAlert(false), 3500);
  };

  const currentPhoto =
    profile?.photoURL ||
    user?.photoURL ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

  const isProfileConfigured = Boolean(profile?.name || user?.displayName);
  const enrolledSubjects = profile?.subjects && profile.subjects.length > 0
    ? profile.subjects
    : ['Physics', 'Chemistry', 'Mathematics'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">

      {/* Success notification banner after editing */}
      {editSuccessAlert && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-lg shadow-emerald-950/50 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Profile updated successfully! Your AI Tutor and recommendations are now aligned with your syllabus.</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-600/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">

          {/* ── Avatar with click-to-upload ── */}
          <div className="relative group flex-shrink-0">
            <img
              src={currentPhoto}
              alt="Profile Avatar"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-brand-500 shadow-xl shadow-brand-500/20"
            />

            {/* Camera overlay on hover */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute inset-0 rounded-3xl bg-black/60 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Change profile picture"
            >
              {uploadingPhoto ? (
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              ) : (
                <>
                  <Camera className="w-7 h-7 text-white" />
                  <span className="text-[10px] text-white font-bold">Change Photo</span>
                </>
              )}
            </button>

            {/* Status badge */}
            {uploadSuccess && (
              <div className="absolute -bottom-2 -right-2 bg-emerald-600 rounded-full p-1 shadow-md">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            {uploadingPhoto && (
              <div className="absolute -bottom-2 -right-2 bg-brand-600 rounded-full p-1 shadow-md animate-pulse">
                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileChange}
          />

          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {profile?.name || user?.displayName || 'Student Learner'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-950/90 text-brand-300 border border-brand-700/60 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-400" />
                    <span>{isProfileConfigured ? 'Active Student' : 'Guest Student'}</span>
                  </span>
                </div>

                <p className="text-xs text-surface-muted flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="truncate">{profile?.email || user?.email || 'student@studymind.ai'}</span>
                </p>

                {/* Upload status messages */}
                {uploadError && (
                  <p className="text-xs text-red-400 flex items-center justify-center sm:justify-start gap-1 mt-1">
                    <X className="w-3 h-3" /> {uploadError}
                  </p>
                )}
                {uploadSuccess && (
                  <p className="text-xs text-emerald-400 flex items-center justify-center sm:justify-start gap-1 mt-1">
                    <Check className="w-3 h-3" /> Profile picture updated!
                  </p>
                )}
              </div>

              <button
                onClick={() => setIsEditOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-600/20"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Education / Stream / Course / Level / Age badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="px-3 py-1 rounded-full bg-brand-950/80 border border-brand-800 text-brand-300 text-xs font-semibold flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
                <span>{profile?.education || 'PUC'}</span>
              </span>

              {profile?.classLevel && (
                <span className="px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-sky-300 text-xs font-semibold">
                  {profile.education === 'PUC'
                    ? (profile.classLevel === '11' ? '1st PUC (11th)' : '2nd PUC (12th)')
                    : `Class ${profile.classLevel}th`}
                </span>
              )}

              {profile?.stream && (
                <span className="px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-300 text-xs font-semibold">
                  {profile.stream} Track
                </span>
              )}

              {profile?.boardExam && (
                <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-semibold flex items-center gap-1">
                  <span>🎯 {profile.boardExam}</span>
                </span>
              )}

              <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-semibold">
                {profile?.course || 'PUC Science'}
              </span>

              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold">
                {profile?.learningLevel || 'Beginner'} Level
              </span>

              {profile?.age && (
                <span className="px-3 py-1 rounded-full bg-[#0E0E1B] border border-surface-border text-surface-muted text-xs">
                  {profile.age} years old
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Learning Goal Card */}
        <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Target className="w-4 h-4" />
              <span>PRIMARY ACADEMIC & LEARNING GOAL</span>
            </div>
            <button
              onClick={() => setIsEditOpen(true)}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
            >
              Change
            </button>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-medium bg-[#0E0E1B] p-3.5 rounded-xl border border-surface-border/60">
            &ldquo;{profile?.learningGoal || 'Score 90%+ in board exams & crack CET / NEET / JEE.'}&rdquo;
          </p>
          <p className="text-[11px] text-surface-muted">
            The AI tutor customizes chapter explanations, derivations, and practice quizzes to help you achieve this target.
          </p>
        </div>

        {/* Subjects & Focus Areas */}
        <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
              <BookOpen className="w-4 h-4" />
              <span>ENROLLED FOCUS SUBJECTS ({enrolledSubjects.length})</span>
            </div>
            <button
              onClick={() => setIsEditOpen(true)}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
            >
              Add / Edit
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {enrolledSubjects.map((sub, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-[#0E0E1B] border border-brand-800/40 text-xs text-brand-300 font-semibold flex items-center gap-1.5"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>{sub}</span>
              </span>
            ))}
          </div>
          <p className="text-[11px] text-surface-muted pt-1">
            Videos matching these subjects receive automatic chapter tagging and board exam question breakdowns.
          </p>
        </div>
      </div>

      {/* How Profile Powers StudyMind AI */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-950/40 via-[#0B0D1B] to-[#0A0A14] border border-brand-800/40 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-300 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>How Your Profile Powers Your Learning</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-[#0E0E1B] border border-surface-border/60 space-y-1">
            <span className="text-xs font-bold text-white block">🎯 Custom Recommendations</span>
            <p className="text-[11px] text-surface-muted leading-relaxed">
              Curates YouTube lectures matching your board ({profile?.boardExam || 'State Board'}) and class syllabus.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0E0E1B] border border-surface-border/60 space-y-1">
            <span className="text-xs font-bold text-white block">🏷️ Chapter Tagging</span>
            <p className="text-[11px] text-surface-muted leading-relaxed">
              Tag any YouTube lecture to official NCERT / State Board chapter numbers and textbook topics.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0E0E1B] border border-surface-border/60 space-y-1">
            <span className="text-xs font-bold text-white block">🤖 Smart AI Tutor</span>
            <p className="text-[11px] text-surface-muted leading-relaxed">
              Answers doubts using terminology and marks weightage relevant to your grade and stream.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <ProfileSetupModal
          isOpen={isEditOpen}
          onComplete={handleEditComplete}
        />
      )}
    </div>
  );
};
