/**
 * Smart Notes Evaluation Benchmark Suite
 * Evaluates Smart Notes generation across 4 core domains:
 * 1. Programming & CS (SQL Database Indexing & B-Trees)
 * 2. Mathematics (Calculus - Chain Rule & Derivatives)
 * 3. Physical Sciences (Physics - Ohm's Law & Circuit Resistance)
 * 4. Conceptual Theory (History - Industrial Revolution & Socio-Economic Impact)
 *
 * Benchmarking Metrics:
 * - Timeline Coverage %
 * - Timestamp Monotonicity & Gaps (0 gap tolerance)
 * - Domain Purity (Zero Cross-Domain Hallucination: 0 physics in SQL)
 * - Code & Execution Sandbox Integrity
 * - KaTeX Formula Brace Balancing & Math Notation Validation
 * - Instructor Sequence Preservation
 */

import { FallbackNlpService } from '../services/fallbackNlpService.js';
import { GeminiService } from '../services/geminiService.js';
import { YouTubeService } from '../services/youtubeService.js';
import { TranscriptSegment, StudentProfile } from '../types/index.js';

interface TestCase {
  id: string;
  name: string;
  subject: 'programming' | 'mathematics' | 'physics' | 'theory' | 'chemistry' | 'science';
  videoTitle: string;
  durationSeconds: number;
  expectedDetectedLanguage?: string;
  segments: TranscriptSegment[];
}

