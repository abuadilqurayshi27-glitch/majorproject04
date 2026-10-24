import { RecommendationTopic } from '../types/index.js';

// ── CS / Tech Domain (existing) ─────────────────────────────────────────────
const CS_PROGRESSION_GRAPH: Record<string, string[]> = {
  dbms: ['SQL Queries & Joins', 'Database Normalization (1NF to BCNF)', 'ACID Transactions & Concurrency Control', 'B-Tree & Hash Indexing', 'Entity Relationship (ER) Diagrams', 'Query Execution Plans & Optimization'],
  sql: ['Complex Joins & Subqueries', 'Window Functions & CTEs', 'Indexing Strategies', 'Stored Procedures & Triggers', 'Database Normalization'],
  python: ['Functions & Scopes', 'Object Oriented Programming (OOP)', 'Generators & Decorators', 'Data Structures (Lists, Dicts, Trees)', 'Asyncio & Concurrency', 'Unit Testing & Pytest'],
  javascript: ['Event Loop & Microtasks', 'Async/Await & Promises', 'Closures & Scope Chain', 'Prototypes & Classes', 'DOM Performance & Virtual DOM'],
  react: ['React Component Lifecycle', 'Hooks (useEffect, useMemo, useCallback)', 'State Management & Context API', 'Custom Hooks & Reusability', 'Server Components & SSR'],
  'data structures': ['Arrays & Linked Lists', 'Stacks & Queues', 'Binary Search Trees & Heaps', 'Graph Algorithms (BFS/DFS)', 'Dynamic Programming'],
  algorithms: ['Big-O Asymptotic Analysis', 'Divide and Conquer', 'Greedy Algorithms', 'Dynamic Programming', 'Graph Shortest Paths (Dijkstra, Bellman-Ford)'],
  'machine learning': ['Supervised vs Unsupervised Learning', 'Linear & Logistic Regression', 'Gradient Descent & Cost Functions', 'Neural Networks & Backpropagation', 'Transformers & Self-Attention'],
  networking: ['OSI 7-Layer Model', 'TCP 3-Way Handshake & UDP', 'DNS Resolution Flow', 'HTTP/1.1 vs HTTP/2 vs HTTP/3', 'TLS/SSL Security & Cryptography'],
  'operating systems': ['Process States & Scheduling Algorithms', 'Virtual Memory & Page Replacement', 'Mutex, Semaphores & Deadlocks', 'Inter-Process Communication (IPC)', 'File System Implementation'],
};

// ── High School / PUC Science ────────────────────────────────────────────────
const HS_SCIENCE_PROGRESSION: Record<string, string[]> = {
  physics: [
    'Motion & Laws of Motion (Newton\'s Laws)',
    'Work, Energy & Power',
    'Gravitation & Universal Law',
    'Light – Reflection & Refraction',
    'Electricity & Ohm\'s Law',
    'Magnetic Effects of Electric Current',
    'Wave Motion & Sound',
    'Heat & Thermodynamics',
  ],
  chemistry: [
    'Acids, Bases & Salts',
    'Chemical Reactions & Equations',
    'Metals & Non-Metals',
    'Carbon & Its Compounds',
    'Periodic Table & Periodicity',
    'Chemical Bonding (Ionic & Covalent)',
    'Electrochemistry',
    'Organic Chemistry Basics',
  ],
  biology: [
    'Cell Structure & Cell Division',
    'Life Processes (Nutrition, Respiration, Transport)',
    'Control & Coordination (Nervous & Endocrine System)',
    'How Do Organisms Reproduce?',
    'Heredity & Evolution',
    'Ecosystems & Biodiversity',
    'Human Diseases & Immune System',
    'Biotechnology Basics',
  ],
  mathematics: [
    'Real Numbers & Number Systems',
    'Polynomials & Factorization',
    'Linear Equations & Simultaneous Equations',
    'Quadratic Equations',
    'Arithmetic & Geometric Progressions',
    'Triangles, Similarity & Congruence',
    'Coordinate Geometry & Straight Lines',
    'Trigonometry & Its Applications',
    'Statistics & Probability',
    'Areas & Surface Areas',
  ],
  maths: [
    'Real Numbers & Number Systems',
    'Polynomials & Factorization',
    'Quadratic Equations',
    'Trigonometry & Its Applications',
    'Statistics & Probability',
  ],
};

