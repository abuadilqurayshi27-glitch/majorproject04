export type SubjectCategory =
  | 'programming'
  | 'mathematics'
  | 'science'
  | 'physics'
  | 'chemistry'
  | 'commerce'
  | 'humanities'
  | 'medical'
  | 'law'
  | 'theory'
  | 'engineering'
  | 'language'
  | 'general';

export interface LanguageVocabularyItem {
  word: string;
  meaning: string;
  partOfSpeech?: string;
  pronunciation?: string;
  exampleSentence?: string;
}

export interface LanguageGrammarRule {
  rule?: string;
  ruleName?: string;
  explanation: string;
  formulaOrPattern?: string;
  example?: string;
  examples?: string[];
  exceptions?: string[];
}

export interface LanguageSentencePattern {
  pattern: string;
  explanation?: string;
  meaning?: string;
  example?: string;
  examples?: string[];
}

export interface LanguageLessonExercise {
  question?: string;
  exercise?: string;
  answer?: string;
  solution?: string;
  hint?: string;
}

export interface LanguageLessonModule {
  targetLanguage?: string;
  targetLanguageTaught?: string; // e.g. "English", "Hindi", "Kannada", "Urdu", "Bengali"
  nativeOrInstructionLanguage?: string;
  proficiencyLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  grammarConcept?: string;
  grammarRules?: LanguageGrammarRule[];
  vocabulary?: LanguageVocabularyItem[];
  sentenceStructures?: LanguageSentencePattern[];
  pronunciationTips?: string[];
  exercises?: LanguageLessonExercise[];
}

export interface CodeSnippet {
  language: string;
  code: string;
  title?: string;
  explanation?: string;
  initialCode?: string;
  expectedOutput?: string;
  onlineCompilerUrl?: string;
  onlineCompilerName?: string;
}

export interface MathSolution {
  problem: string;
  formula: string;
  variables: Array<{ symbol: string; meaning: string; unit?: string }>;
  steps: string[];
  workedExample?: {
    input: string;
    calculation: string;
    output: string;
  };
}

export interface MathDerivationStep {
  stepNumber: number;
  expression: string; // KaTeX / mathematical expression
  justification: string; // Algebraic reason, law applied, substitution note
  annotation?: string;
}

export interface MathDerivation {
  title: string;
  startingFormula: string;
  targetFormula: string;
  steps: MathDerivationStep[];
  conclusion?: string;
}

export interface MathCoordinatePoint {
  x: number | string;
  y: number | string;
  label?: string;
  note?: string;
}

export interface MathCoordinateData {
  title: string;
  relationshipType?: string; // e.g. Linear, Quadratic, Exponential, Trigonometric
  expressionOrRelation?: string; // e.g. y = 2x + 1 or f(x) = x^2
  variables?: { x: string; y: string };
  coordinatePoints?: MathCoordinatePoint[];
  tableHeaders?: string[];
  tableRows?: (string | number)[][];
  domain?: string;
  range?: string;
  keyObservations?: string[];
}

export interface FormulaVariable {
  symbol: string;
  meaning: string;
  unit?: string;
}

export interface FormulaItem {
  name: string;
  formula: string; // KaTeX formatted
  explanation: string;
  variables?: FormulaVariable[];
}

// Physics Domain Models
export interface PhysicsQuantity {
  quantity: string; // e.g. "Electric Current", "Force", "Angular Velocity"
  symbol: string; // e.g. "I", "F", "\omega"
  siUnit: string; // e.g. "Ampere (A)", "Newton (N)", "rad/s"
  dimensions?: string; // e.g. "[M L T^-2]"
  description?: string;
}

export interface PhysicsLaw {
  name: string; // e.g. "Ohm's Law", "Newton's Second Law"
  statement: string; // Verbal statement / principle
  mathematicalForm?: string; // KaTeX formula
  conditionsOrLimitations?: string[];
}

export interface PhysicsCalculationStep {
  step: string;
  formula?: string;
  substitution?: string;
  result?: string;
  unit?: string;
}

export interface PhysicsExperiment {
  isExperiment: boolean;
  title?: string;
  aimOrObjective?: string;
  apparatus: string[];
  principleOrLaw?: string;
  procedure: string[];
  precautions: string[];
  observations?: Array<{ observation: string; value?: string; unit?: string }>;
  measurementTable?: {
    headers: string[];
    rows: (string | number)[][];
  };
  calculationSteps?: PhysicsCalculationStep[];
  result?: string;
  sourcesOfError?: string[];
}

// Chemistry Domain Models
export interface ChemicalEquation {
  equation: string;
  type?: string;
  conditions?: string[];
  stateSymbols?: boolean;
  balancingSteps?: string[];
  ionicForm?: string;
}

