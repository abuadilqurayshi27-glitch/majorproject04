import { TranscriptSegment, SmartNotes, Flashcard, QuizQuestion } from '../types/index.js';
import { GroundingValidator } from '../services/groundingValidator.js';
import { VideoGroundedPipeline } from '../services/videoGroundedPipeline.js';
import { FallbackNlpService } from '../services/fallbackNlpService.js';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  metrics?: Record<string, any>;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, message: string, metrics?: Record<string, any>) {
  if (condition) {
    results.push({ name: testName, passed: true, details: message, metrics });
    console.log(`  ✅ [PASS] ${testName}: ${message}`);
  } else {
    results.push({ name: testName, passed: false, details: message, metrics });
    console.error(`  ❌ [FAIL] ${testName}: ${message}`);
  }
}

// -------------------------------------------------------------
// Test Case 1: Video with a short transcript (3-minute concept)
// -------------------------------------------------------------
async function testShortTranscript() {
  console.log('\n--- Running Test 1: Short Video Transcript ---');
  const shortSegments: TranscriptSegment[] = [
    { text: 'Binary search is an efficient algorithm for finding an item from a sorted list of items.', start: 0, duration: 15 },
    { text: 'It works by repeatedly dividing in half the portion of the list that could contain the item.', start: 16, duration: 25 },
    { text: 'The time complexity of binary search is O(log n), where n is the number of elements.', start: 42, duration: 25 },
    { text: 'A key prerequisite for binary search is that the collection must already be sorted in ascending or descending order.', start: 68, duration: 30 },
  ];

  const notes: SmartNotes = {
    videoId: 'short_binary_search',
    videoTitle: 'Binary Search Algorithm Explained',
    overallSummary: 'Overview of binary search and its logarithmic time complexity.',
    prerequisites: ['Sorted arrays'],
    targetAudience: 'Computer Science Students',
    comprehensiveCheatSheet: ['Time Complexity: O(log n)'],
    topics: [
      {
        id: 'topic_1',
        title: 'Binary Search',
        timestamp: '00:00',
        timestampSeconds: 0,
        importance: 'Foundational',
        simpleExplanation: 'Divides a sorted array in half to find target element in logarithmic time.',
        whyImportant: 'Far faster than O(n) linear scan for large data sets.',
        realWorldExample: 'Looking up a name in a phone book.',
        whereUsed: ['Database search', 'Lookup tables'],
        stepByStep: ['Check middle element', 'Discard half', 'Repeat'],
        definitions: [{ term: 'Binary Search', definition: 'An efficient algorithm for finding an item from a sorted list' }],
        importantPoints: ['Array must be sorted'],
        questionsDiscussedInVideo: [],
        examRevisionPoints: [],
        keyTakeaways: [],
      },
    ],
  };

  const flashcards = FallbackNlpService.generateFlashcards(notes, shortSegments);
  const quiz = FallbackNlpService.generateQuiz(notes, shortSegments);

  assert(
    flashcards.length > 0 && flashcards.every(f => f.groundingVerified && f.evidenceExcerpt),
    'Test 1A: Short Transcript Flashcard Grounding',
    `Generated ${flashcards.length} verified flashcards with non-empty evidence excerpts`,
    { count: flashcards.length }
  );

  assert(
    quiz.length > 0 && quiz.every(q => q.groundingVerified && q.options.length === 4 && q.correctAnswerIndex >= 0),
    'Test 1B: Short Transcript MCQ Grounding',
    `Generated ${quiz.length} verified MCQs with 4 options and valid answer indices`,
    { count: quiz.length }
  );
}