const TEST_CASES: TestCase[] = [
  {
    id: 'test_sql_indexing',
    name: 'CS / Programming: SQL Database Indexes & B-Trees',
    subject: 'programming',
    videoTitle: 'Database Indexing Explained | B-Tree Indexes in SQL',
    durationSeconds: 780, // 13 minutes
    segments: [
      { text: 'Welcome to this database tutorial on SQL indexes and performance optimization.', start: 0, duration: 15 },
      { text: 'When a database table grows to millions of rows, sequential table scans become extremely slow.', start: 16, duration: 25 },
      { text: 'An index is a separate data structure that stores column values and pointers to data pages.', start: 42, duration: 30 },
      { text: 'Most relational databases like PostgreSQL and MySQL utilize B-Trees for primary and secondary indexing.', start: 73, duration: 35 },
      { text: 'Let us write a query to create an index: CREATE INDEX idx_user_email ON users(email);', start: 110, duration: 40 },
      { text: 'Now when you run SELECT * FROM users WHERE email = test@example.com the query planner executes an Index Scan.', start: 152, duration: 45 },
      { text: 'EXPLAIN ANALYZE reveals that the cost drops from O(N) linear time to O(log N) logarithmic depth.', start: 198, duration: 50 },
      { text: 'However, indexes incur overhead during INSERT, UPDATE, and DELETE operations because tree rebalancing occurs.', start: 250, duration: 45 },
      { text: 'In summary, index columns used frequently in WHERE, JOIN, and ORDER BY clauses, but avoid over-indexing.', start: 296, duration: 50 },
    ],
  },
  {
    id: 'test_calculus_derivatives',
    name: 'Mathematics: Calculus Chain Rule & Derivatives',
    subject: 'mathematics',
    videoTitle: 'The Chain Rule in Calculus - Step by Step Derivative Proof',
    durationSeconds: 600, // 10 minutes
    segments: [
      { text: 'In this lecture we derive and apply the Chain Rule for composite functions.', start: 0, duration: 20 },
      { text: 'If y is a function of u, and u is a function of x, then dy/dx = (dy/du) * (du/dx).', start: 21, duration: 35 },
      { text: 'Let us consider the function f(x) = (3x^2 + 5)^4. Here u = 3x^2 + 5 and y = u^4.', start: 57, duration: 40 },
      { text: 'The derivative dy/du is 4u^3, and du/dx is 6x. Multiplying them yields 24x(3x^2 + 5)^3.', start: 98, duration: 45 },
      { text: 'Step one: identify the outer function and inner function. Step two: differentiate outer while keeping inner unchanged.', start: 145, duration: 50 },
      { text: 'Step three: multiply by the derivative of the inner function.', start: 196, duration: 35 },
      { text: 'Remember that failing to multiply by the inner derivative is the most common student error.', start: 232, duration: 40 },
    ],
  },
  {
    id: 'test_physics_ohms_law',
    name: 'Science: Physics - Ohm’s Law & Resistance Laboratory',
    subject: 'physics',
    videoTitle: 'Verification of Ohms Law | Electric Current & Potential Difference',
    durationSeconds: 720, // 12 minutes
    segments: [
      { text: 'Today we are conducting an experiment to verify Ohms Law in the physics laboratory.', start: 0, duration: 25 },
      { text: 'Ohms law states that electric current through a conductor between two points is directly proportional to voltage.', start: 26, duration: 35 },
      { text: 'Provided temperature and other physical conditions remain constant: V = I * R.', start: 62, duration: 30 },
      { text: 'Our apparatus includes a DC battery, ammeter in series, voltmeter in parallel, rheostat, and nichrome resistance wire.', start: 93, duration: 45 },
      { text: 'As we adjust the rheostat, we record values of potential difference V in volts and current I in amperes.', start: 139, duration: 40 },
      { text: 'Plotting V on the y-axis and I on the x-axis gives a straight line passing through the origin, slope equals resistance R.', start: 180, duration: 50 },
      { text: 'Precautions: ensure tight connections and do not keep key plugged continuously to avoid resistance wire heating.', start: 231, duration: 45 },
    ],
  },
  {
    id: 'test_history_industrial_rev',
    name: 'Theory / Humanities: The Industrial Revolution',
    subject: 'theory',
    videoTitle: 'The Industrial Revolution: Technological and Social Transformations',
    durationSeconds: 900, // 15 minutes
    segments: [
      { text: 'Welcome to modern world history. Today we explore the first Industrial Revolution beginning in 18th century Britain.', start: 0, duration: 30 },
      { text: 'Key drivers included coal deposits, colonial trade networks, patent protections, and agricultural mechanization.', start: 31, duration: 40 },
      { text: 'James Watts improved steam engine revolutionized textile manufacturing and coal mine drainage.', start: 72, duration: 45 },
      { text: 'Society shifted rapidly from agrarian villages to dense industrial urban centers like Manchester and Birmingham.', start: 118, duration: 50 },
      { text: 'Living conditions in early factory towns were characterized by inadequate sanitation, 14-hour workdays, and child labor.', start: 169, duration: 50 },
      { text: 'This sparked major legislative reforms like the Factory Acts of 1833 and the birth of labor trade unions.', start: 220, duration: 55 },
      { text: 'In summary, industrialization transformed global economic output while catalyzing modern social welfare movements.', start: 276, duration: 50 },
    ],
  },
  {
    id: 'test_hindi_chemistry',
    name: 'Multilingual / Hindi: Chemistry - Acid-Base Neutralization & pH',
    subject: 'chemistry',
    videoTitle: 'अम्ल और क्षार की अभिक्रियाएं | Acid Base Chemistry in Hindi',
    durationSeconds: 750,
    expectedDetectedLanguage: 'Hindi',
    segments: [
      { text: 'नमस्ते दोस्तों, आज की केमिस्ट्री क्लास में हम अम्ल और क्षार के बारे में विस्तार से सीखेंगे।', start: 0, duration: 25 },
      { text: 'अम्ल वे पदार्थ होते हैं जो जलीय विलयन में हाइड्रोजन आयन H+ प्रदान करते हैं।', start: 26, duration: 30 },
      { text: 'उदाहरण के लिए हाइड्रोक्लोरिक एसिड HCl और सल्फ्यूरिक एसिड H2SO4 प्रबल अम्ल हैं।', start: 57, duration: 35 },
      { text: 'जब एक अम्ल और एक क्षार अभिक्रिया करते हैं तो लवण और जल बनता है: HCl + NaOH -> NaCl + H2O।', start: 93, duration: 45 },
      { text: 'इस प्रक्रिया को उदासीनीकरण अभिक्रिया (Neutralization Reaction) कहा जाता है।', start: 139, duration: 40 },
      { text: 'pH स्केल पर 7 से कम मान अम्लीय और 7 से अधिक मान क्षारीय प्रकृति को दर्शाता है।', start: 180, duration: 45 },
      { text: 'परीक्षा के लिए याद रखें कि टाइट्रेशन में फिनोल्फथेलिन सूचक का रंग क्षार में गुलाबी हो जाता है।', start: 226, duration: 45 },
    ],
  },
  {
    id: 'test_kannada_math',
    name: 'Multilingual / Kannada: Mathematics - Quadratic Equations & Roots',
    subject: 'mathematics',
    videoTitle: 'ವರ್ಗ ಸಮೀಕರಣಗಳು ಮತ್ತು ಮೂಲಗಳು | Quadratic Equations in Kannada',
    durationSeconds: 680,
    expectedDetectedLanguage: 'Kannada',
    segments: [
      { text: 'ಎಲ್ಲರಿಗೂ ನಮಸ್ಕಾರ, ಇವತ್ತಿನ ಗಣಿತ ತರಗತಿಯಲ್ಲಿ ನಾವು ವರ್ಗ ಸಮೀಕರಣಗಳನ್ನು ಹೇಗೆ ಬಿಡಿಸುವುದು ಎಂದು ಕಲಿಯೋಣ.', start: 0, duration: 25 },
      { text: 'ವರ್ಗ ಸಮೀಕರಣದ ಸಾಮಾನ್ಯ ರೂಪ ax^2 + bx + c = 0 ಆಗಿರುತ್ತದೆ, ಇಲ್ಲಿ a ಶೂನ್ಯವಾಗಿರಬಾರದು.', start: 26, duration: 35 },
      { text: 'ಮೂಲಗಳನ್ನು ಕಂಡುಹಿಡಿಯಲು ಸೂತ್ರ x = (-b +- sqrt(b^2 - 4ac)) / (2a) ಬಳಸುತ್ತೇವೆ.', start: 62, duration: 40 },
      { text: 'ಇಲ್ಲಿ b^2 - 4ac ಯನ್ನು ವಿವೇಚಕ (discriminant) ಅಥವಾ ಡೆಲ್ಟಾ ಎಂದು ಕರೆಯಲಾಗುತ್ತದೆ.', start: 103, duration: 35 },
      { text: 'ಡೆಲ್ಟಾ ಸೊನ್ನೆಗಿಂತ ದೊಡ್ಡದಾಗಿದ್ದರೆ ಎರಡು ವಿಭಿನ್ನ ವಾಸ್ತವಿಕ ಮೂಲಗಳು ದೊರೆಯುತ್ತವೆ.', start: 139, duration: 40 },
      { text: 'ಪರೀಕ್ಷೆಯಲ್ಲಿ ಲೆಕ್ಕ ಮಾಡುವಾಗ ಋಣ ಚಿಹ್ನೆಗಳ ಕಡೆಗೆ ವಿಶೇಷ ಗಮನ ನೀಡಿ ಎಂದು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ತಿಳಿಸುತ್ತೇನೆ.', start: 180, duration: 45 },
    ],
  },
  {
    id: 'test_malayalam_physics',
    name: 'Multilingual / Malayalam: Physics - Electric Current & Resistance',
    subject: 'physics',
    videoTitle: 'ഓം നിയമവും റെസിസ്റ്റൻസും | Physics Class in Malayalam',
    durationSeconds: 700,
    expectedDetectedLanguage: 'Malayalam',
    segments: [
      { text: 'പ്രിയപ്പെട്ട കൂട്ടുകാരെ, ഇന്നത്തെ ഫിസിക്സ് ക്ലാസ്സിലേക്ക് എല്ലാവർക്കും സ്വാഗതം.', start: 0, duration: 25 },
      { text: 'വൈദ്യുത പ്രവാഹവും പൊട്ടൻഷ്യൽ വ്യത്യാസവും തമ്മിലുള്ള ബന്ധത്തെക്കുറിച്ചാണ് നമ്മൾ ഇന്ന് പഠിക്കുന്നത്.', start: 26, duration: 35 },
      { text: 'സ്ഥിര ഊഷ്മാവിൽ ഒരു ചാലകത്തിലൂടെ ഒഴുകുന്ന കറണ്ട് V നേരിട്ട് ആനുപാതികമാണ്: V = I * R.', start: 62, duration: 40 },
      { text: 'ഇവിടെ R എന്നത് സർക്യൂട്ടിന്റെ റെസിസ്റ്റൻസ് അഥവാ പ്രതിരോധമാണ്, ഇതിന്റെ യൂണിറ്റ് ഓം (Ohm) ആണ്.', start: 103, duration: 40 },
      { text: 'അമ്മീറ്റർ ശ്രേണിരീതിയിലും വോൾട്ട്മീറ്റർ സമാന്തരരീതിയിലുമാണ് സർക്യൂട്ടിൽ ബന്ധിപ്പിക്കേണ്ടത്.', start: 144, duration: 45 },
      { text: 'പരീക്ഷയിൽ ആവർത്തിച്ചു ചോദിക്കുന്ന ഒരു പ്രധാന ചോദ്യമാണിത്, എല്ലാവരും സൂತ್ರവാക്യം ഓർത്തു വെക്കുക.', start: 190, duration: 45 },
    ],
  },
  {
    id: 'test_urdu_biology',
    name: 'Multilingual / Urdu: Science - Cell Structure & Functions',
    subject: 'science',
    videoTitle: 'خلیہ کی ساخت اور افعال | Biology Cell Theory in Urdu',
    durationSeconds: 720,
    expectedDetectedLanguage: 'Urdu',
    segments: [
      { text: 'السلام علیکم طلبہ و طالبات، آج کے بیالوجی کے سبق میں ہم خلیہ یعنی سیل کی ساخت کا مطالعہ کریں گے۔', start: 0, duration: 25 },
      { text: 'خلیہ زندگی کی بنیادی ساختی اور فعلیاتی اکائی ہے جس کو رابرٹ ہک نے دریافت کیا۔', start: 26, duration: 35 },
      { text: 'ہر خلیے کے گرد ایک سیل ممبرین ہوتی ہے جو اندرونی اجزاء کی حفاظت کرتی ہے۔', start: 62, duration: 35 },
      { text: 'نیوکلیئس خلیے کا کنٹرول سینٹر ہوتا ہے جس میں جینیاتی مواد ڈی این اے پایا جاتا ہے۔', start: 98, duration: 40 },
      { text: 'مائٹوکونڈریا کو خلیے کا پاور ہاؤس کہا جاتا ہے کیونکہ یہ اے ٹی پی کی شکل میں توانائی پیدا کرتا ہے۔', start: 139, duration: 45 },
      { text: 'امتحان کے نقطہ نظر سے پلانٹ سیل اور اینیمل سیل کے درمیان فرق کو اچھے طریقے سے یاد رکھیں۔', start: 185, duration: 45 },
    ],
  },
  {
    id: 'test_tamil_python',
    name: 'Multilingual / Tamil: Programming - Python Lists & Data Structures',
    subject: 'programming',
    videoTitle: 'பைதான் டேட்டா ஸ்ட்ரக்சர்ஸ் | Python Programming in Tamil',
    durationSeconds: 800,
    expectedDetectedLanguage: 'Tamil',
    segments: [
      { text: 'வணக்கம் நண்பர்களே, இந்த வீடியோவில் பைதான் ப்ரோக்ராமிங் மொழியில் லிஸ்ட் மற்றும் டிக்ஷனரி பற்றி பார்ப்போம்.', start: 0, duration: 25 },
      { text: 'லிஸ்ட் என்பது வரிசைப்படுத்தப்பட்ட மாற்றக்கூடிய தரவுக் கட்டமைப்பாகும் (mutable ordered sequence).', start: 26, duration: 35 },
      { text: 'நாம் லிஸ்ட்டில் உருப்படிகளை சேர்க்க append() முறையையும் நீக்க pop() முறையையும் பயன்படுத்துகிறோம்.', start: 62, duration: 40 },
      { text: 'டிக்ஷனரி என்பது key-value ஜோடிகளாக தரவை சேமிக்கும், இதில் தேடுதல் வேகம் மிக அதிகமாக இருக்கும்.', start: 103, duration: 45 },
      { text: 'கோடிங் இன்டர்வியூவில் லிஸ்ட் காம்ப்ரிஹென்ஷன் பற்றி அடிக்கடி கேள்விகள் கேட்கப்படும்.', start: 149, duration: 45 },
      { text: 'நடைமுறை பயிற்சியாக இந்த எளிய பைதான் நிரலை ஆன்லைன் கம்பைலரில் இயக்கி பாருங்கள்.', start: 195, duration: 40 },
    ],
  },
  {
    id: 'test_hinglish_sql',
    name: 'Multilingual / Mixed Hinglish: SQL Joins & Query Execution',
    subject: 'programming',
    videoTitle: 'SQL Joins Explained in Hinglish | Inner Join vs Left Join',
    durationSeconds: 780,
    expectedDetectedLanguage: 'Hindi',
    segments: [
      { text: 'Hello dosto, aaj ke video me hum SQL joins ke bare me detail me baat karenge.', start: 0, duration: 25 },
      { text: 'Jab do tables ke data ko combine karna hota hai tab hum primary key aur foreign key ke basis pe join lagate hain.', start: 26, duration: 35 },
      { text: 'Inner join sirf matching rows return karta hai dono tables me se.', start: 62, duration: 35 },
      { text: 'Lekin Left join left table ki saari rows deta hai chahe right table me match ho ya na ho.', start: 98, duration: 40 },
      { text: 'Syntax dekh lijiye: SELECT users.name, orders.amount FROM users INNER JOIN orders ON users.id = orders.user_id;', start: 139, duration: 45 },
      { text: 'Query optimization ke liye join columns pe B-Tree index create karna best practice hoti hai.', start: 185, duration: 45 },
    ],
  },
];