export interface ChemicalReaction {
  name?: string;
  reactants: string[];
  products: string[];
  equation: string;
  conditions?: string[];
  reactionType?: string;
  mechanism?: string[];
  energyChange?: string;
  significance?: string;
}

export interface ChemistryExperiment {
  isExperiment: boolean;
  title?: string;
  aimOrObjective?: string;
  apparatus: string[];
  chemicals: string[];
  principleOrReaction?: string;
  procedure: string[];
  precautions: string[];
  observations?: Array<{ observation: string; value?: string; unit?: string }>;
  observationTable?: {
    headers: string[];
    rows: (string | number)[][];
  };
  calculations?: Array<{
    step: string;
    formula?: string;
    substitution?: string;
    result?: string;
    unit?: string;
  }>;
  result?: string;
  sourcesOfError?: string[];
  inference?: string;
}

// Commerce & Accounting Domain Models
export interface FinancialJournalEntry {
  transaction: string;
  dateOrRef?: string;
  debitAccount: string;
  debitAmount: string | number;
  creditAccount: string;
  creditAmount: string | number;
  narration: string;
}

export interface LedgerAccount {
  accountName: string;
  debitSide: Array<{ date?: string; particular: string; amount: number | string }>;
  creditSide: Array<{ date?: string; particular: string; amount: number | string }>;
  closingBalance: { type: 'Debit' | 'Credit'; amount: string | number };
}

export interface BusinessCaseStudy {
  companyOrScenario: string;
  businessProblem: string;
  analysisFramework?: string; // e.g. "SWOT", "PESTLE", "Porter's 5 Forces"
  strategicSolution: string;
  financialOrMarketImpact?: string;
}

// Arts, Humanities & Social Sciences Domain Models
export interface HistoricalEventNode {
  yearOrDate: string;
  title: string;
  location?: string;
  keyFigures: string[];
  causes?: string[];
  eventSummary: string;
  historicalSignificance: string;
}

export interface HistoricalTimeline {
  title: string;
  eraOrPeriod?: string;
  events: HistoricalEventNode[];
}

export interface IdeologicalDebate {
  conceptOrIssue: string;
  perspectiveA: { thinkerOrSchool: string; arguments: string[] };
  perspectiveB: { thinkerOrSchool: string; arguments: string[] };
  modernSynthesis?: string;
}

// Law & Jurisprudence Domain Models
export interface LandmarkCasePrecedent {
  caseTitle: string;
  citationOrYear?: string;
  courtOrBench?: string;
  materialFacts: string;
  legalIssuesRaised: string[];
  decisionOrRuling: string;
  ratioDecidendi: string;
  obiterDicta?: string;
}

export interface StatutorySection {
  actOrCode: string;
  sectionNumber: string;
  provisionTitle: string;
  bareActDefinition: string;
  essentialIngredients: string[];
  exceptionsOrProvisos?: string[];
  punishmentOrRemedy?: string;
}

// Medical & Clinical Health Domain Models
export interface ClinicalScenario {
  patientProfile: string;
  presentingSymptoms: string[];
  examinationFindings: string[];
  differentialDiagnoses: string[];
  investigations?: Array<{ test: string; rationale: string; expectedFinding: string }>;
  definitiveDiagnosis: string;
  treatmentAndManagement: string[];
}

export interface DrugClassification {
  genericName: string;
  drugClass: string;
  mechanismOfAction: string;
  indications: string[];
  contraindications: string[];
  adverseEffects: string[];
  clinicalPearl?: string;
}

export interface ConceptDiagramData {
  type: 'flowchart' | 'hierarchy' | 'cycle' | 'concept_map' | 'process' | 'technical';
  title: string;
  steps: Array<{
    step: number;
    label: string;
    description: string;
    subNodes?: string[];
  }>;
}

export interface ComparisonTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface TeachingNote {
  type: 'tip' | 'warning' | 'comparison' | 'conclusion';
  title?: string;
  content: string;
}

