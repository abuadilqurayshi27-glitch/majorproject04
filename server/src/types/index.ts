export interface VideoMetadata {
  id: string;
  url: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration?: string;
  description?: string;
  hasTranscript: boolean;
  transcriptSnippet?: string;
  detectedLanguage?: string;
  detectedLanguageCode?: string;
}

export interface TranscriptSegment {
  text: string;
  start: number; // in seconds
  duration: number; // in seconds
}

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
  equation: string;           // e.g. "2H₂ + O₂ → 2H₂O" or KaTeX
  type?: string;              // e.g. "Combustion", "Neutralization", "Redox"
  conditions?: string[];      // e.g. ["Heat", "Catalyst: MnO₂", "Pressure: 200 atm"]
  stateSymbols?: boolean;     // whether (s),(l),(g),(aq) are present
  balancingSteps?: string[];  // step-by-step balancing if shown
  ionicForm?: string;         // ionic or net-ionic equation if discussed
}

export interface ChemicalReaction {
  name?: string;              // e.g. "Haber Process", "Contact Process"
  reactants: string[];
  products: string[];
  equation: string;           // full balanced equation
  conditions?: string[];      // temperature, pressure, catalyst
  reactionType?: string;      // e.g. "Addition", "Substitution", "Oxidation"
  mechanism?: string[];       // step-by-step mechanism steps if shown
  energyChange?: string;      // e.g. "Exothermic: ΔH = -286 kJ/mol"
  significance?: string;      // industrial/biological significance
}

export interface ChemistryExperiment {
  isExperiment: boolean;
  title?: string;
  aimOrObjective?: string;
  apparatus: string[];
  chemicals: string[];        // reagents and chemicals used
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
  importance: string; // "High", "Crucial", "Foundational"
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

export interface Flashcard {
  id: string;
  category: 'Concept' | 'Definition' | 'Fact' | 'Process' | 'Formula' | 'Application' | 'Comparison';
  question: string;
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  timestamp?: string;
  timestampSeconds?: number;
  videoId?: string;
  sourceChunkId?: string;
  evidenceExcerpt?: string;
  groundingVerified?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // 4 options
  correctAnswerIndex: number; // 0, 1, 2, or 3
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

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  quickAction?: string;
}

export interface RecommendationTopic {
  topic: string;
  subject: string;
  reason: string;
  suggestedQueries: string[];
  recommendedVideos: Array<{
    title: string;
    channel: string;
    youtubeId: string;
    thumbnail: string;
    relevanceReason: string;
  }>;
}

/**
 * Student profile passed from the client to personalize AI-generated content.
 * Mirrors the StudentProfile interface in the client's types/auth.ts.
 */
export interface StudentProfile {
  name?: string;
  age?: number;
  education?: string;    // e.g. "High School", "PUC", "Undergraduate", "Postgraduate"
  stream?: string;       // e.g. "Science", "Commerce", "Arts"
  course?: string;       // e.g. "Computer Science & Engineering", "PCMB"
  subjects?: string[];   // e.g. ["Physics", "Chemistry", "Mathematics"]
  learningGoal?: string; // e.g. "Score 90%+ in board exams"
  learningLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  classLevel?: string;   // e.g. "9", "10", "11", "12"
  boardExam?: string;    // e.g. "CBSE", "ICSE", "Karnataka State Board"
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