// ── High School / PUC Commerce ───────────────────────────────────────────────
const HS_COMMERCE_PROGRESSION: Record<string, string[]> = {
  accountancy: [
    'Introduction to Accounting & Journal Entries',
    'Ledger Posting & Trial Balance',
    'Trading, Profit & Loss Account',
    'Balance Sheet Preparation',
    'Depreciation Methods (SLM & WDV)',
    'Bank Reconciliation Statement',
    'Bills of Exchange',
    'Partnership Accounts (Admission, Retirement)',
    'Company Accounts & Share Capital',
    'Cash Flow Statements',
  ],
  'business studies': [
    'Nature & Significance of Management',
    'Principles of Management (Fayol & Taylor)',
    'Planning & Decision Making',
    'Organizing & Staffing',
    'Directing & Leadership Styles',
    'Controlling & MBO',
    'Marketing Mix (4Ps)',
    'Consumer Protection Act',
    'Financial Markets & Stock Exchange',
  ],
  economics: [
    'Basic Economic Problems & Economic Systems',
    'Demand, Supply & Price Determination',
    'Consumer Behavior & Utility',
    'Production & Cost Concepts',
    'Market Structures (Perfect, Monopoly, Oligopoly)',
    'National Income & GDP Concepts',
    'Money, Banking & Credit Creation',
    'Government Budget & Fiscal Policy',
    'Balance of Payments & Foreign Exchange',
    'Indian Economy – Development & Poverty',
  ],
};

// ── High School Arts / Humanities ────────────────────────────────────────────
const HS_ARTS_PROGRESSION: Record<string, string[]> = {
  history: [
    'French Revolution & Nationalism in Europe',
    'Nationalism in India – Civil Disobedience Movement',
    'Rise of Hitler & Nazism',
    'World War I – Causes & Consequences',
    'World War II – Events & Aftermath',
    'Cold War & Decolonization',
    'Indian Independence & Partition (1947)',
    'Making of the Indian Constitution',
  ],
  'political science': [
    'Democracy & Its Features',
    'Indian Constitution – Fundamental Rights & DPSP',
    'Parliament & Legislature',
    'Executive – President, PM & Council of Ministers',
    'Judiciary – Supreme Court & Judicial Review',
    'Federalism in India',
    'Elections & Electoral System',
    'Political Parties & Pressure Groups',
  ],
  geography: [
    'Resources & Their Types',
    'Land Resources & Agriculture',
    'Water Resources & Management',
    'Forest & Wildlife Resources',
    'Minerals & Energy Resources',
    'Manufacturing Industries',
    'Transport & Communication',
    'Population & Human Development',
  ],
};