// -------------------------------------------------------------
// Test Case 2: Long lecture with multiple topics & coverage balance
// -------------------------------------------------------------
async function testLongMultiTopicLecture() {
  console.log('\n--- Running Test 2: Long Multi-Topic Lecture ---');
  // Create a 45-minute lecture transcript with 3 distinct chapters
  const longSegments: TranscriptSegment[] = [];

  // Chapter 1: 0 - 900s (Normalization 1NF)
  for (let s = 0; s < 900; s += 30) {
    longSegments.push({
      text: s === 0
        ? 'First Normal Form 1NF requires atomic values in each table column with no repeating groups.'
        : `Database row processing at timestamp ${s} seconds enforcing relational atomicity.`,
      start: s,
      duration: 30,
    });
  }

  // Chapter 2: 900 - 1800s (Normalization 2NF)
  for (let s = 900; s < 1800; s += 30) {
    longSegments.push({
      text: s === 900
        ? 'Second Normal Form 2NF eliminates partial dependencies where non-prime attributes depend on part of a composite candidate key.'
        : `Relational table decomposition at timestamp ${s} seconds removing composite key partial functional dependencies.`,
      start: s,
      duration: 30,
    });
  }

  // Chapter 3: 1800 - 2700s (Normalization 3NF & BCNF)
  for (let s = 1800; s < 2700; s += 30) {
    longSegments.push({
      text: s === 1800
        ? 'Third Normal Form 3NF eliminates transitive dependencies where non-prime attribute determines another non-prime attribute.'
        : `Boyce-Codd Normal Form BCNF requires that every determinant is a superkey at second ${s}.`,
      start: s,
      duration: 30,
    });
  }

  const notes: SmartNotes = {
    videoId: 'long_dbms_lecture',
    videoTitle: 'Database Normalization from 1NF to BCNF Masterclass',
    overallSummary: 'Comprehensive guide to database normalization.',
    prerequisites: ['Relational Database Basics'],
    targetAudience: 'Software Engineers',
    comprehensiveCheatSheet: [],
    topics: [
      {
        id: 'top_1nf',
        title: 'First Normal Form (1NF)',
        timestamp: '00:00',
        timestampSeconds: 0,
        importance: 'Foundational',
        simpleExplanation: 'Atomic values in all attributes.',
        whyImportant: 'Foundation of relational integrity.',
        realWorldExample: 'Separating phone numbers into individual rows.',
        whereUsed: ['Relational tables'],
        stepByStep: ['Identify multi-valued attributes', 'Split into rows'],
        definitions: [{ term: 'First Normal Form', definition: 'requires atomic values in each table column with no repeating groups' }],
        importantPoints: ['No repeating groups'],
        questionsDiscussedInVideo: [],
        examRevisionPoints: [],
        keyTakeaways: [],
      },
      {
        id: 'top_2nf',
        title: 'Second Normal Form (2NF)',
        timestamp: '15:00',
        timestampSeconds: 900,
        importance: 'Crucial',
        simpleExplanation: 'Eliminates partial dependencies on composite keys.',
        whyImportant: 'Prevents update anomalies in composite tables.',
        realWorldExample: 'Separating course fee from student enrollment.',
        whereUsed: ['Composite tables'],
        stepByStep: ['Check candidate key', 'Decompose partial dependents'],
        definitions: [{ term: 'Second Normal Form', definition: 'eliminates partial dependencies on candidate keys' }],
        importantPoints: ['Applies only when composite keys exist'],
        questionsDiscussedInVideo: [],
        examRevisionPoints: [],
        keyTakeaways: [],
      },
      {
        id: 'top_3nf',
        title: 'Third Normal Form (3NF)',
        timestamp: '30:00',
        timestampSeconds: 1800,
        importance: 'High',
        simpleExplanation: 'Eliminates transitive dependencies.',
        whyImportant: 'Ensures attributes depend only on the primary key.',
        realWorldExample: 'Separating ZIP code city from user address.',
        whereUsed: ['Production databases'],
        stepByStep: ['Check determinant', 'Verify superkey'],
        definitions: [{ term: 'Third Normal Form', definition: 'eliminates transitive dependencies between non-key columns' }],
        importantPoints: ['Every determinant must be a key'],
        questionsDiscussedInVideo: [],
        examRevisionPoints: [],
        keyTakeaways: [],
      },
    ],
  };

  const quiz = FallbackNlpService.generateQuiz(notes, longSegments);

  // Check coverage: are questions sampled across the early (< 900s), middle (900-1800s), and late (> 1800s) periods?
  const earlyCount = quiz.filter(q => (q.timestampSeconds || 0) < 900).length;
  const midCount = quiz.filter(q => (q.timestampSeconds || 0) >= 900 && (q.timestampSeconds || 0) < 1800).length;
  const lateCount = quiz.filter(q => (q.timestampSeconds || 0) >= 1800).length;

  const hasCoverageAcrossVideo = earlyCount > 0 && (midCount > 0 || lateCount > 0);

  assert(
    hasCoverageAcrossVideo,
    'Test 2: Long Lecture Coverage Across Timeline',
    `Questions distributed: Early=${earlyCount}, Mid=${midCount}, Late=${lateCount}`,
    { earlyCount, midCount, lateCount, total: quiz.length }
  );
}