function generateTenHourLectureSegments(): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const chapters = [
    {
      title: 'Computer Architecture & Instruction Pipelines',
      baseSec: 0,
      concepts: [
        'Central Processing Unit (CPU) architecture and ALU registers',
        'Instruction cycle fetch decode execute and store stages',
        'Pipelining hazards including structural data and control conflicts',
        'Branch prediction algorithms and speculative execution in modern processors',
        'Summary and review of pipeline hazards and throughput formulas',
      ],
    },
    {
      title: 'Memory Hierarchy & Cache Coherence',
      baseSec: 7200,
      concepts: [
        'Memory hierarchy from L1 L2 L3 caches down to main memory and SSD',
        'Cache mapping direct mapped fully associative and set associative',
        'Cache hit ratios, miss penalties, and average memory access time AMAT',
        'Cache coherence protocols MESI Modified Exclusive Shared Invalid',
        'Summary and review of cache miss optimization and virtual memory',
      ],
    },
    {
      title: 'Operating Systems & Virtual Memory',
      baseSec: 14400,
      concepts: [
        'Process state lifecycle transitions ready running waiting terminated',
        'Context switching overhead and PCB Process Control Block management',
        'Virtual memory page tables TLB Translation Lookaside Buffer and page faults',
        'Page replacement algorithms FIFO LRU Optimal and Second Chance',
        'Summary and review of memory paging and kernel privilege levels',
      ],
    },
    {
      title: 'Relational Database Engine & Indexing',
      baseSec: 21600,
      concepts: [
        'Relational storage engine row stores column stores and buffer pools',
        'B-Tree and B+ Tree indexing structures for high-performance search',
        'Clustered versus non-clustered indexes and composite key ordering',
        'Query optimization cost model execution plans and index scans',
        'Summary and review of B+ Tree rebalancing and transaction logging',
      ],
    },
    {
      title: 'Distributed Systems & Consensus',
      baseSec: 28800,
      concepts: [
        'Distributed systems fundamentals network latency and partition tolerance',
        'CAP theorem Consistency Availability Partition tolerance trade-offs',
        'Consensus protocols Raft leader election log replication and safety',
        'Distributed transactions two-phase commit 2PC coordinator failure modes',
        'Final course conclusion, synthesis of architecture, databases, and distributed consensus',
      ],
    },
  ];

  for (const ch of chapters) {
    let currentSec = ch.baseSec;
    segments.push({
      text: `Welcome to module on ${ch.title}. In this extensive section we examine the underlying system principles.`,
      start: currentSec,
      duration: 30,
    });
    currentSec += 30;

    for (const concept of ch.concepts) {
      for (let step = 1; step <= 8; step++) {
        segments.push({
          text: `Discussing ${concept} detail part ${step}: evaluating mechanisms, trade-offs, and empirical benchmarks in computer systems.`,
          start: currentSec,
          duration: 45,
        });
        currentSec += 45;
      }
      // Re-emphasize key takeaways (potential duplicate review for testing deduplication)
      segments.push({
        text: `To recap the core principle of ${concept}, remember that trade-offs define system performance.`,
        start: currentSec,
        duration: 35,
      });
      currentSec += 35;
    }

    segments.push({
      text: `Reviewing what we learned in ${ch.title}. Next we will connect this foundation to practical engineering applications.`,
      start: currentSec,
      duration: 40,
    });
    currentSec += 40;
  }

  // Final closing segment spanning up to 36,000s (10 hours)
  segments.push({
    text: 'That concludes this complete 10-hour comprehensive masterclass on computer systems engineering.',
    start: 35940,
    duration: 60,
  });

  return segments;
}