// ── Curated Videos — CS / Tech ───────────────────────────────────────────────
const CS_CURATED_VIDEOS: Record<string, Array<{ title: string; channel: string; youtubeId: string; thumbnail: string }>> = {
  dbms: [
    { title: 'Database Indexing Explained - B-Tree & Hash Index', channel: 'ByteByteGo', youtubeId: 'fsG1XaZEa78', thumbnail: 'https://img.youtube.com/vi/fsG1XaZEa78/hqdefault.jpg' },
    { title: 'Database Normalization - 1NF, 2NF, 3NF and BCNF', channel: 'FreeCodeCamp', youtubeId: 'GFQaEYEc8_8', thumbnail: 'https://img.youtube.com/vi/GFQaEYEc8_8/hqdefault.jpg' },
    { title: 'ACID Properties in DBMS - Transaction Management', channel: 'Gate Smashers', youtubeId: 'pwsrh_Jj0z4', thumbnail: 'https://img.youtube.com/vi/pwsrh_Jj0z4/hqdefault.jpg' },
  ],
  python: [
    { title: 'Python Object Oriented Programming (OOP) - For Beginners', channel: 'Corey Schafer', youtubeId: 'ZDa-Z5JzLYM', thumbnail: 'https://img.youtube.com/vi/ZDa-Z5JzLYM/hqdefault.jpg' },
    { title: 'Python Decorators in 15 Minutes', channel: 'ArjanCodes', youtubeId: 'r7Dtus7N4pI', thumbnail: 'https://img.youtube.com/vi/r7Dtus7N4pI/hqdefault.jpg' },
    { title: 'Python Asyncio & Concurrency Masterclass', channel: 'mCoding', youtubeId: '2IW-QT9dzho', thumbnail: 'https://img.youtube.com/vi/2IW-QT9dzho/hqdefault.jpg' },
  ],
  react: [
    { title: 'React Hooks Explained with Real Examples', channel: 'Web Dev Simplified', youtubeId: '0ZJgIjIuY7U', thumbnail: 'https://img.youtube.com/vi/0ZJgIjIuY7U/hqdefault.jpg' },
    { title: 'Mastering React State Management in 2026', channel: 'Jack Herrington', youtubeId: '5-1LM2NySR0', thumbnail: 'https://img.youtube.com/vi/5-1LM2NySR0/hqdefault.jpg' },
  ],
  algorithms: [
    { title: 'Dynamic Programming - Learn to Solve Any DP Problem', channel: 'FreeCodeCamp', youtubeId: 'oBt53YbR9Kk', thumbnail: 'https://img.youtube.com/vi/oBt53YbR9Kk/hqdefault.jpg' },
    { title: 'Graph Algorithms for Technical Interviews', channel: 'NeetCode', youtubeId: 'tWVWeAqZ0WU', thumbnail: 'https://img.youtube.com/vi/tWVWeAqZ0WU/hqdefault.jpg' },
  ],
  networking: [
    { title: 'How Does the Internet Work? - TCP/IP, DNS, Packets', channel: 'NetworkChuck', youtubeId: '7_LPdttKXPc', thumbnail: 'https://img.youtube.com/vi/7_LPdttKXPc/hqdefault.jpg' },
    { title: 'HTTP/3 and QUIC Protocol Deep Dive', channel: 'Hussein Nasser', youtubeId: 'cqoxT_r9f_o', thumbnail: 'https://img.youtube.com/vi/cqoxT_r9f_o/hqdefault.jpg' },
  ],
};

// ── Curated Videos — High School Science ─────────────────────────────────────
const HS_SCIENCE_CURATED: Record<string, Array<{ title: string; channel: string; youtubeId: string; thumbnail: string }>> = {
  physics: [
    { title: 'Laws of Motion – Newton\'s 3 Laws Explained Simply', channel: 'Physics Wallah', youtubeId: 'kKKM8Y-u7ds', thumbnail: 'https://img.youtube.com/vi/kKKM8Y-u7ds/hqdefault.jpg' },
    { title: 'Electricity Class 10 – Full Chapter | Ohm\'s Law, Circuits', channel: 'Vedantu', youtubeId: 'jRM8-znrOgc', thumbnail: 'https://img.youtube.com/vi/jRM8-znrOgc/hqdefault.jpg' },
    { title: 'Light – Reflection & Refraction Full Chapter Class 10', channel: 'Magnet Brains', youtubeId: 'kfFpK6NRnJs', thumbnail: 'https://img.youtube.com/vi/kfFpK6NRnJs/hqdefault.jpg' },
  ],
  chemistry: [
    { title: 'Chemical Reactions & Equations Class 10 Full Chapter', channel: 'Vedantu', youtubeId: 'y7mgPnE0iyA', thumbnail: 'https://img.youtube.com/vi/y7mgPnE0iyA/hqdefault.jpg' },
    { title: 'Acids Bases and Salts – Class 10 Science Chapter 2', channel: 'Physics Wallah', youtubeId: 'pXQsGe4bVMg', thumbnail: 'https://img.youtube.com/vi/pXQsGe4bVMg/hqdefault.jpg' },
    { title: 'Carbon and its Compounds – Full Chapter Explained', channel: 'Magnet Brains', youtubeId: 'BmTdmFx5b_8', thumbnail: 'https://img.youtube.com/vi/BmTdmFx5b_8/hqdefault.jpg' },
  ],
  biology: [
    { title: 'Life Processes Class 10 – Nutrition, Respiration, Transport', channel: 'Vedantu', youtubeId: 'EWrBBSjuDzk', thumbnail: 'https://img.youtube.com/vi/EWrBBSjuDzk/hqdefault.jpg' },
    { title: 'Heredity and Evolution Full Chapter – Class 10 Biology', channel: 'Physics Wallah', youtubeId: '2wM_nR4EeNE', thumbnail: 'https://img.youtube.com/vi/2wM_nR4EeNE/hqdefault.jpg' },
    { title: 'How Do Organisms Reproduce? – Class 10 Science', channel: 'Magnet Brains', youtubeId: 'Wk_w94Bnc8s', thumbnail: 'https://img.youtube.com/vi/Wk_w94Bnc8s/hqdefault.jpg' },
  ],
  mathematics: [
    { title: 'Quadratic Equations Class 10 – Complete Chapter', channel: 'Vedantu', youtubeId: 'kVjqX-KZDYI', thumbnail: 'https://img.youtube.com/vi/kVjqX-KZDYI/hqdefault.jpg' },
    { title: 'Trigonometry Class 10 – Ratios, Identities & Problems', channel: 'Physics Wallah', youtubeId: 'yBw67jOqmhM', thumbnail: 'https://img.youtube.com/vi/yBw67jOqmhM/hqdefault.jpg' },
    { title: 'Statistics & Probability – Class 10 Full Chapter', channel: 'Magnet Brains', youtubeId: 'LFi7PgKJDHQ', thumbnail: 'https://img.youtube.com/vi/LFi7PgKJDHQ/hqdefault.jpg' },
  ],
  maths: [
    { title: 'Quadratic Equations Class 10 – Complete Chapter', channel: 'Vedantu', youtubeId: 'kVjqX-KZDYI', thumbnail: 'https://img.youtube.com/vi/kVjqX-KZDYI/hqdefault.jpg' },
    { title: 'Trigonometry Class 10 – Ratios, Identities & Problems', channel: 'Physics Wallah', youtubeId: 'yBw67jOqmhM', thumbnail: 'https://img.youtube.com/vi/yBw67jOqmhM/hqdefault.jpg' },
  ],
};

