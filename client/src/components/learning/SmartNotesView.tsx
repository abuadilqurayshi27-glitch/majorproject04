import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import {
  Play,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Award,
  Layers,
  Flame,
  Globe,
  Tag,
  Sigma,
  FileText,
  Download,
  Check,
  Code2,
  Terminal,
  RotateCcw,
  Copy,
  Calculator,
  Cpu,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  Table,
  Binary,
  Languages,
  MessageSquare,
  Volume2,
  Atom,
  FlaskConical,
  Scale,
  ShieldCheck,
  CheckSquare,
  Activity,
  FileSpreadsheet,
  Info,
  CornerDownRight,
  TrendingUp,
  Target,
  GraduationCap,
  ExternalLink,
  Edit3,
  X,
  Save,
  Zap,
} from 'lucide-react';
import {
  SmartNotes,
  SmartNoteTopic,
  SmartNotesCorrection,
  QuizQuestion,
  CodeSnippet,
  MathSolution,
  QuestionAnswer,
  LanguageLessonModule,
  MathDerivation,
  MathCoordinateData,
  PhysicsExperiment,
  PhysicsLaw,
  PhysicsQuantity,
  FormulaItem,
  FinancialJournalEntry,
  LedgerAccount,
  BusinessCaseStudy,
  HistoricalTimeline,
  IdeologicalDebate,
  LandmarkCasePrecedent,
  StatutorySection,
  ClinicalScenario,
  DrugClassification,
  SmartNotesMode,
  SmartNotesLength,
  LectureModule,
} from '../../types/learning.js';
import { usePlayer } from '../../context/PlayerContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ConceptDiagram } from './ConceptDiagram.js';
import { PdfExportService } from '../../services/pdfExportService.js';
import { FirestoreService } from '../../services/firestoreService.js';

interface SmartNotesViewProps {
  notes: SmartNotes;
  quizQuestions?: QuizQuestion[];
}

// Canonical algorithm templates
const CODE_TEMPLATES = {
  fibonacci: {
    label: 'Fibonacci',
    code: `// Fibonacci Sequence (Iterative O(n))\nfunction fibonacci(n) {\n  if (n <= 0) return 0;\n  if (n === 1) return 1;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    const next = a + b;\n    a = b;\n    b = next;\n  }\n  return b;\n}\n\nconsole.log("Fibonacci(0):", fibonacci(0));\nconsole.log("Fibonacci(5):", fibonacci(5));\nconsole.log("Fibonacci(10):", fibonacci(10));`,
  },
  palindrome: {
    label: 'Palindrome',
    code: `// Palindrome String Validator\nfunction isPalindrome(str) {\n  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');\n  let left = 0, right = clean.length - 1;\n  while (left < right) {\n    if (clean[left] !== clean[right]) return false;\n    left++;\n    right--;\n  }\n  return true;\n}\n\nconsole.log("'racecar':", isPalindrome("racecar"));\nconsole.log("'A man, a plan, a canal: Panama':", isPalindrome("A man, a plan, a canal: Panama"));\nconsole.log("'studymind':", isPalindrome("studymind"));`,
  },
  factorial: {
    label: 'Factorial',
    code: `// Factorial with recursion & boundary checking\nfunction factorial(n) {\n  if (n < 0) throw new Error("Factorial undefined for negative numbers");\n  if (n === 0 || n === 1) return 1;\n  let result = 1;\n  for (let i = 2; i <= n; i++) {\n    result *= i;\n  }\n  return result;\n}\n\nconsole.log("0! =", factorial(0));\nconsole.log("5! =", factorial(5));\nconsole.log("7! =", factorial(7));`,
  },
  sorting: {
    label: 'Bubble Sort',
    code: `// Bubble Sort Algorithm\nfunction bubbleSort(arr) {\n  const a = [...arr];\n  const n = a.length;\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (a[j] > a[j + 1]) {\n        [a[j], a[j + 1]] = [a[j + 1], a[j]];\n      }\n    }\n  }\n  return a;\n}\n\nconst sample = [64, 34, 25, 12, 22, 11, 90];\nconsole.log("Original:", sample);\nconsole.log("Sorted:  ", bubbleSort(sample));`,
  },
  loops: {
    label: 'Loops & Map',
    code: `// Functional array processing & filtering\nconst data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\nconst evensDoubled = data\n  .filter(n => n % 2 === 0)\n  .map(n => n * 2);\n\nconsole.log("Original numbers:", data);\nconsole.log("Evens doubled:   ", evensDoubled);`,
  },
};

interface ConciseContentProps {
  text: string;
  thresholdChars?: number;
  className?: string;
}

/**
 * When generated content is very long, extracts and displays key points as short sentences
 * without changing, rewriting, summarizing, or removing the original content.
 * Preserves all technical terms, formulas, code, definitions, facts, and exact meaning.
 */