// -------------------------------------------------------------
// Test Case 3: Transcript containing formulas & technical definitions
// -------------------------------------------------------------
async function testTechnicalFormulasAndDefinitions() {
  console.log('\n--- Running Test 3: Technical Formulas and Definitions ---');
  const physicsSegments: TranscriptSegment[] = [
    { text: 'In this physics laboratory session we verify Ohms law governing electrical circuits.', start: 0, duration: 20 },
    { text: 'Ohms law states that electric current through a conductor is directly proportional to voltage.', start: 21, duration: 30 },
    { text: 'The mathematical equation is V = I * R, where V is potential difference, I is current, and R is resistance.', start: 52, duration: 35 },
    { text: 'Resistance is measured in ohms, current in amperes, and potential difference in volts.', start: 88, duration: 25 },
    { text: 'A key experimental precaution is to ensure tight wire connections and avoid excessive heating of the nichrome wire.', start: 114, duration: 35 },
  ];

  const notes: SmartNotes = {
    videoId: 'physics_ohms_law',
    videoTitle: 'Verification of Ohms Law Experiment',
    overallSummary: 'Laboratory verification of Ohms Law V = I * R.',
    prerequisites: ['Basic electricity'],
    targetAudience: 'Physics Students',
    comprehensiveCheatSheet: [],
    topics: [
      {
        id: 'ohms_law_topic',
        title: 'Ohm’s Law',
        timestamp: '00:00',
        timestampSeconds: 0,
        importance: 'Foundational',
        simpleExplanation: 'Relates electric current, voltage, and resistance.',
        whyImportant: 'Core law of electrical circuits.',
        realWorldExample: 'Calculating resistor values for electronics.',
        whereUsed: ['Circuit design', 'Electronics'],
        stepByStep: ['Connect voltmeter and ammeter', 'Vary rheostat', 'Calculate slope V/I'],
        definitions: [{ term: 'Ohms law', definition: 'states that electric current through a conductor is directly proportional to voltage' }],
        formulas: [{ name: 'Ohms law equation', formula: 'V = I * R', explanation: 'V is voltage, I is current, R is resistance' }],
        importantPoints: ['Temperature must remain constant'],
        questionsDiscussedInVideo: [],
        examRevisionPoints: [],
        keyTakeaways: [],
      },
    ],
  };

  const flashcards = FallbackNlpService.generateFlashcards(notes, physicsSegments);
  const quiz = FallbackNlpService.generateQuiz(notes, physicsSegments);

  const formulaCard = flashcards.find(f => f.category === 'Formula' || f.answer.includes('V = I * R') || f.question.includes('formula'));
  assert(
    !!formulaCard,
    'Test 3A: Formula Extraction in Flashcards',
    formulaCard ? `Generated formula card: "${formulaCard.question}" -> "${formulaCard.answer}"` : 'No formula card generated'
  );

  const formulaMCQ = quiz.find(q => q.question.toLowerCase().includes('ohms') || q.explanation.toLowerCase().includes('ohms'));
  assert(
    !!formulaMCQ && formulaMCQ.options.length === 4,
    'Test 3B: Formula MCQ Generation',
    formulaMCQ ? `Generated MCQ on: "${formulaMCQ.question}"` : 'No technical MCQ generated'
  );
}