// ── Curated Videos — High School Commerce ────────────────────────────────────
const HS_COMMERCE_CURATED: Record<string, Array<{ title: string; channel: string; youtubeId: string; thumbnail: string }>> = {
  accountancy: [
    { title: 'Journal Entries in Accounting – Basics with Examples', channel: 'Accountancy Knowledge', youtubeId: 'jQTfyMWs9u8', thumbnail: 'https://img.youtube.com/vi/jQTfyMWs9u8/hqdefault.jpg' },
    { title: 'Trial Balance & Final Accounts – Class 11 Accounts', channel: 'Commerce Wallah', youtubeId: 'OJ3_DZBVFYA', thumbnail: 'https://img.youtube.com/vi/OJ3_DZBVFYA/hqdefault.jpg' },
    { title: 'Depreciation Accounting – SLM & WDV Methods', channel: 'Letstute Accountancy', youtubeId: 'mBEl0TfCG18', thumbnail: 'https://img.youtube.com/vi/mBEl0TfCG18/hqdefault.jpg' },
  ],
  'business studies': [
    { title: 'Principles of Management – Fayol & Taylor Class 12', channel: 'Commerce Wallah', youtubeId: 'dkJmyv0cFQg', thumbnail: 'https://img.youtube.com/vi/dkJmyv0cFQg/hqdefault.jpg' },
    { title: 'Marketing Mix – 4Ps Explained with Examples', channel: 'Vedantu Commerce', youtubeId: 'bLWBMLVlsxo', thumbnail: 'https://img.youtube.com/vi/bLWBMLVlsxo/hqdefault.jpg' },
  ],
  economics: [
    { title: 'Demand & Supply – Law, Shifts & Price Determination', channel: 'Vedantu Commerce', youtubeId: 'g9aDizJpd0s', thumbnail: 'https://img.youtube.com/vi/g9aDizJpd0s/hqdefault.jpg' },
    { title: 'National Income – GDP, GNP, NNP Concepts Explained', channel: 'Commerce Wallah', youtubeId: 'FDlGze0yLh8', thumbnail: 'https://img.youtube.com/vi/FDlGze0yLh8/hqdefault.jpg' },
    { title: 'Indian Economy – Development, Poverty & Unemployment', channel: 'Physics Wallah Commerce', youtubeId: 'U5pRjzVKBUM', thumbnail: 'https://img.youtube.com/vi/U5pRjzVKBUM/hqdefault.jpg' },
  ],
};

