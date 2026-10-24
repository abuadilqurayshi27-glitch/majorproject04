import React from 'react';
import {
  ArrowRight,
  Workflow,
  CheckCircle,
  GitBranch,
  Repeat,
  Cpu,
  Layers,
  Network,
} from 'lucide-react';
import { ConceptDiagramData } from '../../types/learning.js';

interface ConceptDiagramProps {
  diagram?: ConceptDiagramData;
}

export const ConceptDiagram: React.FC<ConceptDiagramProps> = ({ diagram }) => {
  if (!diagram || !diagram.steps || diagram.steps.length === 0) return null;

  const diagramType = diagram.type || 'flowchart';

  // Type styling & badges
  const typeConfig = {
    flowchart: {
      label: 'PROCESS FLOWCHART',
      icon: <Workflow className="w-4 h-4 text-brand-400" />,
      border: 'border-brand-500/30',
      badge: 'bg-brand-950/80 text-brand-300 border-brand-800/60',
    },
    process: {
      label: 'STEP-BY-STEP PROCESS',
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    },
    concept_map: {
      label: 'CONCEPT MAP & RELATIONS',
      icon: <Network className="w-4 h-4 text-purple-400" />,
      border: 'border-purple-500/30',
      badge: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
    },
    cycle: {
      label: 'ITERATIVE CYCLE / LOOP',
      icon: <Repeat className="w-4 h-4 text-amber-400" />,
      border: 'border-amber-500/30',
      badge: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    },
    technical: {
      label: 'TECHNICAL SYSTEM ARCHITECTURE',
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      border: 'border-cyan-500/30',
      badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
    },
    hierarchy: {
      label: 'STRUCTURAL HIERARCHY',
      icon: <GitBranch className="w-4 h-4 text-indigo-400" />,
      border: 'border-indigo-500/30',
      badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
    },
  }[diagramType] || {
    label: 'CONCEPT DIAGRAM',
    icon: <Workflow className="w-4 h-4 text-brand-400" />,
    border: 'border-brand-500/30',
    badge: 'bg-brand-950/80 text-brand-300 border-brand-800/60',
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-[#0E0E1B] border ${typeConfig.border} space-y-4`}>
      {/* Diagram Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border/50 pb-3">
        <div className="flex items-center gap-2">
          {typeConfig.icon}
          <span className="text-xs font-black text-white tracking-wide">
            {diagram.title}
          </span>
        </div>
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${typeConfig.badge}`}>
          {typeConfig.label}
        </span>
      </div>

      {/* Responsive Nodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {diagram.steps.map((step, idx) => (
          <div
            key={idx}
            className="relative flex flex-col p-3.5 rounded-xl bg-surface-card border border-surface-border/70 hover:border-brand-500/50 transition-all group shadow-sm"
          >
            {/* Step badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-brand-600/30 text-brand-300 border border-brand-500/40 text-xs font-bold flex items-center justify-center">
                {step.step || idx + 1}
              </span>
              <span className="text-[10px] text-surface-muted font-mono uppercase">
                {diagramType === 'cycle' ? `Loop 0${idx + 1}` : `Phase 0${idx + 1}`}
              </span>
            </div>

            {/* Step label */}
            <h5 className="text-xs font-bold text-white mb-1 group-hover:text-brand-300 transition-colors">
              {step.label}
            </h5>

            {/* Description */}
            <p className="text-[11px] text-surface-muted leading-relaxed flex-1">
              {step.description}
            </p>

            {/* Sub-nodes / Branch tags (if available) */}
            {step.subNodes && step.subNodes.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-surface-border/50 flex flex-wrap gap-1">
                {step.subNodes.map((sub, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[9.5px] px-1.5 py-0.5 rounded bg-black/40 text-slate-300 border border-surface-border"
                  >
                    • {sub}
                  </span>
                ))}
              </div>
            )}

            {/* Arrow connector on desktop (except for last item unless cycle) */}
            {idx < diagram.steps.length - 1 && (
              <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#0E0E1B] border border-surface-border items-center justify-center text-brand-400 shadow-md">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            )}

            {/* Cycle return indicator on last item */}
            {diagramType === 'cycle' && idx === diagram.steps.length - 1 && (
              <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-amber-950 border border-amber-600/60 items-center justify-center text-amber-400 shadow-md" title="Loops back to start">
                <Repeat className="w-3 h-3 animate-spin-slow" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