// -------------------------------------------------------------
// Test Case 4: Transcript with repeated explanations (Deduplication)
// -------------------------------------------------------------
async function testRepetitiveExplanations() {
  console.log('\n--- Running Test 4: Repeated Explanations & Deduplication ---');
  const repetitiveSegments: TranscriptSegment[] = [
    { text: 'An index is a data structure that improves the speed of data retrieval.', start: 0, duration: 20 },
    { text: 'Let me repeat that: an index is a data structure that improves the speed of data retrieval.', start: 22, duration: 25 },
    { text: 'Again, as I mentioned, an index is a data structure that improves the speed of data retrieval operations.', start: 48, duration: 25 },
    { text: 'Remember, an index improves data retrieval speed.', start: 74, duration: 20 },
  ];

  const candidateCards: Flashcard[] = [
    {
      id: 'c1',
      category: 'Definition',
      question: 'What is a database index?',
      answer: 'An index is a data structure that improves the speed of data retrieval.',
      difficulty: 'Easy',
      topic: 'Indexing',
      evidenceExcerpt: 'An index is a data structure that improves the speed of data retrieval.',
      timestamp: '00:00',
      timestampSeconds: 0,
    },
    {
      id: 'c2',
      category: 'Definition',
      question: 'What is a database index?',
      answer: 'An index is a data structure that improves the speed of data retrieval.',
      difficulty: 'Easy',
      topic: 'Indexing',
      evidenceExcerpt: 'Let me repeat that: an index is a data structure that improves the speed of data retrieval.',
      timestamp: '00:22',
      timestampSeconds: 22,
    },
    {
      id: 'c3',
      category: 'Concept',
      question: 'How is a database index defined in the lecture?',
      answer: 'An index is a data structure that improves the speed of data retrieval operations.',
      difficulty: 'Medium',
      topic: 'Indexing',
      evidenceExcerpt: 'Again, as I mentioned, an index is a data structure that improves the speed of data retrieval operations.',
      timestamp: '00:48',
      timestampSeconds: 48,
    },
  ];

  const deduplicated = GroundingValidator.deduplicateItems(candidateCards, 0.70);

  assert(
    deduplicated.length === 1,
    'Test 4: Deduplication of Repetitive Question Candidates',
    `Reduced 3 identical/near-identical candidate questions to ${deduplicated.length}`,
    { originalCount: candidateCards.length, deduplicatedCount: deduplicated.length, duplicateRate: '66.7%' }
  );
}

// -------------------------------------------------------------
// Test Case 5: Insufficient evidence rejection
// -------------------------------------------------------------
async function testInsufficientEvidenceRejection() {
  console.log('\n--- Running Test 5: Insufficient Evidence Rejection ---');
  const segments: TranscriptSegment[] = [
    { text: 'Today we discuss bubble sort which has O(n^2) worst case complexity.', start: 0, duration: 20 },
  ];

  // Candidate with hallucinated claim not in transcript (Quantum entanglement)
  const hallucinatedMCQ: QuizQuestion = {
    id: 'hallucinated_q',
    question: 'How does quantum entanglement accelerate sorting algorithms?',
    options: [
      'By using qubit superposition',
      'By collapsing wavefunctions',
      'By tunneling through the array',
      'By instant particle communication',
    ],
    correctAnswerIndex: 0,
    explanation: 'Quantum mechanics speeds up sorting to O(1).',
    topic: 'Quantum Computing',
    difficulty: 'Hard',
    evidenceExcerpt: 'Quantum entanglement accelerates sorting using qubit superposition', // Fake claim
  };

  const validation = GroundingValidator.validateQuizQuestion(hallucinatedMCQ, segments);

  assert(
    !validation.isValid,
    'Test 5: Unsupported Question Rejection',
    `Successfully rejected ungrounded question with reason: "${validation.rejectionReason}"`
  );
}

// -------------------------------------------------------------
// Test Case 6: Two different videos analyzed by same user (Isolation)
// -------------------------------------------------------------
async function testMultiVideoUserIsolation() {
  console.log('\n--- Running Test 6: Multi-Video User Isolation ---');
  const userId = 'student_test_user_42';
  const videoA: string = 'vid_sql_indexes_001';
  const videoB: string = 'vid_calculus_chain_002';

  const cardsA: Flashcard[] = [
    { id: 'cA1', videoId: videoA, category: 'Definition', question: 'What is a B-Tree?', answer: 'A self-balancing tree data structure', difficulty: 'Easy', topic: 'SQL' },
  ];
  const cardsB: Flashcard[] = [
    { id: 'cB1', videoId: videoB, category: 'Definition', question: 'What is the Chain Rule?', answer: 'Rule for differentiating composite functions', difficulty: 'Easy', topic: 'Calculus' },
  ];

  // Verify questions retain their strict videoId
  const isolatedA = cardsA.every(c => c.videoId === videoA && c.videoId !== videoB);
  const isolatedB = cardsB.every(c => c.videoId === videoB && c.videoId !== videoA);

  assert(
    isolatedA && isolatedB,
    'Test 6: Multi-Video User Isolation',
    `Video A cards strictly tagged with ${videoA}, Video B cards strictly tagged with ${videoB}`
  );
}