// ── Curated Videos — High School Arts / Humanities ───────────────────────────
const HS_ARTS_CURATED: Record<string, Array<{ title: string; channel: string; youtubeId: string; thumbnail: string }>> = {
  history: [
    { title: 'French Revolution – Causes, Events & Impact | Class 9', channel: 'Magnet Brains', youtubeId: 'oc5n3bRwlHE', thumbnail: 'https://img.youtube.com/vi/oc5n3bRwlHE/hqdefault.jpg' },
    { title: 'Nationalism in India – Gandhi & Civil Disobedience', channel: 'Vedantu', youtubeId: 'M0n7lc6QIOA', thumbnail: 'https://img.youtube.com/vi/M0n7lc6QIOA/hqdefault.jpg' },
    { title: 'Rise of Hitler & World War II – Full Explanation', channel: 'Magnet Brains', youtubeId: 'xyliKYcGdS0', thumbnail: 'https://img.youtube.com/vi/xyliKYcGdS0/hqdefault.jpg' },
  ],
  'political science': [
    { title: 'Indian Constitution – Fundamental Rights & DPSP Explained', channel: 'Magnet Brains', youtubeId: 'ZeE9-VFGdCM', thumbnail: 'https://img.youtube.com/vi/ZeE9-VFGdCM/hqdefault.jpg' },
    { title: 'Federalism in India – Features & Centre-State Relations', channel: 'Vedantu', youtubeId: 'z8JJm5CtdUs', thumbnail: 'https://img.youtube.com/vi/z8JJm5CtdUs/hqdefault.jpg' },
  ],
  geography: [
    { title: 'Resources & Development – Class 10 Geography Chapter 1', channel: 'Magnet Brains', youtubeId: 'Jdz3g77Mu_4', thumbnail: 'https://img.youtube.com/vi/Jdz3g77Mu_4/hqdefault.jpg' },
    { title: 'Water Resources – Class 10 Geography Full Chapter', channel: 'Vedantu', youtubeId: 'S3byNJe94yY', thumbnail: 'https://img.youtube.com/vi/S3byNJe94yY/hqdefault.jpg' },
  ],
};

// ── Detection helpers ─────────────────────────────────────────────────────────

type StudentSegment = 'hs_science' | 'hs_commerce' | 'hs_arts' | 'puc_science' | 'puc_commerce' | 'puc_arts' | 'cs_tech' | 'unknown';

function detectStudentSegment(params: {
  education?: string;
  stream?: string;
  subjects?: string[];
  learningGoal?: string;
  studiedTopics?: string[];
  recentVideoTitles?: string[];
}): StudentSegment {
  const edu = (params.education || '').toLowerCase();
  const stream = (params.stream || '').toLowerCase();
  const allText = [
    ...(params.subjects || []),
    params.learningGoal || '',
    ...(params.studiedTopics || []),
    ...(params.recentVideoTitles || []),
  ].join(' ').toLowerCase();

  const isHighSchool = edu.includes('high school') || edu.includes('high_school');
  const isPUC = edu.includes('puc') || edu.includes('pre-university') || edu.includes('pre university');
  const isScience = stream.includes('science') || allText.includes('physics') || allText.includes('chemistry') || allText.includes('biology') || allText.includes('pcmb') || allText.includes('pcmc');
  const isCommerce = stream.includes('commerce') || allText.includes('accountancy') || allText.includes('business studies') || allText.includes('economics');
  const isArts = stream.includes('arts') || stream.includes('humanities') || allText.includes('history') || allText.includes('political science') || allText.includes('geography');

  if (isHighSchool && isScience) return 'hs_science';
  if (isHighSchool && isCommerce) return 'hs_commerce';
  if (isHighSchool && isArts) return 'hs_arts';
  if (isPUC && isScience) return 'puc_science';
  if (isPUC && isCommerce) return 'puc_commerce';
  if (isPUC && isArts) return 'puc_arts';

  return 'cs_tech';
}