export const ConciseContent: React.FC<ConciseContentProps> = ({
  text,
  thresholdChars = 220,
  className = '',
}) => {
  const [showFull, setShowFull] = useState(false);

  if (!text || !text.trim()) return null;

  // Split into natural sentences preserving original punctuation, terms, and words verbatim
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const isLong = text.length > thresholdChars || sentences.length > 2;

  if (!isLong) {
    return (
      <p className={`text-xs sm:text-sm text-slate-200 leading-relaxed font-normal ${className}`}>
        {text}
      </p>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showFull ? (
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            {text}
          </p>
          <button
            type="button"
            onClick={() => setShowFull(false)}
            className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 underline underline-offset-2 flex items-center gap-1 transition-colors"
          >
            Show Key Points Only
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
            {sentences.map((sentence, sIdx) => (
              <li key={sIdx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0 mt-1.5" />
                <span>{sentence}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setShowFull(true)}
            className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 underline underline-offset-2 flex items-center gap-1 transition-colors pt-0.5"
          >
            View Full Original Content
          </button>
        </div>
      )}
    </div>
  );
};

interface LanguageLessonCardProps {
  lesson: LanguageLessonModule;
  title?: string;
}

export const LanguageLessonCard: React.FC<LanguageLessonCardProps> = ({ lesson, title }) => {
  const [revealedExercise, setRevealedExercise] = useState<Record<number, boolean>>({});

  const toggleExercise = (idx: number) => {
    setRevealedExercise((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#0F0C1B] border border-rose-900/50 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-950/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-400 shrink-0">
            <Languages className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
              <span>{title || `${lesson.targetLanguage} Language Laboratory`}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-950 text-rose-300 border border-rose-800/60">
                {lesson.proficiencyLevel || 'Foundations'}
              </span>
            </h4>
            <p className="text-[11px] text-surface-muted">
              Target Language: <strong className="text-rose-300">{lesson.targetLanguage}</strong>
              {lesson.nativeOrInstructionLanguage ? ` • Instruction: ${lesson.nativeOrInstructionLanguage}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Vocabulary Bank */}
      {lesson.vocabulary && lesson.vocabulary.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Vocabulary & Key Phrases ({lesson.vocabulary.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {lesson.vocabulary.map((vocab, vIdx) => (
              <div
                key={vIdx}
                className="p-3 rounded-xl bg-surface-card border border-surface-border hover:border-rose-800/60 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-rose-200">{vocab.word}</span>
                  {vocab.partOfSpeech && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-surface-muted border border-surface-border">
                      {vocab.partOfSpeech}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-200">
                  <span className="text-surface-muted font-medium">Meaning: </span>
                  <strong className="text-white">{vocab.meaning}</strong>
                </div>
                {vocab.pronunciation && (
                  <div className="text-[11px] text-amber-300 flex items-center gap-1 font-mono">
                    <Volume2 className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>/{vocab.pronunciation}/</span>
                  </div>
                )}
                {vocab.exampleSentence && (
                  <div className="text-[11px] text-slate-400 italic bg-[#0E0E1B] p-2 rounded-lg border border-surface-border/50">
                    &ldquo;{vocab.exampleSentence}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grammar Rules */}
      {lesson.grammarRules && lesson.grammarRules.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-rose-950/40">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5" />
            <span>Grammar Rules & Syntactic Patterns</span>
          </div>
          <div className="space-y-2.5">
            {lesson.grammarRules.map((rule, rIdx) => (
              <div
                key={rIdx}
                className="p-3.5 rounded-xl bg-surface-card border border-amber-900/30 space-y-2"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h5 className="text-xs font-bold text-amber-200">{rule.ruleName}</h5>
                  {rule.formulaOrPattern && (
                    <code className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
                      {rule.formulaOrPattern}
                    </code>
                  )}
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{rule.explanation}</p>
                {rule.examples && rule.examples.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-[#0E0E1B] border border-surface-border text-xs space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 block uppercase">
                      Examples from Lecture:
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {rule.examples.map((ex, exIdx) => (
                        <li key={exIdx} className="flex items-start gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {rule.exceptions && rule.exceptions.length > 0 && (
                  <div className="text-[11px] text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>Exceptions: {rule.exceptions.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sentence Patterns */}
      {lesson.sentenceStructures && lesson.sentenceStructures.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-rose-950/40">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300 uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Sentence Patterns & Construction</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {lesson.sentenceStructures.map((pattern, pIdx) => (
              <div
                key={pIdx}
                className="p-3 rounded-xl bg-surface-card border border-sky-900/30 space-y-1.5"
              >
                <div className="text-xs font-mono font-bold text-sky-300 bg-sky-950/50 p-1.5 rounded border border-sky-800/40">
                  {pattern.pattern}
                </div>
                <p className="text-xs text-slate-300">{pattern.meaning}</p>
                {pattern.examples && pattern.examples.length > 0 && (
                  <ul className="text-[11px] text-slate-400 space-y-0.5 list-disc list-inside">
                    {pattern.examples.map((ex, eIdx) => (
                      <li key={eIdx}>{ex}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pronunciation Guidance */}
      {lesson.pronunciationTips && lesson.pronunciationTips.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Pronunciation Guidance</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
            {lesson.pronunciationTips.map((tip, tIdx) => (
              <li key={tIdx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive Exercises */}
      {lesson.exercises && lesson.exercises.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-rose-950/40">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Practice Exercises ({lesson.exercises.length})</span>
          </div>
          <div className="space-y-2">
            {lesson.exercises.map((ex, eIdx) => {
              const isRevealed = !!revealedExercise[eIdx];
              return (
                <div
                  key={eIdx}
                  className="p-3 rounded-xl bg-surface-card border border-surface-border space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-white">{ex.question}</p>
                    <button
                      type="button"
                      onClick={() => toggleExercise(eIdx)}
                      className="px-2.5 py-1 rounded bg-surface-elevated hover:bg-surface-elevatedHover text-[10px] font-bold text-emerald-300 border border-emerald-800/40 shrink-0 transition-colors"
                    >
                      {isRevealed ? 'Hide Answer' : 'Check Answer'}
                    </button>
                  </div>
                  {ex.hint && !isRevealed && (
                    <p className="text-[11px] text-amber-300/80 italic">💡 Hint: {ex.hint}</p>
                  )}
                  {isRevealed && (
                    <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-200">
                      <strong>Solution: </strong>
                      <span>{ex.answer}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface KaTeXFormulaProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const KaTeXFormula: React.FC<KaTeXFormulaProps> = ({ math, block = false, className = '' }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current && math) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: block,
          throwOnError: false,
        });
      } catch (err) {
        if (containerRef.current) {
          containerRef.current.innerText = math;
        }
      }
    }
  }, [math, block]);

  return <span ref={containerRef} className={`inline-block ${block ? 'w-full my-1' : ''} ${className}`} />;
};

interface VariableSymbolDictionaryProps {
  variables?: Array<{ symbol: string; meaning: string; unit?: string }>;
  accentColor?: 'amber' | 'emerald' | 'cyan' | 'purple';
}

export const VariableSymbolDictionary: React.FC<VariableSymbolDictionaryProps> = ({
  variables,
  accentColor = 'amber',
}) => {
  if (!variables || variables.length === 0) return null;

  const colorStyles = {
    amber: 'bg-amber-950/70 border-amber-800/60 text-amber-300',
    emerald: 'bg-emerald-950/70 border-emerald-800/60 text-emerald-300',
    cyan: 'bg-cyan-950/70 border-cyan-800/60 text-cyan-300',
    purple: 'bg-purple-950/70 border-purple-800/60 text-purple-300',
  }[accentColor];

  return (
    <div className="pt-2 border-t border-surface-border/50 space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
        <Info className="w-3 h-3 text-slate-400" />
        <span>Variable & Symbol Dictionary:</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {variables.map((v, idx) => (
          <div
            key={idx}
            className="p-2 rounded-lg bg-[#080811] border border-surface-border/60 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold border shrink-0 ${colorStyles}`}>
                <KaTeXFormula math={v.symbol} />
              </span>
              <span className="text-slate-300 text-[11px] truncate" title={v.meaning}>
                {v.meaning}
              </span>
            </div>
            {v.unit && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-slate-400 border border-surface-border shrink-0 font-mono">
                {v.unit}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface MathDerivationCardProps {
  derivation: MathDerivation;
}

export const MathDerivationCard: React.FC<MathDerivationCardProps> = ({ derivation }) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-[#0B0D1B] to-[#0A0A14] border border-indigo-700/50 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-900/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-700 text-indigo-300 shrink-0">
            <Sigma className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
              <span>{derivation.title || 'Step-by-Step Derivation Sequence'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">
                Derivation
              </span>
            </h4>
            <p className="text-[11px] text-surface-muted">
              Rigorous mathematical derivation following the lecture sequence
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-black/40 border border-indigo-900/40 space-y-1">
          <span className="text-[10px] uppercase font-bold text-indigo-300 block">
            Starting Formula / Initial Condition:
          </span>
          <div className="font-mono text-xs text-white overflow-x-auto py-1">
            <KaTeXFormula math={derivation.startingFormula} block />
          </div>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-emerald-900/40 space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-300 block">
            Target / Final Result:
          </span>
          <div className="font-mono text-xs text-emerald-200 overflow-x-auto py-1">
            <KaTeXFormula math={derivation.targetFormula} block />
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <CornerDownRight className="w-3.5 h-3.5 text-indigo-400" />
          <span>Derivation Progression:</span>
        </span>
        <div className="space-y-2">
          {derivation.steps.map((st) => (
            <div
              key={st.stepNumber}
              className="p-3 rounded-xl bg-[#070914] border border-indigo-950/80 hover:border-indigo-800/60 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2 border-b border-indigo-950/60 pb-1.5">
                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold text-[10px] border border-indigo-800">
                  Step {st.stepNumber}
                </span>
                <span className="text-[11px] text-slate-400 italic">
                  {st.justification}
                </span>
              </div>
              <div className="font-mono text-xs text-indigo-100 overflow-x-auto py-1">
                <KaTeXFormula math={st.expression} block />
              </div>
              {st.annotation && (
                <p className="text-[11px] text-surface-muted pl-1">
                  Note: {st.annotation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {derivation.conclusion && (
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <strong className="text-white">Conclusion: </strong>
            {derivation.conclusion}
          </span>
        </div>
      )}
    </div>
  );
};

interface MathCoordinateCardProps {
  coordinateData: MathCoordinateData;
}

export const MathCoordinateCard: React.FC<MathCoordinateCardProps> = ({ coordinateData }) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#090C16] border border-cyan-800/50 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-950 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-300 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
              <span>{coordinateData.title || 'Tabular Coordinate Representation'}</span>
              {coordinateData.relationshipType && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {coordinateData.relationshipType}
                </span>
              )}
            </h4>
            {coordinateData.expressionOrRelation && (
              <div className="text-xs font-mono text-cyan-200 mt-0.5">
                <KaTeXFormula math={coordinateData.expressionOrRelation} />
              </div>
            )}
          </div>
        </div>

        {(coordinateData.domain || coordinateData.range) && (
          <div className="flex items-center gap-2 text-[10px] shrink-0 flex-wrap">
            {coordinateData.domain && (
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                Domain: <strong className="text-white">{coordinateData.domain}</strong>
              </span>
            )}
            {coordinateData.range && (
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                Range: <strong className="text-white">{coordinateData.range}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {coordinateData.coordinatePoints && coordinateData.coordinatePoints.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-300">Key Coordinate Points (x, y):</span>
          <div className="flex flex-wrap gap-2">
            {coordinateData.coordinatePoints.map((pt, pIdx) => (
              <div
                key={pIdx}
                className="px-2.5 py-1 rounded-lg bg-black/40 border border-cyan-900/60 text-xs flex items-center gap-1.5"
              >
                <span className="font-mono text-cyan-300 font-bold">
                  ({pt.x}, {pt.y})
                </span>
                {pt.label && <span className="text-slate-400 text-[10px]">[{pt.label}]</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {coordinateData.tableHeaders && coordinateData.tableRows && coordinateData.tableRows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-cyan-950 bg-black/30">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-cyan-950/50 text-cyan-300 font-semibold border-b border-cyan-900/60">
              <tr>
                {coordinateData.tableHeaders.map((header, hIdx) => (
                  <th key={hIdx} className="p-2.5 sm:px-3 sm:py-2">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-950/40">
              {coordinateData.tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-cyan-950/20 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2.5 sm:px-3 sm:py-2 font-mono text-[11px] sm:text-xs">
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {coordinateData.keyObservations && coordinateData.keyObservations.length > 0 && (
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-1 text-xs">
          <span className="text-[11px] font-bold text-cyan-300 block">Graphical Observations:</span>
          <ul className="space-y-1 text-slate-200 pl-1">
            {coordinateData.keyObservations.map((obs, oIdx) => (
              <li key={oIdx} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface PhysicsExperimentCardProps {
  experiment: PhysicsExperiment;
}

export const PhysicsExperimentCard: React.FC<PhysicsExperimentCardProps> = ({ experiment }) => {
  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-950/30 via-[#0E0C15] to-[#0A0912] border border-amber-600/50 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-950 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-950 border border-amber-700 text-amber-300 shrink-0">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
              <span>{experiment.title || 'Physics Practical / Laboratory Experiment'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
                Practical / Experiment
              </span>
            </h4>
            {experiment.aimOrObjective && (
              <p className="text-xs text-amber-200/90 mt-0.5">
                <strong className="text-amber-400 font-semibold">Aim: </strong>
                {experiment.aimOrObjective}
              </p>
            )}
          </div>
        </div>
      </div>

      {experiment.principleOrLaw && (
        <div className="p-3 rounded-xl bg-black/40 border border-amber-900/60 space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
            <Atom className="w-3.5 h-3.5 text-amber-400" />
            <span>Governing Principle / Theoretical Law:</span>
          </span>
          <p className="text-xs text-slate-200 leading-relaxed pl-1">
            {experiment.principleOrLaw}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {experiment.apparatus && experiment.apparatus.length > 0 && (
          <div className="p-3.5 rounded-xl bg-[#080811] border border-surface-border/60 space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Apparatus & Instruments:</span>
            </span>
            <ul className="text-xs text-slate-300 space-y-1 pl-1">
              {experiment.apparatus.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {experiment.precautions && experiment.precautions.length > 0 && (
          <div className="p-3.5 rounded-xl bg-[#080811] border border-surface-border/60 space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Experimental Precautions:</span>
            </span>
            <ul className="text-xs text-slate-300 space-y-1 pl-1">
              {experiment.precautions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {experiment.procedure && experiment.procedure.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300">
            Step-by-Step Experimental Procedure:
          </span>
          <div className="space-y-1.5">
            {experiment.procedure.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-300 bg-[#080811] p-2.5 rounded-lg border border-surface-border/50"
              >
                <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step.replace(/^\d+[\.\)]\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {experiment.observations && experiment.observations.length > 0 && (
        <div className="p-3.5 rounded-xl bg-[#080811] border border-surface-border/60 space-y-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Measured Parameters & Calibration:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {experiment.observations.map((obs, idx) => (
              <div
                key={idx}
                className="p-2 rounded bg-black/40 border border-surface-border text-xs space-y-0.5"
              >
                <span className="text-slate-400 text-[11px] block">{obs.observation}</span>
                <span className="font-mono text-amber-300 font-bold">
                  {obs.value ? `${obs.value} ${obs.unit || ''}` : obs.unit || 'Measured'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {experiment.measurementTable && experiment.measurementTable.headers && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            <span>Observation & Measurement Table:</span>
          </span>
          <div className="overflow-x-auto rounded-xl border border-amber-950 bg-black/30">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-amber-950/60 text-amber-300 font-semibold border-b border-amber-900/60">
                <tr>
                  {experiment.measurementTable.headers.map((h, idx) => (
                    <th key={idx} className="p-2.5 sm:px-3 sm:py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-950/40">
                {experiment.measurementTable.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-amber-950/20 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 sm:px-3 sm:py-2 font-mono text-[11px] sm:text-xs">
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {experiment.calculationSteps && experiment.calculationSteps.length > 0 && (
        <div className="p-3.5 rounded-xl bg-black/40 border border-amber-900/50 space-y-2.5">
          <span className="text-xs font-bold text-amber-300 block">
            Calculations & Numerical Evaluation:
          </span>
          <div className="space-y-2">
            {experiment.calculationSteps.map((calc, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#080811] border border-surface-border text-xs space-y-1">
                <span className="font-semibold text-white block">{calc.step}</span>
                {calc.formula && (
                  <div className="font-mono text-[11px] text-amber-300">
                    <KaTeXFormula math={calc.formula} />
                  </div>
                )}
                {calc.substitution && (
                  <div className="font-mono text-[11px] text-slate-300">
                    <span className="text-slate-400">Substitution: </span>
                    <KaTeXFormula math={calc.substitution} />
                  </div>
                )}
                {calc.result && (
                  <div className="font-mono text-xs font-bold text-emerald-400 pt-0.5">
                    Result: {calc.result} {calc.unit || ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {experiment.result && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-700/50 text-xs text-emerald-200 space-y-1">
          <span className="font-bold text-emerald-300 uppercase tracking-wider text-[10px] block">
            Final Experimental Result:
          </span>
          <p className="text-white text-xs leading-relaxed font-medium">
            {experiment.result}
          </p>
        </div>
      )}

      {experiment.sourcesOfError && experiment.sourcesOfError.length > 0 && (
        <div className="text-[11px] text-surface-muted space-y-1 pl-1">
          <strong className="text-slate-400">Sources of Error: </strong>
          <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
            {experiment.sourcesOfError.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface PhysicsLawsCardProps {
  laws: PhysicsLaw[];
}

export const PhysicsLawsCard: React.FC<PhysicsLawsCardProps> = ({ laws }) => {
  if (!laws || laws.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-[#090D18] border border-blue-800/40 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
        <Scale className="w-4 h-4 text-blue-400" />
        <span>Governing Laws & Scientific Principles ({laws.length}):</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {laws.map((law, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-black/40 border border-blue-900/50 space-y-2"
          >
            <div className="flex items-center justify-between gap-2 border-b border-blue-950 pb-1.5">
              <span className="font-bold text-white text-xs">{law.name}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              "{law.statement}"
            </p>
            {law.mathematicalForm && (
              <div className="p-2 rounded bg-blue-950/40 border border-blue-800/40 font-mono text-xs text-blue-200">
                <KaTeXFormula math={law.mathematicalForm} />
              </div>
            )}
            {law.conditionsOrLimitations && law.conditionsOrLimitations.length > 0 && (
              <div className="text-[10px] text-slate-400 space-y-0.5 pt-1 border-t border-surface-border/40">
                <span className="font-semibold text-blue-300 uppercase">Conditions / Limitations:</span>
                <ul className="list-disc pl-3 space-y-0.5">
                  {law.conditionsOrLimitations.map((cond, cIdx) => (
                    <li key={cIdx}>{cond}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface PhysicsQuantitiesTableProps {
  quantities: PhysicsQuantity[];
}

export const PhysicsQuantitiesTable: React.FC<PhysicsQuantitiesTableProps> = ({ quantities }) => {
  if (!quantities || quantities.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-[#080B14] border border-cyan-900/40 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
        <Atom className="w-4 h-4 text-cyan-400" />
        <span>Physical Quantities & SI Units ({quantities.length}):</span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-cyan-950 bg-black/30">
        <table className="w-full text-left text-xs text-slate-200">
          <thead className="bg-cyan-950/60 text-cyan-300 font-semibold border-b border-cyan-900/60">
            <tr>
              <th className="p-2.5">Physical Quantity</th>
              <th className="p-2.5">Symbol</th>
              <th className="p-2.5">SI Unit</th>
              <th className="p-2.5">Dimensions</th>
              <th className="p-2.5">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-950/40">
            {quantities.map((q, idx) => (
              <tr key={idx} className="hover:bg-cyan-950/20 transition-colors">
                <td className="p-2.5 font-bold text-white text-xs">{q.quantity}</td>
                <td className="p-2.5 font-mono text-cyan-300 text-xs">
                  <KaTeXFormula math={q.symbol} />
                </td>
                <td className="p-2.5 font-mono text-slate-300 text-[11px]">{q.siUnit}</td>
                <td className="p-2.5 font-mono text-slate-400 text-[10px]">{q.dimensions || '—'}</td>
                <td className="p-2.5 text-slate-300 text-[11px] leading-relaxed">{q.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface PhysicsOverviewCardProps {
  overview: {
    laws?: PhysicsLaw[];
    quantities?: PhysicsQuantity[];
  };
}

export const PhysicsOverviewCard: React.FC<PhysicsOverviewCardProps> = ({ overview }) => {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 via-[#0B0F1C] to-[#0A0D18] border border-blue-700/60 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-blue-900/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-950 border border-blue-700 text-blue-300">
            <Atom className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Physics Master Laboratory & Governing Principles</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-blue-950 text-blue-300 border border-blue-800">
                Physics Overview
              </span>
            </h4>
            <p className="text-[11px] text-surface-muted">
              Consolidated laws, formulas, and physical quantities verified from the lecture
            </p>
          </div>
        </div>
      </div>

      {overview.laws && overview.laws.length > 0 && (
        <PhysicsLawsCard laws={overview.laws} />
      )}

      {overview.quantities && overview.quantities.length > 0 && (
        <PhysicsQuantitiesTable quantities={overview.quantities} />
      )}
    </div>
  );
};

// ── Stream-Specific Learning Cards ──────────────────────────────────────────

interface CommerceJournalCardProps {
  entries?: FinancialJournalEntry[];
  ledgerAccounts?: LedgerAccount[];
  businessCase?: BusinessCaseStudy;
}

export const CommerceJournalCard: React.FC<CommerceJournalCardProps> = ({
  entries,
  businessCase,
}) => {
  if ((!entries || entries.length === 0) && !businessCase) {
    return null;
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#0A120E] to-[#080E0B] border border-emerald-700/50 shadow-lg space-y-4">
      <div className="flex items-center gap-2.5 border-b border-emerald-900/60 pb-3">
        <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 shrink-0">
          <Table className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
            <span>Financial Accounting & Business Analysis</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
              Commerce
            </span>
          </h4>
          <p className="text-[11px] text-surface-muted">
            Double-entry transactions, ledger postings, and strategic business synthesis
          </p>
        </div>
      </div>

      {/* Journal Entries */}
      {entries && entries.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>General Journal Book (Dr / Cr Entries):</span>
          </span>
          <div className="overflow-x-auto rounded-xl border border-emerald-900/60 bg-black/40">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-emerald-950/70 text-emerald-300 font-semibold border-b border-emerald-900">
                <tr>
                  <th className="p-2.5">Date/Ref</th>
                  <th className="p-2.5">Particulars & Description</th>
                  <th className="p-2.5 text-right">Debit ($)</th>
                  <th className="p-2.5 text-right">Credit ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/40 font-mono text-[11px]">
                {entries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-emerald-950/20 transition-colors">
                    <td className="p-2.5 text-slate-400">{entry.dateOrRef || `TX-${idx + 1}`}</td>
                    <td className="p-2.5">
                      <div className="text-white font-sans font-bold">{entry.debitAccount} ... Dr</div>
                      <div className="text-slate-300 pl-4 font-sans">To {entry.creditAccount}</div>
                      <div className="text-[10px] text-slate-400 italic font-sans mt-0.5 pl-2">
                        ({entry.narration || entry.transaction})
                      </div>
                    </td>
                    <td className="p-2.5 text-right font-bold text-emerald-400">{String(entry.debitAmount)}</td>
                    <td className="p-2.5 text-right font-bold text-slate-300">{String(entry.creditAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Business Case Study */}
      {businessCase && (
        <div className="p-3.5 rounded-xl bg-black/30 border border-emerald-900/40 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h5 className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Business Case: {businessCase.companyOrScenario}</span>
            </h5>
            {businessCase.analysisFramework && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                {businessCase.analysisFramework}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#050A07] border border-surface-border/50">
              <strong className="text-rose-300 block mb-1">Business Problem / Bottleneck:</strong>
              <p className="text-slate-300">{businessCase.businessProblem}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#050A07] border border-surface-border/50">
              <strong className="text-emerald-300 block mb-1">Strategic Solution:</strong>
              <p className="text-slate-300">{businessCase.strategicSolution}</p>
            </div>
          </div>
          {businessCase.financialOrMarketImpact && (
            <p className="text-[11px] text-slate-400 italic">
              <strong>Market Impact: </strong>{businessCase.financialOrMarketImpact}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

interface HumanitiesTimelineCardProps {
  timeline?: HistoricalTimeline;
  debate?: IdeologicalDebate;
}

export const HumanitiesTimelineCard: React.FC<HumanitiesTimelineCardProps> = ({ timeline, debate }) => {
  if (!timeline && !debate) return null;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-[#120E08] to-[#0A0805] border border-amber-700/50 shadow-lg space-y-4">
      <div className="flex items-center gap-2.5 border-b border-amber-900/60 pb-3">
        <div className="p-2 rounded-xl bg-amber-950 border border-amber-700 text-amber-300 shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
            <span>Historical Chronology & Socio-Political Analysis</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
              Humanities
            </span>
          </h4>
          <p className="text-[11px] text-surface-muted">
            Chronological progression of events, causes, consequences, and philosophical debates
          </p>
        </div>
      </div>

      {timeline && timeline.events && timeline.events.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <span>{timeline.title || 'Chronological Event Sequence'}</span>
            {timeline.eraOrPeriod && <span className="text-[10px] text-slate-400">({timeline.eraOrPeriod})</span>}
          </h5>
          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-800/60">
            {timeline.events.map((ev, eIdx) => (
              <div key={eIdx} className="relative space-y-1">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-[#120E08]" />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    {ev.yearOrDate}
                  </span>
                  <span className="text-xs font-bold text-white">{ev.title}</span>
                  {ev.location && <span className="text-[10px] text-slate-400">📍 {ev.location}</span>}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{ev.eventSummary}</p>
                {ev.keyFigures && ev.keyFigures.length > 0 && (
                  <p className="text-[11px] text-amber-200/90">
                    <strong>Key Figures: </strong>{ev.keyFigures.join(', ')}
                  </p>
                )}
                {ev.historicalSignificance && (
                  <p className="text-[11px] text-slate-400 italic">
                    <strong>Historical Legacy: </strong>{ev.historicalSignificance}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {debate && (
        <div className="p-3.5 rounded-xl bg-black/40 border border-amber-900/40 space-y-2">
          <span className="text-xs font-bold text-amber-300 block">
            Ideological Debate: {debate.conceptOrIssue}
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-[#0C0A05] border border-amber-900/50 space-y-1">
              <strong className="text-amber-200 block">{debate.perspectiveA.thinkerOrSchool}</strong>
              <ul className="space-y-0.5 text-slate-300 list-disc list-inside">
                {debate.perspectiveA.arguments.map((arg, idx) => (
                  <li key={idx}>{arg}</li>
                ))}
              </ul>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0C0A05] border border-amber-900/50 space-y-1">
              <strong className="text-cyan-200 block">{debate.perspectiveB.thinkerOrSchool}</strong>
              <ul className="space-y-0.5 text-slate-300 list-disc list-inside">
                {debate.perspectiveB.arguments.map((arg, idx) => (
                  <li key={idx}>{arg}</li>
                ))}
              </ul>
            </div>
          </div>
          {debate.modernSynthesis && (
            <p className="text-xs text-slate-200 pt-1 border-t border-amber-950/60">
              <strong className="text-emerald-300">Modern Synthesis: </strong>{debate.modernSynthesis}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

interface LawPrecedentCardProps {
  casePrecedents?: LandmarkCasePrecedent[];
  statutorySections?: StatutorySection[];
}

export const LawPrecedentCard: React.FC<LawPrecedentCardProps> = ({ casePrecedents, statutorySections }) => {
  if ((!casePrecedents || casePrecedents.length === 0) && (!statutorySections || statutorySections.length === 0)) {
    return null;
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-[#0C0B18] to-[#080711] border border-indigo-700/50 shadow-lg space-y-4">
      <div className="flex items-center gap-2.5 border-b border-indigo-900/60 pb-3">
        <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-700 text-indigo-300 shrink-0">
          <Scale className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
            <span>Jurisprudence, Case Precedents & Statutory Provisions</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">
              Law
            </span>
          </h4>
          <p className="text-[11px] text-surface-muted">
            Judicial holdings, material facts, ratio decidendi, and essential statutory ingredients
          </p>
        </div>
      </div>

      {casePrecedents && casePrecedents.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Landmark Case Law Briefings:</span>
          </span>
          <div className="space-y-2.5">
            {casePrecedents.map((cp, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#080714] border border-indigo-900/40 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h5 className="text-xs font-bold text-white">{cp.caseTitle}</h5>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    {cp.citationOrYear && (
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                        {cp.citationOrYear}
                      </span>
                    )}
                    {cp.courtOrBench && (
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                        {cp.courtOrBench}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-300"><strong className="text-slate-400">Facts: </strong>{cp.materialFacts}</p>
                {cp.legalIssuesRaised && cp.legalIssuesRaised.length > 0 && (
                  <div className="text-xs text-slate-300">
                    <strong className="text-indigo-300">Issues: </strong>{cp.legalIssuesRaised.join(' • ')}
                  </div>
                )}
                <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200">
                  <strong className="text-white">Ratio Decidendi: </strong>{cp.ratioDecidendi}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {statutorySections && statutorySections.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-indigo-950/60">
          <span className="text-xs font-bold text-slate-300">Statutory Provisions & Bare Act Definitions:</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {statutorySections.map((sec, sIdx) => (
              <div key={sIdx} className="p-3 rounded-xl bg-[#080714] border border-surface-border/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-indigo-300">{sec.sectionNumber} — {sec.provisionTitle}</span>
                  <span className="text-[10px] text-slate-400">{sec.actOrCode}</span>
                </div>
                <p className="text-slate-300 italic text-[11px]">&ldquo;{sec.bareActDefinition}&rdquo;</p>
                {sec.essentialIngredients && sec.essentialIngredients.length > 0 && (
                  <ul className="text-[11px] text-slate-400 space-y-0.5 list-disc list-inside">
                    {sec.essentialIngredients.map((ing, iIdx) => (
                      <li key={iIdx}>{ing}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface MedicalClinicalCardProps {
  clinicalScenario?: ClinicalScenario;
  drugClassification?: DrugClassification;
}

export const MedicalClinicalCard: React.FC<MedicalClinicalCardProps> = ({
  clinicalScenario,
  drugClassification,
}) => {
  if (!clinicalScenario && !drugClassification) return null;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-[#071114] to-[#050B0D] border border-cyan-700/50 shadow-lg space-y-4">
      <div className="flex items-center gap-2.5 border-b border-cyan-900/60 pb-3">
        <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-300 shrink-0">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
            <span>Clinical Case Presentation & Pharmacotherapy</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
              Medicine
            </span>
          </h4>
          <p className="text-[11px] text-surface-muted">
            Clinical findings, differential diagnoses, definitive management, and drug mechanisms
          </p>
        </div>
      </div>

      {clinicalScenario && (
        <div className="p-3.5 rounded-xl bg-[#050C0E] border border-cyan-900/40 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Case: {clinicalScenario.patientProfile}</span>
            </h5>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              Diagnosis: {clinicalScenario.definitiveDiagnosis}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-black/40 border border-surface-border/50">
              <strong className="text-amber-300 block mb-0.5">Symptoms & Signs:</strong>
              <p className="text-slate-300">{clinicalScenario.presentingSymptoms.join(', ')}</p>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-surface-border/50">
              <strong className="text-cyan-300 block mb-0.5">Differential Diagnoses:</strong>
              <p className="text-slate-300">{clinicalScenario.differentialDiagnoses.join(' • ')}</p>
            </div>
          </div>

          {clinicalScenario.treatmentAndManagement && (
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-xs text-cyan-100">
              <strong className="text-white">Management Plan: </strong>
              {clinicalScenario.treatmentAndManagement.join(', ')}
            </div>
          )}
        </div>
      )}

      {drugClassification && (
        <div className="p-3.5 rounded-xl bg-[#050C0E] border border-cyan-900/40 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm font-bold text-cyan-200">{drugClassification.genericName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              {drugClassification.drugClass}
            </span>
          </div>
          <p className="text-slate-300"><strong className="text-white">Mechanism: </strong>{drugClassification.mechanismOfAction}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div><strong className="text-emerald-300">Indications: </strong>{drugClassification.indications.join(', ')}</div>
            <div><strong className="text-rose-300">Adverse Effects: </strong>{drugClassification.adverseEffects.join(', ')}</div>
          </div>
          {drugClassification.clinicalPearl && (
            <div className="text-[11px] text-amber-300 italic pt-1 border-t border-cyan-950">
              💡 Clinical Pearl: {drugClassification.clinicalPearl}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const SmartNotesView: React.FC<SmartNotesViewProps> = ({ notes, quizQuestions }) => {
  const {
    seekToTimestamp,
    currentTime,
    isPlaying,
    refreshSmartNotes,
    notesMode,
    notesLength,
  } = usePlayer();
  const { profile } = useAuth();
  const [currentNotes, setCurrentNotes] = useState<SmartNotes>(notes);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // Refs for each topic card — used for scroll-into-view on timestamp change
  const topicRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Track whether the user is manually scrolling so we don't interrupt reading
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync internal state with props
  useEffect(() => {
    setCurrentNotes(notes);
  }, [notes]);

  const displayNotes = currentNotes || notes;

  // Detect manual scrolling — mark isUserScrollingRef for 2s after last scroll event.
  // This prevents auto-scroll from interrupting the student while they are reading.
  useEffect(() => {
    // Use the closest ancestor that actually scrolls (the <main> page container)
    const mainScroller = document.querySelector<HTMLElement>('main.page-scroll') ?? document.querySelector('main');
    if (!mainScroller) return;

    const handleScroll = () => {
      isUserScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 2000); // 2s idle = consider manual scrolling finished
    };

    mainScroller.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      mainScroller.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // When a new video/notes set loads, clear the manual-scroll guard so the
  // first active topic can be highlighted and scrolled to immediately.
  useEffect(() => {
    isUserScrollingRef.current = false;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
  }, [notes.videoId]);

  // Compute active topic index matching the real-time video playback currentTime
  const activeTopicIndex = displayNotes?.topics
    ? displayNotes.topics.findIndex((topic, idx) => {
        const start = topic.timestampSeconds ?? 0;
        const nextTopic = displayNotes.topics[idx + 1];
        const end = topic.endTimestampSeconds ?? (nextTopic?.timestampSeconds ?? Infinity);
        return currentTime >= start && currentTime < end;
      })
    : -1;

  // Smart scroll-into-view: gently reveal the active topic only if it's outside
  // the visible area AND the student isn't actively reading (manual scroll guard).
  // Uses block:'nearest' so the page never scrolls if the card is already visible.
  // Respects prefers-reduced-motion by falling back to instant scroll.
  useEffect(() => {
    if (activeTopicIndex < 0) return;
    if (isUserScrollingRef.current) return; // Never interrupt manual reading
    const el = topicRefs.current[activeTopicIndex];
    if (!el) return;

    // Small delay so React finishes rendering before we measure element position
    const t = setTimeout(() => {
      if (isUserScrollingRef.current) return; // Re-check — user may have started scrolling
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'nearest', // Only scrolls if element is out of view; never jumps when already visible
      });
    }, 400);
    return () => clearTimeout(t);
  }, [activeTopicIndex]); // Only fires when the active topic index changes

  // ── Correction Modal State ─────────────────────────────────────────────────
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [activeTopicForCorrection, setActiveTopicForCorrection] = useState<SmartNoteTopic | null>(null);
  const [editedTopicTitle, setEditedTopicTitle] = useState('');
  const [editedSimpleExplanation, setEditedSimpleExplanation] = useState('');
  const [editedDetailedExplanation, setEditedDetailedExplanation] = useState('');
  const [editedCode, setEditedCode] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionSaving, setCorrectionSaving] = useState(false);
  const [correctionSuccessMsg, setCorrectionSuccessMsg] = useState<string | null>(null);

  const openCorrectionModal = (topic: SmartNoteTopic) => {
    setActiveTopicForCorrection(topic);
    setEditedTopicTitle(topic.title);
    setEditedSimpleExplanation(topic.simpleExplanation || '');
    setEditedDetailedExplanation(topic.detailedExplanation || '');
    setEditedCode(topic.codeSnippet?.code || '');
    setCorrectionReason('');
    setCorrectionSuccessMsg(null);
    setCorrectionModalOpen(true);
  };

  const handleSaveCorrection = async () => {
    if (!activeTopicForCorrection || !displayNotes) return;
    setCorrectionSaving(true);
    try {
      const correction: SmartNotesCorrection = {
        id: `corr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: profile?.uid || 'anonymous_student',
        videoId: displayNotes.videoId,
        videoTitle: displayNotes.videoTitle,
        topicId: activeTopicForCorrection.id,
        topicTitle: activeTopicForCorrection.title,
        originalContent: {
          topicTitle: activeTopicForCorrection.title,
          simpleExplanation: activeTopicForCorrection.simpleExplanation,
          detailedExplanation: activeTopicForCorrection.detailedExplanation,
          codeSnippet: activeTopicForCorrection.codeSnippet,
          formulas: activeTopicForCorrection.formulas,
          importantPoints: activeTopicForCorrection.importantPoints,
        },
        correctedContent: {
          topicTitle: editedTopicTitle.trim() || activeTopicForCorrection.title,
          simpleExplanation: editedSimpleExplanation.trim() || activeTopicForCorrection.simpleExplanation,
          detailedExplanation: editedDetailedExplanation.trim() || activeTopicForCorrection.detailedExplanation,
          codeSnippet: activeTopicForCorrection.codeSnippet
            ? { ...activeTopicForCorrection.codeSnippet, code: editedCode }
            : (editedCode.trim() ? { code: editedCode, language: displayNotes.codingSandbox?.language || 'python' } : undefined),
        },
        correctionReason: correctionReason.trim() || 'Verified correction for precision & accuracy',
        isApproved: true,
        createdAt: new Date().toISOString(),
      };

      await FirestoreService.saveSmartNotesCorrection(correction);

      setCurrentNotes((prev) => {
        if (!prev) return prev;
        const updatedTopics = prev.topics.map((t) => {
          if (t.id === activeTopicForCorrection.id) {
            return {
              ...t,
              title: editedTopicTitle.trim() || t.title,
              simpleExplanation: editedSimpleExplanation.trim() || t.simpleExplanation,
              detailedExplanation: editedDetailedExplanation.trim() || t.detailedExplanation,
              codeSnippet: t.codeSnippet
                ? { ...t.codeSnippet, code: editedCode }
                : (editedCode.trim() ? { code: editedCode, language: prev.codingSandbox?.language || 'python' } : undefined),
            };
          }
          return t;
        });
        return { ...prev, topics: updatedTopics };
      });

      setCorrectionSuccessMsg('Correction successfully saved & applied to current notes!');
      setTimeout(() => {
        setCorrectionModalOpen(false);
        setCorrectionSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      console.error('Error saving correction:', err);
    } finally {
      setCorrectionSaving(false);
    }
  };

  // Interactive Sandbox Code State per topic
  const [codeState, setCodeState] = useState<Record<string, string>>({});
  const [codeOutputs, setCodeOutputs] = useState<
    Record<string, { output: string; hasError: boolean; duration: number }>
  >({});
  const [runningTopicId, setRunningTopicId] = useState<string | null>(null);
  const [copiedTopicId, setCopiedTopicId] = useState<string | null>(null);

  // Initialize code state from notes
  useEffect(() => {
    if (!displayNotes) return;
    const initialCode: Record<string, string> = {};
    const initialOutputs: Record<string, { output: string; hasError: boolean; duration: number }> = {};

    displayNotes.topics.forEach((topic) => {
      if (topic.codeSnippet) {
        initialCode[topic.id] = topic.codeSnippet.code;
        initialOutputs[topic.id] = {
          output: topic.codeSnippet.expectedOutput || '(Click "Run Code" to execute in sandbox)',
          hasError: false,
          duration: 0,
        };
      }
    });

    setCodeState((prev) => ({ ...initialCode, ...prev }));
    setCodeOutputs((prev) => ({ ...initialOutputs, ...prev }));
  }, [displayNotes]);

  // Safe Sandbox Execution
  const runSandboxCode = (code: string): { output: string; hasError: boolean; duration: number } => {
    const startTime = performance.now();
    const logs: string[] = [];

    const customConsole = {
      log: (...args: any[]) => {
        logs.push(
          args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
            .join(' ')
        );
      },
      error: (...args: any[]) => {
        logs.push(
          '[Error] ' +
            args
              .map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
              .join(' ')
        );
      },
      warn: (...args: any[]) => {
        logs.push(
          '[Warn] ' +
            args
              .map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
              .join(' ')
        );
      },
      info: (...args: any[]) => {
        logs.push(
          args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
            .join(' ')
        );
      },
    };

    try {
      let executable = code;

      // Handle simple python syntax if entered
      if (code.includes('def ') || (code.includes('print(') && !code.includes('console.log('))) {
        executable = code
          .replace(/\bdef\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/g, 'function $1($2) {')
          .replace(/\bprint\s*\((.*)\)/g, 'console.log($1)')
          .replace(/\bTrue\b/g, 'true')
          .replace(/\bFalse\b/g, 'false')
          .replace(/\bNone\b/g, 'null')
          .replace(/\band\b/g, '&&')
          .replace(/\bor\b/g, '||')
          .replace(/\bnot\b/g, '!');
      }

      // Safe function execution with isolated scope
      const runner = new Function('console', 'window', 'document', 'fetch', 'XMLHttpRequest', `
        "use strict";
        try {
          ${executable}
        } catch (e) {
          console.error(e && e.message ? e.message : String(e));
          throw e;
        }
      `);

      runner(customConsole, {}, {}, undefined, undefined);
      const duration = Math.round((performance.now() - startTime) * 10) / 10;
      const finalOutput = logs.length > 0 ? logs.join('\n') : '(Code executed successfully with no output)';
      return { output: finalOutput, hasError: false, duration };
    } catch (err: any) {
      const duration = Math.round((performance.now() - startTime) * 10) / 10;
      const errorMsg =
        logs.length > 0
          ? `${logs.join('\n')}\n[Runtime Error]: ${err?.message || String(err)}`
          : `[Runtime Error]: ${err?.message || String(err)}`;
      return { output: errorMsg, hasError: true, duration };
    }
  };

  const handleRunCode = (topicId: string, customCode?: string) => {
    const codeToRun = customCode ?? (codeState[topicId] || '');
    if (!codeToRun.trim()) return;

    setRunningTopicId(topicId);

    setTimeout(() => {
      const res = runSandboxCode(codeToRun);
      setCodeOutputs((prev) => ({
        ...prev,
        [topicId]: res,
      }));
      setRunningTopicId(null);
    }, 120);
  };

  const handleResetCode = (topicId: string, initialCode?: string) => {
    if (!initialCode) return;
    setCodeState((prev) => ({ ...prev, [topicId]: initialCode }));
    handleRunCode(topicId, initialCode);
  };

  const handleLoadTemplate = (topicId: string, templateKey: keyof typeof CODE_TEMPLATES) => {
    const tpl = CODE_TEMPLATES[templateKey];
    setCodeState((prev) => ({ ...prev, [topicId]: tpl.code }));
    handleRunCode(topicId, tpl.code);
  };

  const handleCopyCode = async (topicId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTopicId(topicId);
      setTimeout(() => setCopiedTopicId(null), 2000);
    } catch {}
  };

  const handleExportPdf = async () => {
    const targetNotes = displayNotes || notes;
    if (!targetNotes) return;
    try {
      setIsExporting(true);
      await PdfExportService.exportSmartNotesToPdf(targetNotes, {
        codeOutputs,
        activeCodes: codeState,
        quizQuestions,
      });
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        setIsExporting(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setIsExporting(false);
    }
  };

  const handleModeChange = async (newMode: SmartNotesMode) => {
    if (isRefreshing || !refreshSmartNotes || newMode === notesMode) return;
    setIsRefreshing(true);
    setRefreshMessage(`Switching to ${newMode === 'quick' ? 'Quick Revision' : newMode === 'exam' ? 'Exam Revision' : 'Deep Learning'} mode...`);
    try {
      const ok = await refreshSmartNotes(undefined, newMode, notesLength);
      if (ok) {
        setRefreshMessage(`Switched to ${newMode === 'quick' ? 'Quick Revision' : newMode === 'exam' ? 'Exam Revision' : 'Deep Learning'} mode!`);
        setTimeout(() => setRefreshMessage(null), 3500);
      }
    } catch (err: any) {
      setRefreshMessage('Failed to switch mode: ' + (err?.message || 'Unknown error'));
      setTimeout(() => setRefreshMessage(null), 4000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLengthChange = async (newLength: SmartNotesLength) => {
    if (isRefreshing || !refreshSmartNotes || newLength === notesLength) return;
    setIsRefreshing(true);
    setRefreshMessage(`Adjusting note length to ${newLength}...`);
    try {
      const ok = await refreshSmartNotes(undefined, notesMode, newLength);
      if (ok) {
        setRefreshMessage(`Smart Notes length set to ${newLength}!`);
        setTimeout(() => setRefreshMessage(null), 3500);
      }
    } catch (err: any) {
      setRefreshMessage('Failed to adjust length: ' + (err?.message || 'Unknown error'));
      setTimeout(() => setRefreshMessage(null), 4000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshNotes = async () => {
    if (isRefreshing || !refreshSmartNotes) return;
    setIsRefreshing(true);
    setRefreshMessage(null);
    try {
      const ok = await refreshSmartNotes(undefined, notesMode, notesLength);
      if (ok) {
        setRefreshMessage('Smart Notes refreshed successfully with synchronized timestamps!');
        setTimeout(() => setRefreshMessage(null), 3500);
      } else {
        setRefreshMessage('Unable to refresh notes at this time. Please try again.');
        setTimeout(() => setRefreshMessage(null), 3500);
      }
    } catch (err: any) {
      setRefreshMessage('Failed to refresh notes: ' + (err?.message || 'Unknown error'));
      setTimeout(() => setRefreshMessage(null), 4000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Subject badge configuration
  const subjectBadge = {
    programming: {
      label: 'Programming & Code Sandbox Ready',
      icon: <Code2 className="w-3.5 h-3.5 text-sky-400" />,
      style: 'bg-sky-950/70 text-sky-300 border-sky-800/60',
    },
    mathematics: {
      label: 'Mathematics & Step-by-Step Derivations',
      icon: <Sigma className="w-3.5 h-3.5 text-amber-400" />,
      style: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
    },
    science: {
      label: 'Science & Natural Process Diagrams',
      icon: <Globe className="w-3.5 h-3.5 text-emerald-400" />,
      style: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    },
    physics: {
      label: 'Physics Laboratory & Governing Principles',
      icon: <Atom className="w-3.5 h-3.5 text-blue-400" />,
      style: 'bg-blue-950/70 text-blue-300 border-blue-800/60',
    },
    chemistry: {
      label: 'Chemistry & Molecular Reactions',
      icon: <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />,
      style: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    },
    theory: {
      label: 'Conceptual Theory & Concept Maps',
      icon: <Layers className="w-3.5 h-3.5 text-purple-400" />,
      style: 'bg-purple-950/70 text-purple-300 border-purple-800/60',
    },
    engineering: {
      label: 'Engineering & System Architecture',
      icon: <Cpu className="w-3.5 h-3.5 text-cyan-400" />,
      style: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60',
    },
    language: {
      label: 'Language Learning & Grammar Laboratory',
      icon: <Languages className="w-3.5 h-3.5 text-rose-400" />,
      style: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
    },
    commerce: {
      label: 'Commerce & Financial Accounting Ledger',
      icon: <Table className="w-3.5 h-3.5 text-emerald-400" />,
      style: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    },
    humanities: {
      label: 'Humanities, History & Social Analysis',
      icon: <BookOpen className="w-3.5 h-3.5 text-amber-400" />,
      style: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
    },
    medical: {
      label: 'Clinical Medicine, Pathology & Pharmacotherapy',
      icon: <Activity className="w-3.5 h-3.5 text-cyan-400" />,
      style: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60',
    },
    law: {
      label: 'Jurisprudence, Statutes & Landmark Precedents',
      icon: <Scale className="w-3.5 h-3.5 text-indigo-400" />,
      style: 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60',
    },
    general: {
      label: 'Subject Mastery & Structured Notes',
      icon: <Sparkles className="w-3.5 h-3.5 text-brand-400" />,
      style: 'bg-brand-950/70 text-brand-300 border-brand-800/60',
    },
  }[notes.subjectType || 'general'] || {
    label: 'Subject Mastery & Structured Notes',
    icon: <Sparkles className="w-3.5 h-3.5 text-brand-400" />,
    style: 'bg-brand-950/70 text-brand-300 border-brand-800/60',
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Action Bar with Refresh Notes and Export Notes Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between flex-wrap gap-4 p-4 sm:p-5 rounded-2xl bg-surface-card border border-surface-border shadow-sm w-full max-w-full box-border">
        <div className="flex items-center gap-3 min-w-0 flex-1 max-w-full">
          <div className="p-2.5 rounded-xl bg-brand-950/80 border border-brand-800 text-brand-400 shadow-inner shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white">Smart Notes Documentation</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${subjectBadge.style} max-w-full`}>
                {subjectBadge.icon}
                <span className="truncate">{subjectBadge.label}</span>
              </span>
              {notes.detectedLanguage && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 flex items-center gap-1 max-w-full">
                  <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">
                    Detected: {notes.detectedLanguage}
                    {notes.detectedLanguage.toLowerCase() !== 'english'
                      ? ' → English Smart Notes'
                      : ' Smart Notes'}
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-surface-muted mt-0.5 break-words">
              Transcript-grounded study guide, synchronized player timeline & interactive learning sandbox
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto max-w-full flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleRefreshNotes}
            disabled={isRefreshing}
            className="w-full sm:w-auto max-w-full px-4 py-2.5 bg-[#0E0E1B] hover:bg-surface-elevated disabled:opacity-50 border border-surface-border hover:border-brand-500/50 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            title="Re-analyze video transcript and regenerate synchronized Smart Notes"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-brand-400 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="truncate whitespace-nowrap">{isRefreshing ? 'Refreshing Notes...' : 'Refresh Notes'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="w-full sm:w-auto max-w-full px-4 sm:px-5 py-2.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-600/25"
            title="Download complete formatted PDF of Smart Notes directly to your device"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                <span className="truncate whitespace-nowrap">Generating PDF...</span>
              </>
            ) : exportSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="truncate whitespace-nowrap">PDF Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-brand-200 shrink-0" />
                <span className="truncate whitespace-nowrap">Export Notes / Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {refreshMessage && (
        <div className="p-3 rounded-xl bg-brand-950/80 border border-brand-700/60 text-xs text-brand-200 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
          <span>{refreshMessage}</span>
        </div>
      )}

      {/* Smart Notes Controls: Study Mode & Length Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between flex-wrap gap-4 p-4 sm:p-5 rounded-2xl bg-surface-card border border-surface-border shadow-sm">
        {/* Study Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <span className="text-xs font-semibold text-surface-muted uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-brand-400" />
            Study Mode:
          </span>
          <div className="inline-flex p-1 bg-[#0A0A16] border border-surface-border rounded-xl gap-1">
            <button
              type="button"
              onClick={() => handleModeChange('quick')}
              disabled={isRefreshing}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                (notesMode || displayNotes.mode) === 'quick'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title="Concise high-yield bullets & key takeaways for rapid review"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Revision</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('deep')}
              disabled={isRefreshing}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                (notesMode || displayNotes.mode || 'deep') === 'deep'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title="Deep conceptual mastery with thorough explanations & working examples"
            >
              <BookOpen className="w-3.5 h-3.5 text-brand-400" />
              <span>Deep Learning</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('exam')}
              disabled={isRefreshing}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                (notesMode || displayNotes.mode) === 'exam'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title="Exam-focused definitions, critical formulas, traps & solved questions"
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              <span>Exam Revision</span>
            </button>
          </div>
        </div>

        {/* Length Budget Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <span className="text-xs font-semibold text-surface-muted uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Detail Level:
          </span>
          <div className="inline-flex p-1 bg-[#0A0A16] border border-surface-border rounded-xl gap-1">
            {(['short', 'standard', 'detailed'] as SmartNotesLength[]).map((len) => {
              const isSelected = (notesLength || displayNotes.lengthOption || 'standard') === len;
              return (
                <button
                  key={len}
                  type="button"
                  onClick={() => handleLengthChange(len)}
                  disabled={isRefreshing}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    isSelected
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {len}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chapter Modules Navigation (for Long Multi-Hour Lectures) */}
      {displayNotes.lectureModules && displayNotes.lectureModules.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0B0C1E] to-[#12132D] border border-indigo-900/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>LECTURE CHAPTERS & MODULES ({displayNotes.lectureModules.length})</span>
            </div>
            <span className="text-[11px] text-surface-muted">
              Click a chapter to jump directly to its timestamp
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {displayNotes.lectureModules.map((mod, idx) => (
              <button
                key={mod.moduleId || idx}
                type="button"
                onClick={() => seekToTimestamp(mod.startSec)}
                className="text-left p-3 rounded-xl bg-surface-elevated/40 hover:bg-indigo-950/40 border border-surface-border hover:border-indigo-500/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800/60">
                      ⏱ {mod.timestampRange}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {mod.topicsCount} topic{mod.topicsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white group-hover:text-indigo-200 transition-colors line-clamp-1">
                    {mod.title}
                  </h5>
                  {mod.coreTheme && (
                    <p className="text-[11px] text-surface-muted mt-1 line-clamp-2 leading-relaxed">
                      {mod.coreTheme}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Profile Context Summary Card */}
      {profile && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-brand-950/60 via-[#0E0E22] to-indigo-950/40 border border-brand-800/50 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-brand-900/60 border border-brand-700/60 text-brand-300 shadow-inner shrink-0">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-brand-900/80 text-brand-300 border border-brand-700/60">
                  Personalized Study Guide
                </span>
                <span className="text-xs font-semibold text-white">
                  Tuned for <strong className="text-brand-300">{profile.name}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generated with <strong className="text-purple-300">{profile.learningLevel || 'Intermediate'}</strong> depth tailored for{' '}
                <strong className="text-amber-300">{profile.learningGoal || 'Mastery'}</strong>
                {profile.course ? ` • ${profile.course}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <span className="text-[11px] px-3 py-1 rounded-xl bg-purple-950/80 border border-purple-800/80 text-purple-300 font-semibold flex items-center gap-1.5 shadow-sm">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>{profile.learningLevel || 'Intermediate'} Level</span>
            </span>
            <span className="text-[11px] px-3 py-1 rounded-xl bg-amber-950/80 border border-amber-800/80 text-amber-300 font-semibold flex items-center gap-1.5 shadow-sm">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate max-w-[200px]" title={profile.learningGoal}>
                {profile.learningGoal || 'Exam Prep'}
              </span>
            </span>
            {profile.education && (
              <span className="text-[11px] px-3 py-1 rounded-xl bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 font-semibold flex items-center gap-1.5 shadow-sm">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>{profile.education}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Executive Summary Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
            <BookOpen className="w-4 h-4" />
            <span>EXECUTIVE OVERVIEW</span>
          </div>
          <span className="text-[11px] text-surface-muted">
            Video ID: <code className="text-slate-300">{notes.videoId}</code>
          </span>
        </div>
        <ConciseContent text={notes.overallSummary} />

        {/* Prerequisites & Audience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {notes.prerequisites && notes.prerequisites.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#0E0E1B] border border-surface-border/60">
              <span className="text-[11px] font-semibold text-brand-300 block mb-1">
                Prerequisites:
              </span>
              <ul className="text-xs text-surface-muted space-y-1">
                {notes.prerequisites.map((p, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {notes.targetAudience && (
            <div className="p-3.5 rounded-xl bg-[#0E0E1B] border border-surface-border/60">
              <span className="text-[11px] font-semibold text-cyan-300 block mb-1">
                Target Audience:
              </span>
              <p className="text-xs text-surface-muted leading-relaxed">
                {notes.targetAudience}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Overarching Language Learning Curriculum (if language subject) */}
      {notes.subjectType === 'language' && notes.languageLearningDetails && (
        <LanguageLessonCard
          lesson={notes.languageLearningDetails}
          title={`${notes.languageLearningDetails.targetLanguage || 'Language'} Comprehensive Study Curriculum`}
        />
      )}

      {/* Overarching Physics Reference Laboratory (ONLY if physics subject) */}
      {notes.subjectType === 'physics' && notes.physicsOverview && (
        <PhysicsOverviewCard overview={notes.physicsOverview} />
      )}

      {/* Overarching Commerce Overview (ONLY if commerce subject) */}
      {notes.subjectType === 'commerce' && notes.commerceOverview && (notes.commerceOverview.journalEntries || notes.commerceOverview.caseStudies) && (
        <CommerceJournalCard
          entries={notes.commerceOverview.journalEntries}
          businessCase={notes.commerceOverview.caseStudies?.[0]}
        />
      )}

      {/* Overarching Humanities Overview (ONLY if humanities subject) */}
      {notes.subjectType === 'humanities' && notes.humanitiesOverview && (notes.humanitiesOverview.timelines?.[0] || notes.humanitiesOverview.debates?.[0]) && (
        <HumanitiesTimelineCard
          timeline={notes.humanitiesOverview.timelines?.[0]}
          debate={notes.humanitiesOverview.debates?.[0]}
        />
      )}

      {/* Overarching Law Overview (ONLY if law subject) */}
      {notes.subjectType === 'law' && notes.lawOverview && (notes.lawOverview.casePrecedents || notes.lawOverview.statutorySections) && (
        <LawPrecedentCard
          casePrecedents={notes.lawOverview.casePrecedents}
          statutorySections={notes.lawOverview.statutorySections}
        />
      )}

      {/* Overarching Medical Overview (ONLY if medical subject) */}
      {notes.subjectType === 'medical' && notes.medicalOverview && (notes.medicalOverview.clinicalScenarios?.[0] || notes.medicalOverview.drugClassifications?.[0]) && (
        <MedicalClinicalCard
          clinicalScenario={notes.medicalOverview.clinicalScenarios?.[0]}
          drugClassification={notes.medicalOverview.drugClassifications?.[0]}
        />
      )}

      {/* Interactive Coding Sandbox & Online Compiler Callout (ONLY if coding execution part is present in video) */}
      {(notes.codingSandbox || notes.topics.some((t) => Boolean(t.codeSnippet && t.codeSnippet.code))) && (() => {
        const primarySnippet = notes.topics.find((t) => Boolean(t.codeSnippet && t.codeSnippet.code))?.codeSnippet;
        const rawLang = (notes.codingSandbox?.language || primarySnippet?.language || 'sql').toLowerCase();
        const compilerUrl = notes.codingSandbox?.onlineCompilerUrl || primarySnippet?.onlineCompilerUrl || (
          rawLang.includes('sql') ? 'https://www.programiz.com/sql/online-compiler/'
          : rawLang.includes('py') ? 'https://www.programiz.com/python-programming/online-compiler/'
          : rawLang.includes('c++') || rawLang.includes('cpp') ? 'https://www.programiz.com/cpp-programming/online-compiler/'
          : rawLang.includes('java') ? 'https://www.programiz.com/java-programming/online-compiler/'
          : rawLang.includes('c') ? 'https://www.programiz.com/c-programming/online-compiler/'
          : rawLang.includes('html') ? 'https://www.programiz.com/html/online-compiler/'
          : 'https://www.programiz.com/javascript/online-compiler/'
        );
        const compilerName = notes.codingSandbox?.onlineCompilerName || primarySnippet?.onlineCompilerName || (
          rawLang.includes('sql') ? 'SQL Online Compiler'
          : rawLang.includes('py') ? 'Python Online Compiler'
          : rawLang.includes('c++') || rawLang.includes('cpp') ? 'C++ Online Compiler'
          : rawLang.includes('java') ? 'Java Online Compiler'
          : rawLang.includes('c') ? 'C Online Compiler'
          : rawLang.includes('html') ? 'HTML/CSS Online Compiler'
          : 'JavaScript Online Compiler'
        );
        const displayLang = notes.codingSandbox?.language || primarySnippet?.language || 'code';

        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#0B1510] to-[#0A120D] border border-emerald-600/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400 shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Interactive Coding & Execution Sandbox</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                    {displayLang}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  This video includes executable code demonstrations. Test and run your queries or code live in the browser.
                </p>
              </div>
            </div>
            <a
              href={compilerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition-all shrink-0 w-fit"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch {compilerName}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        );
      })()}

      {/* Structured Topics */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-400" />
            <span>Analyzed Video Topics ({displayNotes.topics.length})</span>
          </h3>
          <span className="text-xs text-surface-muted">
            Click any timestamp to seek video
          </span>
        </div>

        {displayNotes.topics.map((topic, index) => {
          const importanceColors = {
            Foundational: 'bg-blue-950/60 text-blue-300 border-blue-700/50',
            Crucial: 'bg-purple-950/60 text-purple-300 border-purple-700/50',
            High: 'bg-amber-950/60 text-amber-300 border-amber-700/50',
          }[topic.importance] || 'bg-brand-950/60 text-brand-300 border-brand-700/50';

          const currentCode = codeState[topic.id] ?? (topic.codeSnippet?.code || '');
          const outputInfo = codeOutputs[topic.id];
          const isRunning = runningTopicId === topic.id;
          const isActive = activeTopicIndex === index;

          return (
            <div
              key={topic.id || index}
              ref={(el) => { topicRefs.current[index] = el; }}
              className={`p-5 sm:p-6 rounded-2xl bg-surface-card transition-all space-y-5 ${
                isActive
                  ? 'border-2 border-brand-500 shadow-xl shadow-brand-500/20 ring-4 ring-brand-500/30'
                  : 'border border-surface-border hover:border-brand-500/30'
              }`}
            >
              {/* Topic Header with Chronological Range & Real-time Highlight */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border/60 pb-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-950/80 text-brand-300 border border-brand-800 shadow-inner">
                      {topic.timestampRange || `${topic.timestamp}${topic.endTimestamp ? `–${topic.endTimestamp}` : ''}`}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Topic #{index + 1}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${importanceColors}`}
                    >
                      {topic.importance}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                        profile?.learningLevel === 'Advanced'
                          ? 'bg-purple-950/70 text-purple-300 border-purple-800/60'
                          : profile?.learningLevel === 'Beginner'
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                          : 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60'
                      }`}
                    >
                      {profile?.learningLevel || 'Intermediate'} Depth
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-brand-500/25 text-brand-300 border border-brand-500/70 shadow-sm animate-pulse">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                        </span>
                        {isPlaying ? 'NOW PLAYING' : 'CURRENT TIMELINE'}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white">
                    {topic.title}
                  </h4>
                  {topic.subtitle && (
                    <p className="text-xs text-brand-300 font-medium">
                      {topic.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0 flex-wrap">
                  {/* Clickable Seek Timestamp */}
                  <button
                    type="button"
                    onClick={() => seekToTimestamp(topic.timestampSeconds || 0)}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold font-mono flex items-center gap-1.5 transition-all shadow-sm group ${
                      isActive
                        ? 'bg-brand-600 text-white border-brand-400 shadow-md shadow-brand-500/30 ring-2 ring-brand-400/50'
                        : 'bg-brand-600/20 hover:bg-brand-600 border-brand-500/40 text-brand-300 hover:text-white'
                    }`}
                    title="Click to seek video to this timestamp"
                  >
                    <Play className={`w-3 h-3 fill-current ${isActive ? 'text-white' : 'text-brand-400 group-hover:text-white'}`} />
                    <span>{topic.timestampRange || topic.timestamp}</span>
                    <span className="text-[10px] font-sans font-normal opacity-80">
                      {isActive && isPlaying ? 'Playing' : 'Seek'}
                    </span>
                  </button>

                  {/* Suggest / Review Correction Button */}
                  <button
                    type="button"
                    onClick={() => openCorrectionModal(topic)}
                    className="px-3 py-1.5 rounded-xl border border-slate-700/80 hover:border-brand-500 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
                    title="Review or correct content for this topic"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-brand-400" />
                    <span>Review & Correct</span>
                  </button>
                </div>
              </div>

              {/* Simple Explanation */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-300">
                  Simple Explanation:
                </span>
                <ConciseContent text={topic.simpleExplanation} />
              </div>

              {/* Detailed Technical Explanation */}
              {topic.detailedExplanation && (
                <div className="space-y-1 p-3.5 rounded-xl bg-[#0E0E1B] border border-surface-border/60">
                  <span className="text-xs font-bold text-slate-300">
                    Comprehensive Technical Explanation:
                  </span>
                  <ConciseContent text={topic.detailedExplanation} />
                </div>
              )}

              {/* Instructor Examples & Walkthroughs */}
              {topic.instructorExamples && topic.instructorExamples.length > 0 && (
                <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-800/30 space-y-1.5">
                  <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                    <span>Instructor Examples & Traces:</span>
                  </div>
                  <ul className="text-xs text-slate-200 space-y-1.5 pl-1">
                    {topic.instructorExamples.map((ex, exIdx) => (
                      <li key={exIdx} className="flex items-start gap-2">
                        <span className="text-sky-400 font-bold">•</span>
                        <span className="leading-relaxed">{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Why Important & Real World Example */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0E0E1B] border border-surface-border/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                    <Flame className="w-3.5 h-3.5 text-purple-400" />
                    <span>Why It Matters:</span>
                  </div>
                  <p className="text-xs text-surface-muted leading-relaxed">
                    {topic.whyImportant}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0E0E1B] border border-surface-border/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real-World Example:</span>
                  </div>
                  <p className="text-xs text-surface-muted leading-relaxed">
                    {topic.realWorldExample}
                  </p>
                </div>
              </div>

              {/* Where It Is Used (Tags) */}
              {topic.whereUsed && topic.whereUsed.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-300">
                    Where It Is Used:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {topic.whereUsed.map((useCase, uIdx) => (
                      <span
                        key={uIdx}
                        className="px-2.5 py-1 rounded-lg bg-[#0E0E1B] border border-surface-border text-xs text-slate-300 flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3 text-brand-400" />
                        <span>{useCase}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Step-by-step breakdown */}
              {topic.stepByStep && topic.stepByStep.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300">
                    Step-by-Step Breakdown:
                  </span>
                  <div className="space-y-1.5">
                    {topic.stepByStep.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-start gap-2.5 text-xs text-slate-300 bg-[#0E0E1B]/50 p-2 rounded-lg"
                      >
                        <span className="w-5 h-5 rounded-full bg-brand-950 text-brand-400 border border-brand-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Definitions */}
              {topic.definitions && topic.definitions.length > 0 && (
                <div className="p-3.5 rounded-xl bg-brand-950/20 border border-brand-800/30 space-y-2">
                  <span className="text-xs font-bold text-brand-300 block">
                    Key Definitions:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {topic.definitions.map((def, dIdx) => (
                      <div
                        key={dIdx}
                        className="p-2.5 rounded-lg bg-[#0E0E1B] border border-surface-border"
                      >
                        <span className="text-xs font-bold text-white block mb-0.5">
                          {def.term}
                        </span>
                        <p className="text-[11px] text-surface-muted leading-relaxed">
                          {def.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulas & Mathematical Relations (KaTeX Typeset) */}
              {topic.formulas && topic.formulas.length > 0 && (
                <div className="p-4 rounded-xl bg-[#0B0D18] border border-amber-800/50 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-amber-950 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <Sigma className="w-4 h-4 text-amber-400" />
                      <span>Formulas & Mathematical Relations ({topic.formulas.length}):</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800/80">
                      LaTeX / KaTeX
                    </span>
                  </div>
                  <div className="space-y-3">
                    {topic.formulas.map((f, fIdx) => (
                      <div
                        key={fIdx}
                        className="p-3.5 rounded-xl bg-surface-card border border-surface-border space-y-2 hover:border-amber-700/50 transition-colors"
                      >
                        <span className="text-xs font-bold text-white block">
                          {f.name}
                        </span>
                        <div className="p-3 rounded-lg bg-black/60 border border-amber-900/40 text-amber-200 overflow-x-auto">
                          <KaTeXFormula math={f.formula} block />
                        </div>
                        {f.explanation && (
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {f.explanation}
                          </p>
                        )}
                        {f.variables && f.variables.length > 0 && (
                          <VariableSymbolDictionary variables={f.variables} accentColor="amber" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step-by-Step Mathematical Solutions (Subject: Mathematics) */}
              {topic.mathSolution && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-[#0B1510] to-[#0E0E1B] border border-emerald-700/50 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-emerald-800/40 pb-2">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300">
                        MATHEMATICAL SOLUTION & DERIVATION
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700 font-bold uppercase">
                      Worked Solution
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-white">
                      Problem Statement:
                    </span>
                    <p className="text-xs text-slate-200">
                      {topic.mathSolution.problem}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-black/50 border border-emerald-900/60">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                      Governing Equation:
                    </span>
                    <div className="font-mono text-xs text-emerald-200 overflow-x-auto py-1">
                      <KaTeXFormula math={topic.mathSolution.formula} block />
                    </div>
                  </div>

                  {topic.mathSolution.variables && topic.mathSolution.variables.length > 0 && (
                    <VariableSymbolDictionary variables={topic.mathSolution.variables} accentColor="emerald" />
                  )}

                  {topic.mathSolution.steps && topic.mathSolution.steps.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-300">
                        Step-by-Step Solution Steps:
                      </span>
                      <div className="space-y-1">
                        {topic.mathSolution.steps.map((st, stIdx) => (
                          <div
                            key={stIdx}
                            className="p-2 rounded bg-black/20 border border-emerald-900/30 text-xs text-slate-200 flex items-start gap-2"
                          >
                            <span className="text-emerald-400 font-bold shrink-0">{stIdx + 1}.</span>
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {topic.mathSolution.workedExample && (
                    <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs space-y-1">
                      <span className="text-[11px] font-bold text-emerald-300 block">
                        Worked Calculation Example:
                      </span>
                      <div className="text-[11px] text-slate-200">
                        <strong>Input:</strong> {topic.mathSolution.workedExample.input}
                      </div>
                      <div className="text-[11px] text-slate-200">
                        <strong>Calculation:</strong> {topic.mathSolution.workedExample.calculation}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-bold pt-1">
                        <strong>Final Result:</strong> {topic.mathSolution.workedExample.output}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dedicated Step-by-Step Derivation Sequence (Subject: Mathematics / Physics) */}
              {topic.derivation && (
                <MathDerivationCard derivation={topic.derivation} />
              )}

              {/* Tabular Coordinate Data & Relationships (Subject: Mathematics / Physics) */}
              {topic.coordinateData && (
                <MathCoordinateCard coordinateData={topic.coordinateData} />
              )}

              {/* Physics Practical / Laboratory Experiment (Subject: Physics ONLY) */}
              {notes.subjectType === 'physics' && topic.physicsExperiment && (
                <PhysicsExperimentCard experiment={topic.physicsExperiment} />
              )}

              {/* Physics Laws & Scientific Principles (Subject: Physics ONLY) */}
              {notes.subjectType === 'physics' && topic.physicsLaws && topic.physicsLaws.length > 0 && (
                <PhysicsLawsCard laws={topic.physicsLaws} />
              )}

              {/* Physical Quantities & SI Units (Subject: Physics ONLY) */}
              {notes.subjectType === 'physics' && topic.physicsQuantities && topic.physicsQuantities.length > 0 && (
                <PhysicsQuantitiesTable quantities={topic.physicsQuantities} />
              )}

              {/* Try Code Section (ONLY if this topic contains coding or execution parts) */}
              {Boolean(topic.codeSnippet && topic.codeSnippet.code) && (() => {
                const snippetLang = topic.codeSnippet?.language?.toLowerCase() || 'javascript';
                const compilerUrl = topic.codeSnippet?.onlineCompilerUrl || (
                  snippetLang.includes('sql') ? 'https://www.programiz.com/sql/online-compiler/'
                  : snippetLang.includes('py') ? 'https://www.programiz.com/python-programming/online-compiler/'
                  : snippetLang.includes('c++') || snippetLang.includes('cpp') ? 'https://www.programiz.com/cpp-programming/online-compiler/'
                  : snippetLang.includes('java') ? 'https://www.programiz.com/java-programming/online-compiler/'
                  : snippetLang.includes('c') ? 'https://www.programiz.com/c-programming/online-compiler/'
                  : snippetLang.includes('html') ? 'https://www.programiz.com/html/online-compiler/'
                  : 'https://www.programiz.com/javascript/online-compiler/'
                );
                const compilerName = topic.codeSnippet?.onlineCompilerName || (
                  snippetLang.includes('sql') ? 'SQL Online Compiler'
                  : snippetLang.includes('py') ? 'Python Online Compiler'
                  : snippetLang.includes('c++') || snippetLang.includes('cpp') ? 'C++ Online Compiler'
                  : snippetLang.includes('java') ? 'Java Online Compiler'
                  : snippetLang.includes('c') ? 'C Online Compiler'
                  : snippetLang.includes('html') ? 'HTML/CSS Online Compiler'
                  : 'JavaScript Online Compiler'
                );

                return (
                  <div className="p-4 rounded-xl bg-[#090D16] border border-sky-800/50 space-y-3 shadow-lg">
                    {/* Sandbox Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-bold text-white">
                          {topic.codeSnippet?.title || 'TRY CODE SANDBOX'}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                          {topic.codeSnippet?.language || 'JavaScript'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <a
                          href={compilerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/70 text-emerald-300 flex items-center gap-1.5 transition-all shadow-sm"
                          title={`Open ${compilerName}`}
                        >
                          <ExternalLink className="w-3 h-3 text-emerald-400" />
                          <span>{compilerName}</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopyCode(topic.id, currentCode)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition-colors"
                          title="Copy Code"
                        >
                          {copiedTopicId === topic.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {topic.codeSnippet?.code && (
                          <button
                            type="button"
                            onClick={() => handleResetCode(topic.id, topic.codeSnippet?.code)}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition-colors"
                            title="Reset to default video code"
                          >
                            <RotateCcw className="w-3 h-3 text-slate-400" />
                            <span>Reset</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRunCode(topic.id)}
                          disabled={isRunning}
                          className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
                        >
                          {isRunning ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Play className="w-3 h-3 fill-current" />
                          )}
                          <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Canonical Algorithm Templates */}
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-surface-muted pt-0.5">
                      <span className="font-semibold text-slate-400">Quick Examples:</span>
                      {Object.entries(CODE_TEMPLATES).map(([key, tpl]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleLoadTemplate(topic.id, key as keyof typeof CODE_TEMPLATES)}
                          className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-sky-950 text-slate-300 hover:text-sky-300 border border-slate-700/60 hover:border-sky-600/60 transition-all font-mono text-[10px]"
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>

                    {/* Code Editor Textarea */}
                    <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-[#0B0F19]">
                      <textarea
                        value={currentCode}
                        onChange={(e) => setCodeState((prev) => ({ ...prev, [topic.id]: e.target.value }))}
                        rows={Math.min(14, Math.max(6, currentCode.split('\n').length + 1))}
                        className="w-full p-3 font-mono text-xs text-sky-200 bg-transparent focus:outline-none resize-y leading-relaxed"
                        placeholder="// Type or edit code here..."
                        spellCheck={false}
                      />
                    </div>

                    {/* Output Terminal */}
                    <div className="rounded-lg bg-[#05070E] border border-slate-900 p-3 space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800/60 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-bold text-slate-200">Terminal Output</span>
                        </div>
                        {outputInfo && (
                          <div className="flex items-center gap-2">
                            {outputInfo.duration > 0 && (
                              <span className="text-slate-500">{outputInfo.duration}ms</span>
                            )}
                            <span
                              className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                                outputInfo.hasError
                                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              }`}
                            >
                              {outputInfo.hasError ? 'Error' : 'Exit 0'}
                            </span>
                          </div>
                        )}
                      </div>

                      <pre
                        className={`text-[11px] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto ${
                          outputInfo?.hasError ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {outputInfo?.output || '(Click "Run Code" to execute in sandbox)'}
                      </pre>
                    </div>

                    {/* Live Online Compiler Runner Callout */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="text-[11px]">
                          Need to run this {topic.codeSnippet?.language || 'code'} with specific packages or interactive database tables?
                        </span>
                      </div>
                      <a
                        href={compilerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shrink-0 w-fit"
                      >
                        <span>Run in {compilerName}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {topic.codeSnippet?.explanation && (
                      <p className="text-[11px] text-surface-muted leading-relaxed">
                        <strong className="text-slate-300">Explanation: </strong>
                        {topic.codeSnippet.explanation}
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Language Learning Lesson Module (Subject: Language Videos ONLY) */}
              {notes.subjectType === 'language' && topic.languageLesson && (
                <LanguageLessonCard
                  lesson={topic.languageLesson}
                  title={`${topic.title} - Language Module`}
                />
              )}

              {/* Commerce Journal Entries & Case Studies (Subject: Commerce ONLY) */}
              {notes.subjectType === 'commerce' && (topic.journalEntries || topic.businessCase || topic.ledgerAccounts) && (
                <CommerceJournalCard
                  entries={topic.journalEntries}
                  ledgerAccounts={topic.ledgerAccounts}
                  businessCase={topic.businessCase}
                />
              )}

              {/* Humanities Historical Timeline & Ideological Debate (Subject: Humanities ONLY) */}
              {notes.subjectType === 'humanities' && (topic.historicalTimeline || topic.ideologicalDebate) && (
                <HumanitiesTimelineCard
                  timeline={topic.historicalTimeline}
                  debate={topic.ideologicalDebate}
                />
              )}

              {/* Law Case Precedents & Statutory Sections (Subject: Law ONLY) */}
              {notes.subjectType === 'law' && (topic.casePrecedents || topic.statutorySections) && (
                <LawPrecedentCard
                  casePrecedents={topic.casePrecedents}
                  statutorySections={topic.statutorySections}
                />
              )}

              {/* Medical Clinical Case & Pharmacology (Subject: Medical ONLY) */}
              {notes.subjectType === 'medical' && (topic.clinicalScenario || topic.drugClassification) && (
                <MedicalClinicalCard
                  clinicalScenario={topic.clinicalScenario}
                  drugClassification={topic.drugClassification}
                />
              )}

              {/* Flowchart / Concept Diagram / Process Map */}
              {topic.diagram && (
                <ConceptDiagram diagram={topic.diagram} />
              )}

              {/* Comparison & Contrast Table */}
              {topic.comparisonTable && topic.comparisonTable.headers && topic.comparisonTable.headers.length > 0 && (
                <div className="p-4 rounded-xl bg-[#090D16] border border-cyan-800/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    <Table className="w-4 h-4 text-cyan-400" />
                    <span>{topic.comparisonTable.title || 'Comparison & Key Distinctions'}</span>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-xs text-slate-200">
                      <thead className="bg-slate-900/90 text-cyan-300 font-semibold border-b border-slate-800">
                        <tr>
                          {topic.comparisonTable.headers.map((h, hIdx) => (
                            <th key={hIdx} className="p-2.5 sm:px-3 sm:py-2">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-black/20">
                        {topic.comparisonTable.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-900/30 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2.5 sm:px-3 sm:py-2 align-top text-[11px] sm:text-xs">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Instructor Tips, Pitfalls & Invariants */}
              {topic.tipsAndWarnings && topic.tipsAndWarnings.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Instructor Tips, Pitfalls & Invariants:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {topic.tipsAndWarnings.map((item, twIdx) => {
                      const style = {
                        tip: 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200',
                        warning: 'bg-amber-950/30 border-amber-800/50 text-amber-200',
                        comparison: 'bg-indigo-950/30 border-indigo-800/50 text-indigo-200',
                        conclusion: 'bg-purple-950/30 border-purple-800/50 text-purple-200',
                      }[item.type] || 'bg-slate-900/40 border-slate-800 text-slate-300';

                      const badge = {
                        tip: '💡 Tip',
                        warning: '⚠️ Common Pitfall',
                        comparison: '🔄 Key Distinction',
                        conclusion: '🎯 Key Takeaway',
                      }[item.type] || '📌 Note';

                      return (
                        <div key={twIdx} className={`p-3 rounded-xl border text-xs space-y-1 ${style}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[10px] uppercase tracking-wider opacity-90">{badge}</span>
                            {item.title && <span className="font-semibold text-white text-[11px]">{item.title}</span>}
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-200">{item.content}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Algorithm / Pseudocode Workflow */}
              {topic.algorithm && (
                <div className="p-4 rounded-xl bg-[#090D16] border border-indigo-800/40 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-900/40 pb-2">
                    <div className="flex items-center gap-2">
                      <Binary className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-white">{topic.algorithm.name || 'Algorithm / Logic Flow'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      {topic.algorithm.timeComplexity && (
                        <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700 text-indigo-300 font-mono">
                          Time: {topic.algorithm.timeComplexity}
                        </span>
                      )}
                      {topic.algorithm.spaceComplexity && (
                        <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700 text-indigo-300 font-mono">
                          Space: {topic.algorithm.spaceComplexity}
                        </span>
                      )}
                    </div>
                  </div>
                  {topic.algorithm.pseudocode && topic.algorithm.pseudocode.length > 0 && (
                    <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-[11px] text-indigo-200 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                      {topic.algorithm.pseudocode.join('\n')}
                    </pre>
                  )}
                </div>
              )}

              {/* Questions Discussed in the Video */}
              {topic.questionsDiscussedInVideo &&
                topic.questionsDiscussedInVideo.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/30 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                      <span>Questions Discussed in the Video:</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      {topic.questionsDiscussedInVideo.map((item, qIdx) => {
                        const isQA = typeof item === 'object' && item !== null && 'question' in item;
                        const qText = isQA ? (item as QuestionAnswer).question : String(item);
                        const aText = isQA ? (item as QuestionAnswer).answer : null;

                        return (
                          <div key={qIdx} className="space-y-1">
                            <div className="flex items-start gap-2 text-slate-200">
                              <span className="text-purple-400 font-bold">•</span>
                              <span className="font-medium">Q: {qText}</span>
                            </div>
                            {aText && (
                              <div className="ml-4 pl-3 border-l-2 border-purple-500/40 text-[11px] text-purple-200/90 leading-relaxed bg-[#0E0E1B]/50 p-2 rounded-r-lg">
                                <strong className="text-purple-300">Instructor Answer: </strong>
                                <span>{aText}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Exam & Revision Points */}
              {topic.examRevisionPoints && topic.examRevisionPoints.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>High-Yield Exam / Revision Points:</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 pl-1">
                    {topic.examRevisionPoints.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Synthesis & Conclusion */}
      {notes.finalSummary && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-surface-card to-[#0E0E1B] border border-indigo-800/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
            <Award className="w-4 h-4 text-indigo-400" />
            <span>FINAL SYNTHESIS & INSTRUCTOR CONCLUSION</span>
          </div>
          <ConciseContent text={notes.finalSummary} />
        </div>
      )}

      {/* Comprehensive Cheat Sheet */}
      {notes.comprehensiveCheatSheet && notes.comprehensiveCheatSheet.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-brand-950/50 via-surface-card to-[#0E0E1B] border border-brand-800/40 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-brand-300">
            <FileText className="w-4 h-4 text-brand-400" />
            <span>Comprehensive Revision Cheat Sheet</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {notes.comprehensiveCheatSheet.map((sheet, sIdx) => (
              <div
                key={sIdx}
                className="p-2.5 rounded-xl bg-black/30 border border-brand-900/30 text-xs text-slate-200 flex items-start gap-2"
              >
                <span className="text-brand-400 font-bold">✓</span>
                <span>{sheet}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User-Approved Topic Review & Correction Modal */}
      {correctionModalOpen && activeTopicForCorrection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121224] border border-brand-500/50 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-surface-border/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/40">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Review & Correct Smart Note Topic</h3>
                  <p className="text-xs text-surface-muted">
                    Improve accuracy, fix missed formulas, refine explanations or code snippets.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCorrectionModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {correctionSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{correctionSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Topic Title</label>
                <input
                  type="text"
                  value={editedTopicTitle}
                  onChange={(e) => setEditedTopicTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Simple Explanation</label>
                <textarea
                  rows={3}
                  value={editedSimpleExplanation}
                  onChange={(e) => setEditedSimpleExplanation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Comprehensive Technical Explanation</label>
                <textarea
                  rows={4}
                  value={editedDetailedExplanation}
                  onChange={(e) => setEditedDetailedExplanation(e.target.value)}
                  placeholder="Detailed breakdown, technical points, laws or derivation rationale..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Code Snippet (Optional / Preserved)</label>
                <textarea
                  rows={4}
                  value={editedCode}
                  onChange={(e) => setEditedCode(e.target.value)}
                  placeholder="// Paste or edit exact demonstrated code here..."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-emerald-300 font-mono text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Correction / Review Note</label>
                <input
                  type="text"
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Corrected SQL syntax, clarified B-Tree root node definition"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-surface-border/80">
              <span className="text-[11px] text-surface-muted">
                Stored in verified benchmark repository.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCorrectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={correctionSaving}
                  onClick={handleSaveCorrection}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-brand-500/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{correctionSaving ? 'Saving...' : 'Save & Apply Verified Note'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
