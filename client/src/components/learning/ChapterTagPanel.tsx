import React, { useState } from 'react';
import { BookMarked, ChevronDown, ChevronUp, Tag, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface ChapterTag {
  subject: string;
  chapterNumber?: number;
  chapterName: string;
  classLevel?: string;
  boardExam?: string;
}

interface ChapterTagPanelProps {
  onTagSaved?: (tag: ChapterTag) => void;
  existingTag?: ChapterTag;
}

const CHAPTER_PRESETS: Record<string, Record<string, string[]>> = {
  Physics: {
    '9': ['Motion', "Force and Newton's Laws of Motion", 'Gravitation', 'Work, Energy and Power', 'Sound'],
    '10': ['Light – Reflection and Refraction', 'Human Eye and the Colourful World', 'Electricity', 'Magnetic Effects of Electric Current', 'Sources of Energy'],
    '11': ['Physical World and Measurement', 'Kinematics', 'Laws of Motion', 'Work, Energy and Power', 'Motion of System of Particles and Rigid Body', 'Gravitation', 'Properties of Bulk Matter', 'Thermodynamics', 'Behaviour of Perfect Gas and Kinetic Theory', 'Oscillations and Waves'],
    '12': ['Electric Charges and Fields', 'Electrostatic Potential and Capacitance', 'Current Electricity', 'Moving Charges and Magnetism', 'Magnetism and Matter', 'Electromagnetic Induction', 'Alternating Current', 'Electromagnetic Waves', 'Ray Optics and Optical Instruments', 'Wave Optics', 'Dual Nature of Radiation and Matter', 'Atoms', 'Nuclei', 'Semiconductor Electronics'],
  },
  Chemistry: {
    '9': ['Matter in Our Surroundings', 'Is Matter Around Us Pure?', 'Atoms and Molecules', 'Structure of the Atom'],
    '10': ['Chemical Reactions and Equations', 'Acids, Bases and Salts', 'Metals and Non-metals', 'Carbon and Its Compounds', 'Periodic Classification of Elements'],
    '11': ['Some Basic Concepts of Chemistry', 'Structure of Atom', 'Classification of Elements and Periodicity in Properties', 'Chemical Bonding and Molecular Structure', 'States of Matter', 'Thermodynamics', 'Equilibrium', 'Redox Reactions', 'Hydrogen', 's-Block Elements', 'Some p-Block Elements', 'Organic Chemistry – Basic Principles', 'Hydrocarbons', 'Environmental Chemistry'],
    '12': ['The Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'd and f Block Elements', 'Coordination Compounds', 'Haloalkanes and Haloarenes', 'Alcohols, Phenols and Ethers', 'Aldehydes, Ketones and Carboxylic Acids', 'Amines', 'Biomolecules', 'Polymers', 'Chemistry in Everyday Life'],
  },
  Biology: {
    '9': ['The Fundamental Unit of Life', 'Tissues', 'Diversity in Living Organisms', 'Why do We Fall Ill?', 'Natural Resources'],
    '10': ['Life Processes', 'Control and Coordination', 'How Do Organisms Reproduce?', 'Heredity and Evolution', 'Our Environment', 'Sustainable Management of Natural Resources'],
    '11': ['The Living World', 'Biological Classification', 'Plant Kingdom', 'Animal Kingdom', 'Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 'Structural Organisation in Animals', 'Cell – The Unit of Life', 'Biomolecules', 'Cell Cycle and Cell Division', 'Photosynthesis in Higher Plants', 'Respiration in Plants', 'Plant Growth and Development', 'Breathing and Exchange of Gases', 'Body Fluids and Circulation', 'Excretory Products', 'Locomotion and Movement', 'Neural Control and Coordination', 'Chemical Coordination and Integration'],
    '12': ['Reproduction in Organisms', 'Sexual Reproduction in Flowering Plants', 'Human Reproduction', 'Reproductive Health', 'Principles of Inheritance and Variation', 'Molecular Basis of Inheritance', 'Evolution', 'Human Health and Disease', 'Strategies for Enhancement in Food Production', 'Microbes in Human Welfare', 'Biotechnology – Principles and Processes', 'Biotechnology and Its Applications', 'Organisms and Populations', 'Ecosystem', 'Biodiversity and Conservation', 'Environmental Issues'],
  },
  Mathematics: {
    '9': ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations in Two Variables', "Introduction to Euclid's Geometry", 'Lines and Angles', 'Triangles', 'Quadrilaterals', 'Circles', "Heron's Formula", 'Surface Areas and Volumes', 'Statistics', 'Probability'],
    '10': ['Real Numbers', 'Polynomials', 'Pair of Linear Equations in Two Variables', 'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Introduction to Trigonometry', 'Some Applications of Trigonometry', 'Circles', 'Areas Related to Circles', 'Surface Areas and Volumes', 'Statistics', 'Probability'],
    '11': ['Sets', 'Relations and Functions', 'Trigonometric Functions', 'Principle of Mathematical Induction', 'Complex Numbers and Quadratic Equations', 'Linear Inequalities', 'Permutations and Combinations', 'Binomial Theorem', 'Sequences and Series', 'Straight Lines', 'Conic Sections', 'Introduction to Three Dimensional Geometry', 'Limits and Derivatives', 'Mathematical Reasoning', 'Statistics', 'Probability'],
    '12': ['Relations and Functions', 'Inverse Trigonometric Functions', 'Matrices', 'Determinants', 'Continuity and Differentiability', 'Application of Derivatives', 'Integrals', 'Application of Integrals', 'Differential Equations', 'Vector Algebra', 'Three Dimensional Geometry', 'Linear Programming', 'Probability'],
  },
  History: {
    '9': ['The French Revolution', 'Socialism in Europe and the Russian Revolution', 'Nazism and the Rise of Hitler', 'Forest Society and Colonialism', 'Pastoralists in the Modern World'],
    '10': ['The Rise of Nationalism in Europe', 'Nationalism in India', 'The Making of a Global World', 'The Age of Industrialisation', 'Print Culture and the Modern World'],
    '11': ['From the Beginning of Time', 'Writing and City Life', 'An Empire Across Three Continents', 'The Central Islamic Lands', 'Nomadic Empires', 'The Three Orders', 'Changing Cultural Traditions', 'Confrontation of Cultures', 'The Industrial Revolution', 'Displacing Indigenous Peoples', 'Paths to Modernisation'],
    '12': ['Bricks, Beads and Bones – Harappan Civilisation', 'Kings, Farmers and Towns', 'Kinship, Caste and Class', 'Thinkers, Beliefs and Buildings', 'Through the Eyes of Travellers', 'Bhakti-Sufi Traditions', 'An Imperial Capital: Vijayanagara', 'Peasants, Zamindars and the State', 'Kings and Chronicles – The Mughal Courts', 'Colonialism and the Countryside', 'Rebels and the Raj – 1857 Revolt', 'Colonial Cities', 'Mahatma Gandhi and the Nationalist Movement', 'Understanding Partition', 'Framing the Constitution'],
  },
  'Political Science': {
    '9': ['Democracy in the Contemporary World', 'What is Democracy? Why Democracy?', 'Constitutional Design', 'Electoral Politics', 'Working of Institutions', 'Democratic Rights'],
    '10': ['Power Sharing', 'Federalism', 'Democracy and Diversity', 'Gender, Religion and Caste', 'Popular Struggles and Movements', 'Political Parties', 'Outcomes of Democracy', 'Challenges to Democracy'],
  },
  Geography: {
    '9': ['India – Size and Location', 'Physical Features of India', 'Drainage', 'Climate', 'Natural Vegetation and Wildlife', 'Population'],
    '10': ['Resources and Development', 'Forest and Wildlife Resources', 'Water Resources', 'Agriculture', 'Minerals and Energy Resources', 'Manufacturing Industries', 'Lifelines of National Economy'],
  },
  Accountancy: {
    '11': ['Introduction to Accounting', 'Theory Base of Accounting', 'Recording of Transactions – I', 'Recording of Transactions – II', 'Bank Reconciliation Statement', 'Trial Balance and Rectification of Errors', 'Depreciation, Provisions and Reserves', 'Bills of Exchange', 'Financial Statements – I', 'Financial Statements – II', 'Accounts from Incomplete Records'],
    '12': ['Accounting for Partnership Firms – Fundamentals', 'Reconstitution of a Partnership Firm – Admission', 'Reconstitution of a Partnership Firm – Retirement/Death', 'Dissolution of a Partnership Firm', 'Accounting for Share Capital', 'Issue and Redemption of Debentures', 'Financial Statements of a Company', 'Analysis of Financial Statements', 'Accounting Ratios', 'Cash Flow Statement'],
  },
  Economics: {
    '9': ['The Story of Village Palampur', 'People as Resource', 'Poverty as a Challenge', 'Food Security in India'],
    '10': ['Development', 'Sectors of the Indian Economy', 'Money and Credit', 'Globalisation and the Indian Economy', 'Consumer Rights'],
    '11': ['Introduction to Economics', 'Consumer Equilibrium and Demand', 'Producer Behaviour and Supply', 'Forms of Market and Price Determination', 'Indian Economy on the Eve of Independence', 'Indian Economy (1950–1990)', 'Liberalisation, Privatisation and Globalisation', 'Poverty', 'Human Capital Formation in India', 'Rural Development', 'Employment – Growth and Informalisation', 'Infrastructure', 'Environment and Sustainable Development'],
    '12': ['Introduction to Macroeconomics', 'National Income Accounting', 'Money and Banking', 'Income Determination', 'Government Budget and the Economy', 'Open Economy Macroeconomics'],
  },
};

const HS_PUC_SUBJECTS = Object.keys(CHAPTER_PRESETS);

export const ChapterTagPanel: React.FC<ChapterTagPanelProps> = ({ onTagSaved, existingTag }) => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState(existingTag?.subject || profile?.subjects?.[0] || 'Physics');
  const [chapterName, setChapterName] = useState(existingTag?.chapterName || '');
  const [chapterNumber, setChapterNumber] = useState<number | undefined>(existingTag?.chapterNumber);
  const [saved, setSaved] = useState(!!existingTag);

  const isEligible = profile?.education === 'High School' || profile?.education === 'PUC';
  if (!isEligible) return null;

  const classLevel = profile?.classLevel || (profile?.education === 'PUC' ? '11' : '10');
  const boardExam = profile?.boardExam || 'Board';
  const chapterList = CHAPTER_PRESETS[subject]?.[classLevel] || [];

  const handleSave = () => {
    if (!chapterName.trim()) return;
    const tag: ChapterTag = { subject, chapterName: chapterName.trim(), chapterNumber, classLevel, boardExam };
    onTagSaved?.(tag);
    setSaved(true);
    setIsOpen(false);
  };

  const handleChapterSelect = (ch: string, idx: number) => {
    setChapterName(ch);
    setChapterNumber(idx + 1);
  };

  return (
    <div className="rounded-2xl border border-indigo-800/50 bg-indigo-950/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-indigo-900/10 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <BookMarked className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-indigo-300">Chapter Tag</span>
          {saved && existingTag ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900 border border-indigo-700 text-indigo-300 font-semibold">
              {existingTag.subject} › Ch.{existingTag.chapterNumber} – {existingTag.chapterName.slice(0, 30)}{existingTag.chapterName.length > 30 ? '…' : ''}
            </span>
          ) : (
            <span className="text-[10px] text-indigo-400/60">Tag to {boardExam} Class {classLevel} chapter</span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-indigo-400" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-indigo-800/40">
          <p className="text-[11px] text-indigo-300/60 pt-3">
            Tag this video to your {boardExam} Class {classLevel} syllabus to get chapter-aligned recommendations and AI tutor context.
          </p>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Subject</label>
            <div className="flex flex-wrap gap-1.5">
              {HS_PUC_SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setSubject(s); setChapterName(''); setChapterNumber(undefined); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                    subject === s
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                      : 'bg-[#0E0E1B] border-surface-border text-surface-muted hover:border-indigo-700 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {chapterList.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Chapter ({boardExam} Class {classLevel})
              </label>
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                {chapterList.map((ch, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChapterSelect(ch, idx)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] border transition-all ${
                      chapterName === ch
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-semibold'
                        : 'bg-[#0E0E1B] border-surface-border/60 text-slate-400 hover:border-indigo-700/60 hover:text-white'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-md bg-surface-card border border-surface-border flex items-center justify-center text-[10px] font-bold text-surface-muted shrink-0">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{ch}</span>
                    {chapterName === ch && <Check className="w-3 h-3 text-indigo-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Chapter Name
              <span className="ml-1 text-[10px] text-surface-muted font-normal">(or type manually)</span>
            </label>
            <input
              type="text"
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              placeholder="e.g. Light – Reflection and Refraction"
              className="w-full px-3 py-2 bg-[#0E0E1B] border border-surface-border rounded-xl text-xs text-white placeholder:text-surface-muted/50 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-surface-muted border border-surface-border hover:border-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!chapterName.trim()}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Tag className="w-3 h-3" />
              Tag Chapter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