function detectHSSubjectFromContext(allText: string, segment: StudentSegment): string[] {
  const subjects: string[] = [];

  if (segment === 'hs_science' || segment === 'puc_science') {
    if (allText.includes('physics') || allText.includes('motion') || allText.includes('electricity') || allText.includes('force') || allText.includes('light') || allText.includes('optics')) subjects.push('physics');
    if (allText.includes('chemistry') || allText.includes('reaction') || allText.includes('acid') || allText.includes('carbon') || allText.includes('periodic')) subjects.push('chemistry');
    if (allText.includes('biology') || allText.includes('cell') || allText.includes('heredity') || allText.includes('ecosystem') || allText.includes('reproduction')) subjects.push('biology');
    if (allText.includes('math') || allText.includes('algebra') || allText.includes('trigonometry') || allText.includes('polynomial') || allText.includes('statistics')) subjects.push('mathematics');
    if (subjects.length === 0) subjects.push('physics', 'chemistry', 'mathematics');
  } else if (segment === 'hs_commerce' || segment === 'puc_commerce') {
    if (allText.includes('account') || allText.includes('journal') || allText.includes('ledger') || allText.includes('balance sheet')) subjects.push('accountancy');
    if (allText.includes('business') || allText.includes('management') || allText.includes('marketing')) subjects.push('business studies');
    if (allText.includes('economics') || allText.includes('demand') || allText.includes('supply') || allText.includes('gdp')) subjects.push('economics');
    if (subjects.length === 0) subjects.push('accountancy', 'economics');
  } else if (segment === 'hs_arts' || segment === 'puc_arts') {
    if (allText.includes('history') || allText.includes('revolution') || allText.includes('nationalism') || allText.includes('war')) subjects.push('history');
    if (allText.includes('political') || allText.includes('constitution') || allText.includes('democracy') || allText.includes('parliament')) subjects.push('political science');
    if (allText.includes('geography') || allText.includes('resources') || allText.includes('climate') || allText.includes('agriculture')) subjects.push('geography');
    if (subjects.length === 0) subjects.push('history', 'political science');
  }

  return subjects;
}

export class RecommendationService {
  public static async getRecommendations(params: {
    studiedTopics: string[];
    weakTopics: string[];
    recentVideoTitles: string[];
    learningGoal?: string;
    education?: string;
    stream?: string;
    subjects?: string[];
    classLevel?: string;
    boardExam?: string;
  }): Promise<RecommendationTopic[]> {
    const { studiedTopics, weakTopics, recentVideoTitles, learningGoal, education, stream, subjects, classLevel, boardExam } = params;

    const allContextText = [
      ...studiedTopics,
      ...weakTopics,
      ...recentVideoTitles,
      learningGoal || '',
      ...(subjects || []),
    ].join(' ').toLowerCase();

    // Detect student segment
    const segment = detectStudentSegment({ education, stream, subjects, learningGoal, studiedTopics, recentVideoTitles });
    const isHighSchoolOrPUC = segment !== 'cs_tech' && segment !== 'unknown';

    if (isHighSchoolOrPUC) {
      return RecommendationService.getHighSchoolRecommendations({
        segment,
        studiedTopics,
        weakTopics,
        recentVideoTitles,
        allContextText,
        classLevel,
        boardExam,
      });
    }

    // ── CS / Tech recommendations (original logic) ───────────────────────────
    const matchedSubjects: string[] = [];
    for (const key of Object.keys(CS_PROGRESSION_GRAPH)) {
      if (allContextText.includes(key)) matchedSubjects.push(key);
    }
    const activeSubjects = matchedSubjects.length > 0 ? matchedSubjects : ['dbms', 'python', 'algorithms'];
    const recommendations: RecommendationTopic[] = [];

    for (const subject of activeSubjects.slice(0, 3)) {
      const progression = CS_PROGRESSION_GRAPH[subject] || [];
      const curated = CS_CURATED_VIDEOS[subject] || [
        { title: `Comprehensive Guide to ${subject.toUpperCase()}`, channel: 'Academic Foundation', youtubeId: 'fsG1XaZEa78', thumbnail: 'https://img.youtube.com/vi/fsG1XaZEa78/hqdefault.jpg' },
      ];
      const candidateTopics = progression.filter((p) => !studiedTopics.some((st) => st.toLowerCase().includes(p.toLowerCase())));
      const nextTopic = candidateTopics[0] || progression[progression.length - 1] || `${subject} Core`;
      const hasWeakArea = weakTopics.some((w) => w.toLowerCase().includes(subject));
      const reason = hasWeakArea
        ? `Recommended to strengthen weak areas identified in recent quizzes on ${subject.toUpperCase()}.`
        : `Logical next step following your study of ${recentVideoTitles[0] || subject.toUpperCase()}.`;

      recommendations.push({
        topic: nextTopic,
        subject: subject.toUpperCase(),
        reason,
        suggestedQueries: [
          `${nextTopic} tutorial for beginners`,
          `${nextTopic} step by step explanation`,
          `${subject} ${nextTopic} interview questions`,
        ],
        recommendedVideos: curated.map((v) => ({
          title: v.title,
          channel: v.channel,
          youtubeId: v.youtubeId,
          thumbnail: v.thumbnail,
          relevanceReason: `Covers ${nextTopic} in depth with high pedagogical clarity.`,
        })),
      });
    }

    return recommendations;
  }

