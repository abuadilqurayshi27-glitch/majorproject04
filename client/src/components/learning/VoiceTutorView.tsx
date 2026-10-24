import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  Square,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ApiService } from '../../services/apiService.js';
import { VoiceState } from '../../types/tutor.js';

export const VoiceTutorView: React.FC = () => {
  const { currentVideo, smartNotes } = usePlayer();
  const { user, profile } = useAuth();

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcriptText, setTranscriptText] = useState('');
  const [tutorReply, setTutorReply] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      stopAll();
    };
  }, []);

  const stopAll = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch (e) {}
    }
    setVoiceState('idle');
  };

  const startListening = () => {
    setErrorMsg(null);
    stopAll();

    // Check Speech Recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setVoiceState('listening');
        setTranscriptText('');
      };

      recognition.onresult = (event: any) => {
        const speech = event.results[0][0].transcript;
        setTranscriptText(speech);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setErrorMsg(`Microphone error: ${event.error}`);
        }
        setVoiceState('idle');
      };

      recognition.onend = async () => {
        // Finished listening, process if text gathered
        const capturedText = transcriptText;
        if (capturedText && capturedText.trim().length > 1) {
          await processUserSpeech(capturedText.trim());
        } else {
          setVoiceState('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setErrorMsg('Could not access microphone. Please grant permission.');
      setVoiceState('idle');
    }
  };

  const processUserSpeech = async (speech: string) => {
    setVoiceState('thinking');
    try {
      const response = await ApiService.sendVoiceSpeech({
        userSpeech: speech,
        videoTitle: currentVideo?.title || 'Educational Video',
        notes: smartNotes || undefined,
        studentName: profile?.name || user?.displayName || 'Student',
      });

      setTutorReply(response.reply);
      speakResponse(response.reply);
    } catch (err: any) {
      setErrorMsg('Failed to generate voice response. Please try again.');
      setVoiceState('idle');
    }
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current) {
      setVoiceState('idle');
      return;
    }

    try {
      synthRef.current.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick natural sounding voice if available
      const voices = synthRef.current.getVoices();
      const preferred = voices.find(
        (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')) && v.lang.startsWith('en')
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => {
        setVoiceState('speaking');
      };

      utterance.onend = () => {
        setVoiceState('idle');
      };

      utterance.onerror = () => {
        setVoiceState('idle');
      };

      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
      setVoiceState('idle');
    }
  };

  const handleInterrupt = () => {
    stopAll();
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-10 rounded-3xl bg-surface-card border border-surface-border text-center space-y-6 shadow-2xl max-w-2xl mx-auto">
      {/* Brand Voice Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-950/70 border border-brand-800 text-brand-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Interactive Voice Tutor</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">
          Talk Directly with StudyMind AI
        </h3>
        <p className="text-xs text-surface-muted max-w-sm mx-auto">
          Speak naturally into your microphone. Your AI tutor will answer questions and explain concepts aloud.
        </p>
      </div>

      {/* Voice State Visualizer Container */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Pulsing rings based on state */}
        {voiceState === 'listening' && (
          <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
        )}
        {voiceState === 'speaking' && (
          <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-pulse" />
        )}
        {voiceState === 'thinking' && (
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-brand-400/40 animate-spin" />
        )}

        {/* Central Orb Button */}
        <button
          type="button"
          onClick={voiceState === 'listening' || voiceState === 'speaking' ? handleInterrupt : startListening}
          className={`relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 ${
            voiceState === 'listening'
              ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-rose-500/50 scale-105'
              : voiceState === 'speaking'
              ? 'bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-500 text-white shadow-brand-500/50 scale-105'
              : voiceState === 'thinking'
              ? 'bg-[#181830] text-brand-300 border-2 border-brand-500'
              : 'bg-gradient-to-tr from-brand-700 via-indigo-600 to-purple-600 text-white hover:scale-105 shadow-brand-600/40'
          }`}
        >
          {voiceState === 'listening' ? (
            <>
              <div className="flex items-center gap-1 mb-2">
                <span className="w-1.5 h-6 bg-white rounded-full animate-wave-1" />
                <span className="w-1.5 h-8 bg-white rounded-full animate-wave-2" />
                <span className="w-1.5 h-5 bg-white rounded-full animate-wave-3" />
                <span className="w-1.5 h-7 bg-white rounded-full animate-wave-4" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider">Listening...</span>
            </>
          ) : voiceState === 'speaking' ? (
            <>
              <Volume2 className="w-8 h-8 mb-1 animate-bounce" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Speaking</span>
            </>
          ) : voiceState === 'thinking' ? (
            <>
              <Bot className="w-8 h-8 mb-1 animate-pulse text-brand-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Thinking...</span>
            </>
          ) : (
            <>
              <Mic className="w-8 h-8 mb-1" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Tap to Speak</span>
            </>
          )}
        </button>
      </div>

      {/* State Status Banner */}
      <div className="text-xs font-semibold">
        {voiceState === 'listening' && (
          <span className="text-rose-400">Microphone active — Ask your question now...</span>
        )}
        {voiceState === 'thinking' && (
          <span className="text-brand-300">Synthesizing personalized educational response...</span>
        )}
        {voiceState === 'speaking' && (
          <span className="text-emerald-400">Speaking aloud...</span>
        )}
        {voiceState === 'idle' && (
          <span className="text-surface-muted">Ready. Tap the microphone to begin.</span>
        )}
      </div>

      {/* Spoken Text Display */}
      {transcriptText && (
        <div className="p-3.5 rounded-2xl bg-[#0E0E1B] border border-surface-border text-left w-full space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-surface-muted">
            You Asked:
          </span>
          <p className="text-xs text-slate-200 italic">"{transcriptText}"</p>
        </div>
      )}

      {/* Tutor Response Box */}
      {tutorReply && (
        <div className="p-4 rounded-2xl bg-brand-950/40 border border-brand-800/40 text-left w-full space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" />
              <span>Voice Tutor Response:</span>
            </span>
            {voiceState === 'speaking' && (
              <button
                onClick={handleInterrupt}
                className="px-2 py-0.5 rounded bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-[10px] font-bold flex items-center gap-1 border border-rose-500/40"
              >
                <Square className="w-2.5 h-2.5 fill-current" />
                <span>Stop Audio</span>
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-normal">
            {tutorReply}
          </p>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