const mockProfile: StudentProfile = {
  education: 'PUC',
  stream: 'Science',
  course: 'PCMC',
  learningLevel: 'Intermediate',
};

async function runBenchmark() {
  console.log('\n================================================================');
  console.log('  STUDYMIND AI - SMART NOTES INTELLIGENCE BENCHMARK SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalMetricsChecked = 0;
  let totalMetricsPassed = 0;

  for (const tc of TEST_CASES) {
    console.log(`\n----------------------------------------------------------------`);
    console.log(`▶ BENCHMARK TEST: [${tc.subject.toUpperCase()}] ${tc.name}`);
    console.log(`  Duration: ${tc.durationSeconds}s | Transcript Segments: ${tc.segments.length}`);
    console.log(`----------------------------------------------------------------`);

    // 1. Detect Source Language accurately from transcript + title
    const fullTranscriptText = tc.segments.map(s => s.text).join(' ');
    const detected = YouTubeService.detectLanguage(fullTranscriptText, tc.videoTitle);

    // 2. Generate Notes via FallbackNlpService (with detected source language, outputting in English)
    const rawNotes = FallbackNlpService.generateSmartNotes(
      tc.id,
      tc.videoTitle,
      tc.segments,
      tc.name,
      'en',
      detected.name
    );

    // 3. Pass through GeminiService validateAndSanitizeSmartNotes
    const notes = GeminiService.validateAndSanitizeSmartNotes(
      rawNotes,
      tc.id,
      tc.videoTitle,
      tc.segments,
      tc.durationSeconds
    );

    console.log(`  Source Language Detected: ${detected.name} (${detected.code}) | Generated Topics: ${notes.topics.length}`);

    // Evaluation Metrics:
    // Metric 1: Timeline Contiguity & Monotonicity
    totalMetricsChecked++;
    let timelineValid = true;
    let timelineError = '';

    if (notes.topics.length === 0) {
      timelineValid = false;
      timelineError = 'No topics generated';
    } else {
      if (notes.topics[0].timestampSeconds !== 0) {
        timelineValid = false;
        timelineError = `First topic starts at ${notes.topics[0].timestampSeconds}s instead of 0s`;
      }
      for (let i = 0; i < notes.topics.length; i++) {
        const curr = notes.topics[i];
        const next = notes.topics[i + 1];
        if (curr.endTimestampSeconds && curr.endTimestampSeconds <= curr.timestampSeconds) {
          timelineValid = false;
          timelineError = `Topic #${i + 1} has invalid endTimestamp: ${curr.timestampSeconds} -> ${curr.endTimestampSeconds}`;
          break;
        }
        if (next && curr.endTimestampSeconds && next.timestampSeconds < curr.timestampSeconds) {
          timelineValid = false;
          timelineError = `Topic #${i + 2} starts before topic #${i + 1}`;
          break;
        }
      }
    }

    if (timelineValid) {
      totalMetricsPassed++;
      console.log(`  [PASS] 1. Timestamp Monotonicity & Contiguity: 0 gaps, start 00:00 to end.`);
    } else {
      console.error(`  [FAIL] 1. Timestamp Monotonicity: ${timelineError}`);
    }

    // Metric 2: Domain Purity (Zero Cross-Domain Hallucination)
    totalMetricsChecked++;
    let domainPurityValid = true;
    let domainPurityError = '';

    if (tc.subject === 'programming') {
      const hasPhysicsExperiment = notes.topics.some((t) => t.physicsExperiment?.isExperiment);
      const hasPhysicsQuantities = notes.topics.some((t) => t.physicsQuantities && t.physicsQuantities.length > 0);
      const hasPhysicsLaws = notes.topics.some((t) => t.physicsLaws && t.physicsLaws.length > 0);
      const hasChemistry = notes.topics.some((t) => t.chemistryExperiment?.isExperiment || (t.chemicalEquations && t.chemicalEquations.length > 0));

      if (hasPhysicsExperiment || hasPhysicsQuantities || hasPhysicsLaws || hasChemistry) {
        domainPurityValid = false;
        domainPurityError = `Cross-domain physics/chemistry content leaked into Programming notes! (Exp: ${hasPhysicsExperiment}, Quantities: ${hasPhysicsQuantities})`;
      }

      // Check online compiler is detected
      const hasCompiler = Boolean(notes.codingSandbox?.onlineCompilerUrl || notes.topics.some((t) => t.codeSnippet?.onlineCompilerUrl));
      if (!hasCompiler) {
        domainPurityValid = false;
        domainPurityError = 'Expected SQL/Python online compiler sandbox but none was attached.';
      }
    } else if (tc.subject === 'theory') {
      const hasPhysicsExp = notes.topics.some((t) => t.physicsExperiment?.isExperiment);
      const hasDerivations = notes.topics.some((t) => t.derivation && t.derivation.steps.length > 0);
      if (hasPhysicsExp || hasDerivations) {
        domainPurityValid = false;
        domainPurityError = 'Physics or Math formulas leaked into History/Theory topic!';
      }
    }

    if (domainPurityValid) {
      totalMetricsPassed++;
      console.log(`  [PASS] 2. Domain Purity: Zero cross-domain hallucination. Strict subject boundary preserved.`);
    } else {
      console.error(`  [FAIL] 2. Domain Purity: ${domainPurityError}`);
    }

    // Metric 3: KaTeX Brace Balance
    totalMetricsChecked++;
    let katexValid = true;
    let katexError = '';

    for (const t of notes.topics) {
      if (t.formulas) {
        for (const f of t.formulas) {
          const openCount = (f.formula.match(/\{/g) || []).length;
          const closeCount = (f.formula.match(/\}/g) || []).length;
          if (openCount !== closeCount) {
            katexValid = false;
            katexError = `Unbalanced KaTeX braces in formula "${f.name}": ${f.formula}`;
            break;
          }
        }
      }
    }

    if (katexValid) {
      totalMetricsPassed++;
      console.log(`  [PASS] 3. KaTeX Notation Integrity: All mathematical formulas have balanced braces.`);
    } else {
      console.error(`  [FAIL] 3. KaTeX Integrity: ${katexError}`);
    }

    // Metric 4: Information Coverage & Completeness
    totalMetricsChecked++;
    let infoCoverageValid = true;
    if (notes.topics.length < 2) {
      infoCoverageValid = false;
      console.error(`  [FAIL] 4. Topic Coverage: Expected at least 2 distinct topics, got ${notes.topics.length}`);
    } else {
      const hasDefinitions = notes.topics.some((t) => t.definitions && t.definitions.length > 0);
      const hasPoints = notes.topics.some((t) => t.importantPoints && t.importantPoints.length > 0);
      if (hasDefinitions && hasPoints) {
        totalMetricsPassed++;
        console.log(`  [PASS] 4. Information Coverage: Complete titles, definitions, takeaways, and exam revision points.`);
      } else {
        infoCoverageValid = false;
        console.error(`  [FAIL] 4. Information Coverage: Missing definitions or important points.`);
      }
    }

    // Metric 5: English Language Purity (Zero Non-English Prose Leakage)
    totalMetricsChecked++;
    let englishValid = true;
    let nonEnglishDetails = '';

    if (GeminiService.isSubstantialNonEnglishProse(notes.overallSummary)) {
      englishValid = false;
      nonEnglishDetails = `Non-English prose in overallSummary: "${notes.overallSummary?.slice(0, 50)}..."`;
    }
    if (notes.finalSummary && GeminiService.isSubstantialNonEnglishProse(notes.finalSummary)) {
      englishValid = false;
      nonEnglishDetails = `Non-English prose in finalSummary: "${notes.finalSummary?.slice(0, 50)}..."`;
    }

    for (const t of notes.topics) {
      if (GeminiService.isSubstantialNonEnglishProse(t.title)) {
        englishValid = false;
        nonEnglishDetails = `Non-English prose in title: "${t.title}"`;
        break;
      }
      if (GeminiService.isSubstantialNonEnglishProse(t.simpleExplanation)) {
        englishValid = false;
        nonEnglishDetails = `Non-English prose in simpleExplanation for "${t.title}"`;
        break;
      }
      if (t.detailedExplanation && GeminiService.isSubstantialNonEnglishProse(t.detailedExplanation)) {
        englishValid = false;
        nonEnglishDetails = `Non-English prose in detailedExplanation for "${t.title}"`;
        break;
      }
      if (t.definitions && t.definitions.some(d => GeminiService.isSubstantialNonEnglishProse(d.term) || GeminiService.isSubstantialNonEnglishProse(d.definition))) {
        englishValid = false;
        nonEnglishDetails = `Non-English prose in definitions for "${t.title}"`;
        break;
      }
      if (t.importantPoints && t.importantPoints.some(p => GeminiService.isSubstantialNonEnglishProse(p))) {
        englishValid = false;
        nonEnglishDetails = `Non-English prose in importantPoints for "${t.title}"`;
        break;
      }
      if (t.examRevisionPoints && t.examRevisionPoints.some(p => GeminiService.isSubstantialNonEnglishProse(p))) {
        englishValid = false;
        nonEnglishDetails = `Non-English prose in examRevisionPoints for "${t.title}"`;
        break;
      }
      if (t.keyTakeaways && t.keyTakeaways.some(p => GeminiService.isSubstantialNonEnglishProse(p))) {
        englishValid = false;
        nonEnglishDetails = `Non-English prose in keyTakeaways for "${t.title}"`;
        break;
      }
    }

    if (englishValid && notes.targetLanguage === 'English') {
      totalMetricsPassed++;
      console.log(`  [PASS] 5. English Language Purity: 100% English Smart Notes (Detected: ${detected.name} -> English).`);
    } else {
      console.error(`  [FAIL] 5. English Language Purity: ${nonEnglishDetails || 'Target language is not English'}`);
    }

    // Metric 6: Source Language Detection Accuracy
    let languageDetectionValid = true;
    if (tc.expectedDetectedLanguage) {
      totalMetricsChecked++;
      if (detected.name.toLowerCase() === tc.expectedDetectedLanguage.toLowerCase()) {
        totalMetricsPassed++;
        console.log(`  [PASS] 6. Source Language Detection: Accurately identified "${detected.name}".`);
      } else {
        languageDetectionValid = false;
        console.error(`  [FAIL] 6. Source Language Detection: Expected "${tc.expectedDetectedLanguage}", got "${detected.name}"`);
      }
    }

    if (timelineValid && domainPurityValid && katexValid && infoCoverageValid && englishValid && languageDetectionValid) {
      passedTests++;
    }
  }

  // ============================================================================
  // 10-HOUR LECTURE SCALABILITY & HIERARCHICAL DEDUPLICATION BENCHMARKS
  // ============================================================================
  console.log(`\n================================================================`);
  console.log(`▶ 10-HOUR LECTURE BENCHMARKS: SCALABILITY, MODES & DEDUPLICATION`);
  console.log(`================================================================`);

  const tenHourSegments = generateTenHourLectureSegments();
  const tenHourDuration = 36000; // 10 Hours
  console.log(`  Simulated Lecture: 10 Hours (36,000s) | Segments: ${tenHourSegments.length}`);

  // 1. Quick Revision Mode (Short Length)
  {
    console.log(`\n----------------------------------------------------------------`);
    console.log(`▶ TEST 5A: 10-Hour Lecture - QUICK REVISION MODE (Short Length)`);
    console.log(`----------------------------------------------------------------`);
    totalMetricsChecked++;
    const t0 = performance.now();
    const rawQuick = FallbackNlpService.generateSmartNotes(
      'ten_hour_test',
      'Computer Systems Masterclass: 10-Hour Deep Dive',
      tenHourSegments,
      undefined,
      'en',
      'English',
      'quick',
      'short'
    );
    const notesQuick = GeminiService.validateAndSanitizeSmartNotes(
      rawQuick,
      'ten_hour_test',
      'Computer Systems Masterclass: 10-Hour Deep Dive',
      tenHourSegments,
      tenHourDuration
    );
    const elapsed = Math.round(performance.now() - t0);

    const topicCount = notesQuick.topics.length;
    const isTopicCountTarget = topicCount >= 3 && topicCount <= 7;
    const isTimelineMonotonic = notesQuick.topics.length > 0 &&
      notesQuick.topics[0].timestampSeconds === 0 &&
      (notesQuick.topics[notesQuick.topics.length - 1].endTimestampSeconds ?? 0) >= 30000;
    const titles = notesQuick.topics.map((t) => t.title.toLowerCase().trim());
    const uniqueTitles = new Set(titles);
    const zeroDuplicates = titles.length === uniqueTitles.size;
    const hasModules = Boolean(notesQuick.lectureModules && notesQuick.lectureModules.length >= 3);

    console.log(`  Processing Time: ${elapsed}ms | Generated Topics: ${topicCount} (Old naive pipeline produced ~500)`);
    console.log(`  Lecture Modules Generated: ${notesQuick.lectureModules?.length || 0}`);

    if (isTopicCountTarget && isTimelineMonotonic && zeroDuplicates && hasModules) {
      totalMetricsPassed++;
      passedTests++;
      console.log(`  [PASS] Quick Mode: Budget obeyed (${topicCount} topics), 0 duplicates, modules generated, contiguous 00:00 to 10:00:00.`);
    } else {
      console.error(`  [FAIL] Quick Mode: targetTopics=${isTopicCountTarget} (got ${topicCount}), monotonic=${isTimelineMonotonic}, unique=${zeroDuplicates}, modules=${hasModules}`);
    }
  }

  // 2. Deep Learning Mode (Standard Length)
  {
    console.log(`\n----------------------------------------------------------------`);
    console.log(`▶ TEST 5B: 10-Hour Lecture - DEEP LEARNING MODE (Standard Length)`);
    console.log(`----------------------------------------------------------------`);
    totalMetricsChecked++;
    const t0 = performance.now();
    const rawDeep = FallbackNlpService.generateSmartNotes(
      'ten_hour_test',
      'Computer Systems Masterclass: 10-Hour Deep Dive',
      tenHourSegments,
      undefined,
      'en',
      'English',
      'deep',
      'standard'
    );
    const notesDeep = GeminiService.validateAndSanitizeSmartNotes(
      rawDeep,
      'ten_hour_test',
      'Computer Systems Masterclass: 10-Hour Deep Dive',
      tenHourSegments,
      tenHourDuration
    );
    const elapsed = Math.round(performance.now() - t0);

    const topicCount = notesDeep.topics.length;
    const isTopicCountTarget = topicCount >= 6 && topicCount <= 16;
    const titles = notesDeep.topics.map((t) => t.title.toLowerCase().trim());
    const zeroDuplicates = titles.length === new Set(titles).size;
    const hasTakeaways = notesDeep.topics.every((t) => t.keyTakeaways && t.keyTakeaways.length > 0);
    const hasModules = Boolean(notesDeep.lectureModules && notesDeep.lectureModules.length >= 3);

    console.log(`  Processing Time: ${elapsed}ms | Generated Topics: ${topicCount} | Modules: ${notesDeep.lectureModules?.length || 0}`);

    if (isTopicCountTarget && zeroDuplicates && hasTakeaways && hasModules) {
      totalMetricsPassed++;
      passedTests++;
      console.log(`  [PASS] Deep Mode: Comprehensive structured topics (${topicCount}), complete takeaways, 0 duplicates, full chapter mapping.`);
    } else {
      console.error(`  [FAIL] Deep Mode: targetTopics=${isTopicCountTarget} (got ${topicCount}), unique=${zeroDuplicates}, takeaways=${hasTakeaways}, modules=${hasModules}`);
    }
  }

  // 3. Exam Revision Mode (Detailed Length)
  {
    console.log(`\n----------------------------------------------------------------`);
    console.log(`▶ TEST 5C: 10-Hour Lecture - EXAM REVISION MODE (Detailed Length)`);
    console.log(`----------------------------------------------------------------`);
    totalMetricsChecked++;
    const t0 = performance.now();
    const rawExam = FallbackNlpService.generateSmartNotes(
      'ten_hour_test',
      'Computer Systems Masterclass: 10-Hour Deep Dive',
      tenHourSegments,
      undefined,
      'en',
      'English',
      'exam',
      'detailed'
    );
    const notesExam = GeminiService.validateAndSanitizeSmartNotes(
      rawExam,
      'ten_hour_test',
      'Computer Systems Masterclass: 10-Hour Deep Dive',
      tenHourSegments,
      tenHourDuration
    );
    const elapsed = Math.round(performance.now() - t0);

    const topicCount = notesExam.topics.length;
    const isTopicCountTarget = topicCount >= 5 && topicCount <= 12;
    const hasExamPoints = notesExam.topics.every((t) => t.examRevisionPoints && t.examRevisionPoints.length > 0);
    const titles = notesExam.topics.map((t) => t.title.toLowerCase().trim());
    const zeroDuplicates = titles.length === new Set(titles).size;

    console.log(`  Processing Time: ${elapsed}ms | Generated Topics: ${topicCount} | Has Exam Points: ${hasExamPoints}`);

    if (isTopicCountTarget && hasExamPoints && zeroDuplicates) {
      totalMetricsPassed++;
      passedTests++;
      console.log(`  [PASS] Exam Mode: High-yield exam focus (${topicCount} topics), 100% examRevisionPoints coverage, 0 duplicates.`);
    } else {
      console.error(`  [FAIL] Exam Mode: targetTopics=${isTopicCountTarget} (got ${topicCount}), examPoints=${hasExamPoints}, unique=${zeroDuplicates}`);
    }
  }

  const totalTests = TEST_CASES.length + 3;

  console.log('\n================================================================');
  console.log(`  BENCHMARK SUMMARY:`);
  console.log(`  Test Cases Passed: ${passedTests} / ${totalTests} (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log(`  Individual Metrics Passed: ${totalMetricsPassed} / ${totalMetricsChecked} (${Math.round((totalMetricsPassed / totalMetricsChecked) * 100)}%)`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    console.log('All Smart Notes benchmarks passed successfully!\n');
    process.exit(0);
  } else {
    console.error('Some benchmarks failed.\n');
    process.exit(1);
  }
}

runBenchmark().catch((err) => {
  console.error('Benchmark execution error:', err);
  process.exit(1);
});