export interface AlgorithmStep {
  name: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  pseudocode: string[];
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface SmartNoteTopic {
  id: string;
  title: string;
  subtitle?: string;
  timestamp: string; // e.g. "00:00"
  endTimestamp?: string; // e.g. "02:35"
  timestampRange?: string; // e.g. "00:00–02:35"
  timestampSeconds: number;
  endTimestampSeconds?: number;
  importance: 'Foundational' | 'Crucial' | 'High';
  simpleExplanation: string;
  detailedExplanation?: string;
  whyImportant: string;
  realWorldExample: string;
  instructorExamples?: string[];
  whereUsed: string[];
  stepByStep: string[];
  definitions: Array<{ term: string; definition: string }>;
  importantPoints: string[];
  formulas?: FormulaItem[];
  mathSolution?: MathSolution;
  derivation?: MathDerivation;
  coordinateData?: MathCoordinateData;
  physicsExperiment?: PhysicsExperiment;
  physicsQuantities?: PhysicsQuantity[];
  physicsLaws?: PhysicsLaw[];
  chemicalEquations?: ChemicalEquation[];
  chemicalReactions?: ChemicalReaction[];
  chemistryExperiment?: ChemistryExperiment;
  codeSnippet?: CodeSnippet;
  comparisonTable?: ComparisonTable;
  tipsAndWarnings?: TeachingNote[];
  algorithm?: AlgorithmStep;
  diagram?: ConceptDiagramData;
  languageLesson?: LanguageLessonModule;
  // Commerce & Accounting
  journalEntries?: FinancialJournalEntry[];
  ledgerAccounts?: LedgerAccount[];
  businessCase?: BusinessCaseStudy;
  // Humanities & Arts
  historicalTimeline?: HistoricalTimeline;
  ideologicalDebate?: IdeologicalDebate;
  // Law & Jurisprudence
  casePrecedents?: LandmarkCasePrecedent[];
  statutorySections?: StatutorySection[];
  // Medical & Clinical
  clinicalScenario?: ClinicalScenario;
  drugClassification?: DrugClassification;
  questionsDiscussedInVideo: Array<string | QuestionAnswer>;
  examRevisionPoints: string[];
  keyTakeaways: string[];
}

export type SmartNotesMode = 'quick' | 'deep' | 'exam';
export type SmartNotesLength = 'short' | 'standard' | 'detailed';

export interface LectureModule {
  moduleId: string;
  title: string;
  timestampRange: string;
  startSec: number;
  endSec: number;
  topicsCount: number;
  coreTheme: string;
}

export interface SmartNotes {
  videoId: string;
  videoTitle: string;
  overallSummary: string;
  finalSummary?: string;
  subjectType?: SubjectCategory;
  mode?: SmartNotesMode;
  lengthOption?: SmartNotesLength;
  detectedLanguage?: string;
  targetLanguage?: string;
  languageLearningDetails?: LanguageLessonModule;
  physicsOverview?: {
    laws?: PhysicsLaw[];
    quantities?: PhysicsQuantity[];
  };
  chemistryOverview?: {
    equations?: ChemicalEquation[];
    reactions?: ChemicalReaction[];
  };
  commerceOverview?: {
    journalEntries?: FinancialJournalEntry[];
    ledgerAccounts?: LedgerAccount[];
    caseStudies?: BusinessCaseStudy[];
  };
  humanitiesOverview?: {
    timelines?: HistoricalTimeline[];
    debates?: IdeologicalDebate[];
  };
  lawOverview?: {
    casePrecedents?: LandmarkCasePrecedent[];
    statutorySections?: StatutorySection[];
  };
  medicalOverview?: {
    clinicalScenarios?: ClinicalScenario[];
    drugClassifications?: DrugClassification[];
  };
  prerequisites: string[];
  targetAudience: string;
  codingSandbox?: {
    language: string;
    onlineCompilerName: string;
    onlineCompilerUrl: string;
  };
  lectureModules?: LectureModule[];
  topics: SmartNoteTopic[];
  comprehensiveCheatSheet: string[];
}

export interface SmartNotesCorrection {
  id: string;
  userId: string;
  videoId: string;
  videoTitle: string;
  topicId?: string;
  topicTitle?: string;
  originalContent: {
    topicTitle?: string;
    simpleExplanation?: string;
    detailedExplanation?: string;
    codeSnippet?: CodeSnippet;
    formulas?: FormulaItem[];
    importantPoints?: string[];
  };
  correctedContent: {
    topicTitle?: string;
    simpleExplanation?: string;
    detailedExplanation?: string;
    codeSnippet?: CodeSnippet;
    formulas?: FormulaItem[];
    importantPoints?: string[];
  };
  correctionReason?: string;
  isApproved: boolean; // Flag indicating manually reviewed and user-approved
  createdAt: string;
  evaluatedForBenchmarking?: boolean;
}

export interface Flashcard {
  id: string;
  category: 'Concept' | 'Definition' | 'Fact' | 'Process' | 'Formula' | 'Application' | 'Comparison';
  question: string;
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  timestamp?: string;
  timestampSeconds?: number;
  userStatus?: 'unreviewed' | 'known' | 'review';
  videoId?: string;
  sourceChunkId?: string;
  evidenceExcerpt?: string;
  groundingVerified?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  markType?: '1-mark' | '3-mark' | '5-mark'; // Board exam mark category (HS/PUC only)
  questionType?: 'mcq' | 'short-answer' | 'long-answer';
  timestamp?: string;
  timestampSeconds?: number;
  videoId?: string;
  sourceChunkId?: string;
  evidenceExcerpt?: string;
  groundingVerified?: boolean;
}

export interface QuizResult {
  id: string;
  videoId: string;
  videoTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  topicBreakdown: Record<string, { correct: number; total: number }>;
  weakTopics: string[];
  answers: Array<{
    questionId: string;
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    topic: string;
  }>;
}

export interface ChapterTag {
  subject: string;        // e.g. "Physics", "Chemistry", "History"
  chapterNumber?: number; // e.g. 10
  chapterName: string;    // e.g. "Light – Reflection and Refraction"
  classLevel?: string;    // e.g. "10"
  boardExam?: string;     // e.g. "CBSE"
}

export interface LearningHistoryItem {
  id: string;
  videoId: string;
  videoTitle: string;
  channel: string;
  thumbnail: string;
  watchedAt: string;
  durationSeconds: number;
  completedNotes: boolean;
  flashcardsStudied: number;
  quizCompleted: boolean;
  lastQuizScore?: number;
  studiedTopics: string[];
  isCompleted?: boolean;
  videoDuration?: number;
  watchPercentage?: number;
  chapterTag?: ChapterTag; // Optional board-exam chapter tag
}

export interface BlurtingLog {
  id: string;
  topic: string;
  studentText: string;
  rememberedPoints: string[];
  missedPoints: string[];
  correctExplanation: string;
  accuracy: number; // 0-100%
  completedAt: string;
}

export interface ActiveRecallLog {
  id: string;
  topic: string;
  studentAnswer: string;
  selfAssessment: 'mastered' | 'partial' | 'review';
  revealedExplanation: string;
  completedAt: string;
}

export interface QuickRecallQuestion {
  id: string;
  topic: string;
  question: string;
  answer: string;
  sourceType: 'formula' | 'definition' | 'qa' | 'important_point' | 'takeaway';
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface RevisionSessionAttempt {
  id: string;
  date: string;
  sessionIndex: number;
  sessionTitle: string;
  topicsReviewed: string[];
  score: number;
  accuracy: number;
  totalItems: number;
  correctItems: number;
}

export interface RevisionData {
  userId: string;
  videoId: string;
  videoTitle: string;
  revisionStreak: number;
  lastRevisionDate?: string;
  nextRevisionDate?: string;
  spacedRepetitionIntervalDays: number; // 1, 3, 7, 30
  spacedRepetitionStage: number; // 1, 2, 3, 4
  previousScore: number;
  currentScore: number;
  improvementPct: number; // Kaizen progress
  masteredTopics: string[];
  weakTopics: string[];
  topicsImproved: string[];
  attempts: RevisionSessionAttempt[];
  blurtingLogs: BlurtingLog[];
  activeRecallLogs: ActiveRecallLog[];
}

export interface RevisionNotification {
  id: string;
  userId: string;
  videoId?: string;
  videoTitle?: string;
  type: 'revision_unlocked' | 'revision_due' | 'streak_reminder' | 'streak_motivational';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  readAt?: string;
  isCompleted?: boolean;
  dueDate?: string;
  streakCount?: number;
  usualStudyTime?: string;
  priority?: number; // 1 = highest (revision_due), 2 = streak, 3 = unlocked
}

export interface StudentAnalytics {
  totalVideosWatched: number;
  completedVideosCount: number;
  totalLearningMinutes: number;
  totalLearningHours: number;
  topicsStudiedCount: number;
  flashcardsMasteredCount: number;
  flashcardsReviewCount: number;
  averageQuizScore: number;
  totalQuizzesTaken: number;
  strongTopics: string[];
  weakTopics: string[];
  studyTimeByDay: Array<{ day: string; minutes: number; date?: string }>;
  quizScoreTrend: Array<{ date: string; score: number; title: string }>;
  topicMasteryList: Array<{ topic: string; mastery: number; category: string }>;
  dayStreak: number;
  learningScore: number;
  weeklyGrowthPct: number;
  totalRevisionSessions: number;
  revisionAccuracyAvg: number;
  preferredStudyHour?: number;
  preferredStudyTimeFormatted?: string;
  hasCompletedTodayActivity?: boolean;
}

export interface SmartNotesCorrection {
  id: string;
  userId: string;
  videoId: string;
  videoTitle: string;
  topicId?: string;
  topicTitle?: string;
  originalContent: {
    topicTitle?: string;
    simpleExplanation?: string;
    detailedExplanation?: string;
    codeSnippet?: CodeSnippet;
    formulas?: FormulaItem[];
    importantPoints?: string[];
  };
  correctedContent: {
    topicTitle?: string;
    simpleExplanation?: string;
    detailedExplanation?: string;
    codeSnippet?: CodeSnippet;
    formulas?: FormulaItem[];
    importantPoints?: string[];
  };
  correctionReason?: string;
  isApproved: boolean; // Flag indicating manually reviewed and user-approved
  createdAt: string;
  evaluatedForBenchmarking?: boolean;
}