  private static getHighSchoolRecommendations(params: {
    segment: StudentSegment;
    studiedTopics: string[];
    weakTopics: string[];
    recentVideoTitles: string[];
    allContextText: string;
    classLevel?: string;
    boardExam?: string;
  }): RecommendationTopic[] {
    const { segment, studiedTopics, weakTopics, recentVideoTitles, allContextText, classLevel, boardExam } = params;

    const recommendations: RecommendationTopic[] = [];
    const classLabel = classLevel ? `Class ${classLevel}` : 'Class 9/10';
    const boardLabel = boardExam || 'Board Exam';

    let progressionMap: Record<string, string[]>;
    let curatedMap: Record<string, Array<{ title: string; channel: string; youtubeId: string; thumbnail: string }>>;
    let subjectLabel: string;

    if (segment === 'hs_science' || segment === 'puc_science') {
      progressionMap = HS_SCIENCE_PROGRESSION;
      curatedMap = HS_SCIENCE_CURATED;
      subjectLabel = segment === 'puc_science' ? 'PUC Science' : 'HS Science';
    } else if (segment === 'hs_commerce' || segment === 'puc_commerce') {
      progressionMap = HS_COMMERCE_PROGRESSION;
      curatedMap = HS_COMMERCE_CURATED;
      subjectLabel = segment === 'puc_commerce' ? 'PUC Commerce' : 'HS Commerce';
    } else {
      progressionMap = HS_ARTS_PROGRESSION;
      curatedMap = HS_ARTS_CURATED;
      subjectLabel = segment === 'puc_arts' ? 'PUC Arts' : 'HS Arts';
    }

    // Detect which subjects are relevant for this student from context
    const relevantSubjects = detectHSSubjectFromContext(allContextText, segment);

    for (const subj of relevantSubjects.slice(0, 3)) {
      const progression = progressionMap[subj] || [];
      const curated = curatedMap[subj] || [
        { title: `${subj.charAt(0).toUpperCase() + subj.slice(1)} – Complete Board Exam Preparation`, channel: 'Vedantu', youtubeId: 'fsG1XaZEa78', thumbnail: 'https://img.youtube.com/vi/fsG1XaZEa78/hqdefault.jpg' },
      ];

      // Pick next topic not already studied
      const candidateTopics = progression.filter((p) => !studiedTopics.some((st) => st.toLowerCase().includes(p.split('–')[0].toLowerCase().trim())));
      const nextTopic = candidateTopics[0] || progression[progression.length - 1] || `${subj} Revision`;

      const hasWeakArea = weakTopics.some((w) => w.toLowerCase().includes(subj.split(' ')[0].toLowerCase()));
      let reason: string;
      if (hasWeakArea) {
        reason = `Your recent quiz identified weak areas in ${subj.charAt(0).toUpperCase() + subj.slice(1)}. Focus on this chapter before your ${boardLabel}.`;
      } else if (recentVideoTitles.length > 0) {
        reason = `Next chapter in your ${classLabel} ${subj.charAt(0).toUpperCase() + subj.slice(1)} syllabus after "${recentVideoTitles[0]}".`;
      } else {
        reason = `Important ${classLabel} ${boardLabel} chapter – high-weightage topic recommended for exam preparation.`;
      }

      recommendations.push({
        topic: nextTopic,
        subject: `${subjectLabel} – ${subj.charAt(0).toUpperCase() + subj.slice(1)}`,
        reason,
        suggestedQueries: [
          `${nextTopic} ${classLabel} ${boardLabel} explained`,
          `${nextTopic} class notes and solved examples`,
          `${subj} ${nextTopic} important questions ${boardLabel}`,
        ],
        recommendedVideos: curated.map((v) => ({
          title: v.title,
          channel: v.channel,
          youtubeId: v.youtubeId,
          thumbnail: v.thumbnail,
          relevanceReason: `Covers "${nextTopic}" with board-exam focus and clear explanations for ${classLabel} students.`,
        })),
      });
    }

    return recommendations;
  }
}