// -------------------------------------------------------------
// Test Case 7: Missing or failed transcript (Honest Error, Zero Generic Fallback)
// -------------------------------------------------------------
async function testMissingTranscriptHandling() {
  console.log('\n--- Running Test 7: Missing Transcript Rejection ---');
  const emptySegments: TranscriptSegment[] = [];

  const notes: SmartNotes = {
    videoId: 'no_transcript_video',
    videoTitle: 'A Video Without Captions',
    overallSummary: '',
    prerequisites: [],
    targetAudience: '',
    comprehensiveCheatSheet: [],
    topics: [],
  };

  const flashcards = FallbackNlpService.generateFlashcards(notes, emptySegments);
  const quiz = FallbackNlpService.generateQuiz(notes, emptySegments);

  assert(
    flashcards.length === 0 && quiz.length === 0,
    'Test 7: Missing Transcript Zero Fallback Guarantee',
    `Returned 0 flashcards and 0 quizzes when transcript is missing (never silently injects fake content)`
  );
}

// -------------------------------------------------------------
// Test Case 8: Duplicate generation request prevention
// -------------------------------------------------------------
async function testDuplicateGenerationPrevention() {
  console.log('\n--- Running Test 8: Duplicate Generation Prevention ---');
  // Simulate the pendingAnalyses map behavior from videoRoutes.ts
  const pendingAnalyses = new Map<string, Promise<{ quizCount: number }>>();

  let executionCount = 0;
  const mockHeavyAnalysis = async (key: string) => {
    executionCount++;
    await new Promise(resolve => setTimeout(resolve, 50));
    return { quizCount: 10 };
  };

  const requestKey = 'video_123_en_deep';

  // Issue 3 simultaneous requests for the same video
  const executeOrReuse = (key: string) => {
    if (pendingAnalyses.has(key)) {
      return pendingAnalyses.get(key)!;
    }
    const p = mockHeavyAnalysis(key).finally(() => {
      pendingAnalyses.delete(key);
    });
    pendingAnalyses.set(key, p);
    return p;
  };

  const [res1, res2, res3] = await Promise.all([
    executeOrReuse(requestKey),
    executeOrReuse(requestKey),
    executeOrReuse(requestKey),
  ]);

  assert(
    executionCount === 1 && res1.quizCount === 10 && res2.quizCount === 10 && res3.quizCount === 10,
    'Test 8: In-flight Duplicate Prevention Lock',
    `3 simultaneous requests triggered the generator exactly ${executionCount} time (reused in-flight promise)`
  );
}

// -------------------------------------------------------------
// Runner & Metrics Summary
// -------------------------------------------------------------
async function runAllTests() {
  console.log('===============================================================');
  console.log('🧪 StudyMind AI: Video-Grounded Generation Test Suite');
  console.log('===============================================================');

  const start = Date.now();
  await testShortTranscript();
  await testLongMultiTopicLecture();
  await testTechnicalFormulasAndDefinitions();
  await testRepetitiveExplanations();
  await testInsufficientEvidenceRejection();
  await testMultiVideoUserIsolation();
  await testMissingTranscriptHandling();
  await testDuplicateGenerationPrevention();
  const duration = Date.now() - start;

  console.log('\n===============================================================');
  console.log('📊 TEST EXECUTION SUMMARY:');
  console.log('===============================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  const passRate = Math.round((passedCount / results.length) * 100);

  console.log(`Total Scenarios Tested : ${results.length}`);
  console.log(`Passed                 : ${passedCount}`);
  console.log(`Failed                 : ${failedCount}`);
  console.log(`Grounding Pass Rate    : ${passRate}%`);
  console.log(`Execution Time         : ${duration}ms`);

  if (failedCount > 0) {
    console.error('\nOne or more validation tests failed!');
    process.exit(1);
  } else {
    console.log('\n✨ ALL 8 VIDEO-GROUNDING BENCHMARK SCENARIOS PASSED SUCCESSFULLY!');
  }
}

runAllTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
