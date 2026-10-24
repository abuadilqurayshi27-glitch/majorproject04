import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { SmartNotes, SmartNoteTopic, QuizQuestion } from '../types/learning.js';

export interface PdfExportOptions {
  quizQuestions?: QuizQuestion[];
  codeOutputs?: Record<string, { code?: string; output?: string; hasError?: boolean; duration?: number }>;
  activeCodes?: Record<string, string>;
}

export class PdfExportService {
  /**
   * Exports the complete Smart Notes to a high-fidelity PDF directly downloaded to the user's device.
   * Includes code snippets with live sandbox outputs, step-by-step mathematical solutions,
   * concept diagrams, flowcharts, practice MCQs, and full grounded explanations.
   */
  public static async exportSmartNotesToPdf(
    notes: SmartNotes,
    options?: PdfExportOptions
  ): Promise<void> {
    if (!notes) return;

    // 1. Create an off-screen container styled specifically for high-res A4 document printing
    const container = document.createElement('div');
    container.id = 'studymind-pdf-export-container';
    container.style.position = 'fixed';
    container.style.left = '-99999px';
    container.style.top = '0';
    container.style.width = '794px'; // ~210mm at 96 DPI for standard A4 aspect ratio
    container.style.backgroundColor = '#FFFFFF';
    container.style.color = '#0F172A';
    container.style.fontFamily = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    container.style.padding = '32px 36px';
    container.style.boxSizing = 'border-box';
    container.style.lineHeight = '1.5';
    container.style.zIndex = '-9999';

    // 2. Generate clean, high-density HTML markup matching the Smart Notes structure
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const escapeHtml = (str?: string) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const getLanguageLessonHtml = (lesson: any, title?: string) => {
      if (!lesson) return '';

      let vocabHtml = '';
      if (lesson.vocabulary && lesson.vocabulary.length > 0) {
        vocabHtml = `
          <div style="margin-top: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #9F1239; margin-bottom: 4px;">📖 Vocabulary & Key Phrases (${lesson.vocabulary.length}):</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 4px;">
              <thead>
                <tr style="background-color: #FFE4E6; color: #881337;">
                  <th style="padding: 4px 6px; border: 1px solid #FECDD3; text-align: left;">Word / Expression</th>
                  <th style="padding: 4px 6px; border: 1px solid #FECDD3; text-align: left;">Pronunciation</th>
                  <th style="padding: 4px 6px; border: 1px solid #FECDD3; text-align: left;">Meaning / Translation</th>
                  <th style="padding: 4px 6px; border: 1px solid #FECDD3; text-align: left;">Example Sentence</th>
                </tr>
              </thead>
              <tbody>
                ${lesson.vocabulary.map((v: any, vIdx: number) => `
                  <tr style="background-color: ${vIdx % 2 === 0 ? '#FFF1F2' : '#FFFFFF'};">
                    <td style="padding: 4px 6px; border: 1px solid #FFE4E6; font-weight: 700; color: #9F1239;">${escapeHtml(v.word)} ${v.partOfSpeech ? `<span style="font-size: 8.5px; font-weight: normal; color: #BE123C;">(${escapeHtml(v.partOfSpeech)})</span>` : ''}</td>
                    <td style="padding: 4px 6px; border: 1px solid #FFE4E6; font-family: monospace; color: #B45309;">${escapeHtml(v.pronunciation || '')}</td>
                    <td style="padding: 4px 6px; border: 1px solid #FFE4E6; color: #1E293B; font-weight: 600;">${escapeHtml(v.meaning)}</td>
                    <td style="padding: 4px 6px; border: 1px solid #FFE4E6; color: #475569; font-style: italic;">${escapeHtml(v.exampleSentence || '')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      let grammarHtml = '';
      if (lesson.grammarRules && lesson.grammarRules.length > 0) {
        grammarHtml = `
          <div style="margin-top: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #B45309; margin-bottom: 4px;">🏷️ Grammar Rules & Syntactic Patterns:</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${lesson.grammarRules.map((g: any) => `
                <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; padding: 6px 8px; border-radius: 6px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 10.5px; color: #92400E;">${escapeHtml(g.ruleName)}</strong>
                    ${g.formulaOrPattern ? `<code style="font-size: 9.5px; background-color: #FEF3C7; padding: 1px 4px; border-radius: 3px; color: #78350F;">${escapeHtml(g.formulaOrPattern)}</code>` : ''}
                  </div>
                  <div style="font-size: 10px; color: #451A03; margin-top: 2px;">${escapeHtml(g.explanation)}</div>
                  ${g.examples && g.examples.length > 0 ? `
                    <div style="margin-top: 4px; font-size: 9.5px; color: #78350F; background-color: #FFFFFF; padding: 4px 6px; border-radius: 4px; border: 1px solid #FEF3C7;">
                      <strong>Examples:</strong> ${g.examples.map((ex: string) => escapeHtml(ex)).join(' • ')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      let patternsHtml = '';
      if (lesson.sentenceStructures && lesson.sentenceStructures.length > 0) {
        patternsHtml = `
          <div style="margin-top: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #0369A1; margin-bottom: 4px;">💬 Sentence Patterns:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              ${lesson.sentenceStructures.map((p: any) => `
                <div style="background-color: #F0F9FF; border: 1px solid #BAE6FD; padding: 6px 8px; border-radius: 6px;">
                  <div style="font-family: monospace; font-size: 10px; font-weight: 700; color: #0284C7;">${escapeHtml(p.pattern)}</div>
                  <div style="font-size: 9.5px; color: #0369A1; margin-top: 2px;">${escapeHtml(p.meaning)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      let pronHtml = '';
      if (lesson.pronunciationTips && lesson.pronunciationTips.length > 0) {
        pronHtml = `
          <div style="margin-top: 8px; background-color: #FFFDF5; border: 1px solid #FDE68A; padding: 6px 8px; border-radius: 6px;">
            <div style="font-size: 10.5px; font-weight: 700; color: #B45309; margin-bottom: 2px;">🔊 Pronunciation Guidance:</div>
            <ul style="margin: 0; padding-left: 14px; font-size: 9.5px; color: #78350F;">
              ${lesson.pronunciationTips.map((tip: string) => `<li>${escapeHtml(tip)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      let exercisesHtml = '';
      if (lesson.exercises && lesson.exercises.length > 0) {
        exercisesHtml = `
          <div style="margin-top: 8px; background-color: #F0FDF4; border: 1px solid #86EFAC; padding: 6px 8px; border-radius: 6px;">
            <div style="font-size: 10.5px; font-weight: 700; color: #166534; margin-bottom: 4px;">✅ Practice Exercises:</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${lesson.exercises.map((ex: any, eIdx: number) => `
                <div style="font-size: 10px; color: #14532D;">
                  <strong>Q${eIdx + 1}:</strong> ${escapeHtml(ex.question)}
                  <div style="font-size: 9.5px; color: #15803D; margin-top: 1px;"><em>Answer:</em> ${escapeHtml(ex.answer)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      return `
        <div style="margin-top: 10px; background-color: #FFF1F2; border: 1.5px solid #FECDD3; border-radius: 8px; padding: 10px 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #FECDD3; padding-bottom: 4px;">
            <span style="font-size: 11.5px; font-weight: 700; color: #881337;">🌐 ${escapeHtml(title || `${lesson.targetLanguage} Language Laboratory`)}</span>
            <span style="font-size: 9px; font-weight: 700; background-color: #FFE4E6; color: #9F1239; padding: 2px 6px; border-radius: 4px;">${escapeHtml(lesson.proficiencyLevel || 'Foundations')}</span>
          </div>
          ${vocabHtml}
          ${grammarHtml}
          ${patternsHtml}
          ${pronHtml}
          ${exercisesHtml}
        </div>
      `;
    };

    let topicsHtml = '';
    notes.topics.forEach((topic: SmartNoteTopic, idx: number) => {
      // Importance color styling
      const importanceStyles = {
        Foundational: 'background-color: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE;',
        Crucial: 'background-color: #FAF5FF; color: #7E22CE; border: 1px solid #E9D5FF;',
        High: 'background-color: #FFFBEB; color: #B45309; border: 1px solid #FDE68A;',
      }[topic.importance] || 'background-color: #F3E8FF; color: #6D28D9; border: 1px solid #DDD6FE;';

      // Step-by-step
      let stepsHtml = '';
      if (topic.stepByStep && topic.stepByStep.length > 0) {
        stepsHtml = `
          <div style="margin-top: 10px;">
            <div style="font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 4px;">Step-by-Step Breakdown:</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${topic.stepByStep.map((s, sIdx) => `
                <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 11px; color: #1E293B; background-color: #F8FAFC; padding: 5px 8px; border-radius: 6px; border: 1px solid #E2E8F0;">
                  <span style="font-weight: 700; color: #6D28D9; min-width: 18px;">${sIdx + 1}.</span>
                  <span>${escapeHtml(s)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Definitions
      let defsHtml = '';
      if (topic.definitions && topic.definitions.length > 0) {
        defsHtml = `
          <div style="margin-top: 10px;">
            <div style="font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 4px;">Key Definitions:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              ${topic.definitions.map((d) => `
                <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 6px 8px; border-radius: 6px;">
                  <div style="font-size: 11px; font-weight: 700; color: #0F172A;">${escapeHtml(d.term)}</div>
                  <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">${escapeHtml(d.definition)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Formulas
      let formulasHtml = '';
      if (topic.formulas && topic.formulas.length > 0) {
        formulasHtml = `
          <div style="margin-top: 10px; background-color: #FFFDF5; border: 1px solid #FDE68A; padding: 8px 10px; border-radius: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #B45309; margin-bottom: 4px;">Formulas & Mathematical Relations:</div>
            ${topic.formulas.map((f) => `
              <div style="margin-bottom: 6px;">
                <div style="font-size: 10.5px; font-weight: 600; color: #1E293B;">${escapeHtml(f.name)}</div>
                <div style="font-family: monospace; font-size: 11px; color: #92400E; background-color: #FEF3C7; padding: 4px 8px; border-radius: 4px; margin-top: 2px;">${escapeHtml(f.formula)}</div>
                ${f.explanation ? `<div style="font-size: 10px; color: #64748B; margin-top: 2px;">${escapeHtml(f.explanation)}</div>` : ''}
                ${f.variables && f.variables.length > 0 ? `
                  <div style="font-size: 9.5px; color: #78350F; margin-top: 3px; display: flex; flex-wrap: wrap; gap: 4px;">
                    <strong style="margin-right: 2px;">Variables:</strong>
                    ${f.variables.map(v => `<span style="background-color: #FEF3C7; padding: 1px 5px; border-radius: 3px; border: 1px solid #FDE68A;"><code>${escapeHtml(v.symbol)}</code>: ${escapeHtml(v.meaning)}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `;
      }

      // Step-by-Step Mathematical Solutions (if available)
      let mathSolutionHtml = '';
      if (topic.mathSolution) {
        const ms = topic.mathSolution;
        mathSolutionHtml = `
          <div style="margin-top: 10px; background-color: #F0FDF4; border: 1.5px solid #86EFAC; padding: 10px 12px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: #15803D;">📐 Step-by-Step Mathematical Solution</span>
              <span style="font-size: 9.5px; font-weight: 700; background-color: #DCFCE7; color: #166534; padding: 2px 6px; border-radius: 4px;">Verified Formula</span>
            </div>
            <div style="font-size: 11px; font-weight: 600; color: #14532D; margin-bottom: 4px;">Problem: ${escapeHtml(ms.problem)}</div>
            <div style="font-family: monospace; font-size: 11px; background-color: #FFFFFF; border: 1px solid #BBF7D0; padding: 5px 8px; border-radius: 5px; color: #166534; margin-bottom: 6px;">
              ${escapeHtml(ms.formula)}
            </div>
            ${ms.variables && ms.variables.length > 0 ? `
              <div style="font-size: 10px; color: #166534; margin-bottom: 6px;">
                <strong>Variables:</strong>
                ${ms.variables.map(v => `<span style="display: inline-block; margin-right: 8px; background-color: #FFFFFF; padding: 1px 5px; border-radius: 3px; border: 1px solid #DCFCE7;"><code>${escapeHtml(v.symbol)}</code>: ${escapeHtml(v.meaning)}</span>`).join('')}
              </div>
            ` : ''}
            ${ms.steps && ms.steps.length > 0 ? `
              <div style="margin-bottom: 6px;">
                <div style="font-size: 10.5px; font-weight: 700; color: #15803D; margin-bottom: 2px;">Derivation / Solution Steps:</div>
                <div style="display: flex; flex-direction: column; gap: 3px;">
                  ${ms.steps.map((st, stIdx) => `
                    <div style="font-size: 10.5px; color: #14532D; background-color: #FFFFFF; padding: 3px 6px; border-radius: 4px; border: 1px solid #DCFCE7;">
                      <strong>${stIdx + 1}.</strong> ${escapeHtml(st)}
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            ${ms.workedExample ? `
              <div style="background-color: #FFFFFF; border: 1px solid #BBF7D0; padding: 6px 8px; border-radius: 6px; font-size: 10.5px; color: #14532D;">
                <div style="font-weight: 700; color: #15803D;">Worked Example:</div>
                <div><strong>Given:</strong> ${escapeHtml(ms.workedExample.input)}</div>
                <div><strong>Calculation:</strong> ${escapeHtml(ms.workedExample.calculation)}</div>
                <div style="font-weight: 700; color: #166534; margin-top: 2px;"><strong>Result:</strong> ${escapeHtml(ms.workedExample.output)}</div>
              </div>
            ` : ''}
          </div>
        `;
      }

      // Step-by-Step Derivation Sequence (Subject: Mathematics / Physics)
      let derivationHtml = '';
      if (topic.derivation) {
        const d = topic.derivation;
        derivationHtml = `
          <div style="margin-top: 10px; background-color: #EEF2FF; border: 1.5px solid #C7D2FE; padding: 10px 12px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: #3730A3;">∑ ${escapeHtml(d.title || 'Step-by-Step Derivation')}</span>
              <span style="font-size: 9.5px; font-weight: 700; background-color: #E0E7FF; color: #312E81; padding: 2px 6px; border-radius: 4px;">Analytical Derivation</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 6px;">
              <div style="background-color: #FFFFFF; border: 1px solid #E0E7FF; padding: 6px 8px; border-radius: 6px;">
                <span style="font-size: 9.5px; font-weight: 700; color: #4338CA; display: block;">Starting Formula:</span>
                <code style="font-family: monospace; font-size: 10.5px; color: #1E1B4B; display: block; margin-top: 2px;">${escapeHtml(d.startingFormula)}</code>
              </div>
              <div style="background-color: #FFFFFF; border: 1px solid #BBF7D0; padding: 6px 8px; border-radius: 6px;">
                <span style="font-size: 9.5px; font-weight: 700; color: #15803D; display: block;">Final Target Formula:</span>
                <code style="font-family: monospace; font-size: 10.5px; color: #14532D; display: block; margin-top: 2px;">${escapeHtml(d.targetFormula)}</code>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 6px;">
              ${d.steps.map((st) => `
                <div style="background-color: #FFFFFF; border: 1px solid #E0E7FF; padding: 6px 8px; border-radius: 6px;">
                  <div style="display: flex; justify-content: space-between; font-size: 9.5px; font-weight: 700; color: #4338CA; margin-bottom: 2px;">
                    <span>Step ${st.stepNumber}</span>
                    <span style="font-style: italic; color: #64748B;">${escapeHtml(st.justification)}</span>
                  </div>
                  <div style="font-family: monospace; font-size: 10.5px; color: #1E1B4B; background-color: #F8FAFC; padding: 3px 6px; border-radius: 4px;">${escapeHtml(st.expression)}</div>
                  ${st.annotation ? `<div style="font-size: 9.5px; color: #64748B; margin-top: 2px;">Note: ${escapeHtml(st.annotation)}</div>` : ''}
                </div>
              `).join('')}
            </div>
            ${d.conclusion ? `
              <div style="font-size: 10px; color: #3730A3; background-color: #E0E7FF; padding: 4px 8px; border-radius: 4px;">
                <strong>Conclusion:</strong> ${escapeHtml(d.conclusion)}
              </div>
            ` : ''}
          </div>
        `;
      }

      // Tabular Coordinate Representation (Subject: Mathematics / Physics)
      let coordinateDataHtml = '';
      if (topic.coordinateData) {
        const cd = topic.coordinateData;
        coordinateDataHtml = `
          <div style="margin-top: 10px; background-color: #ECFEFF; border: 1.5px solid #A5F3FC; padding: 10px 12px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: #0E7490;">📈 ${escapeHtml(cd.title || 'Tabular Coordinate Representation')}</span>
              ${cd.relationshipType ? `<span style="font-size: 9.5px; font-weight: 700; background-color: #CFFAFE; color: #155E75; padding: 2px 6px; border-radius: 4px;">${escapeHtml(cd.relationshipType)}</span>` : ''}
            </div>
            ${cd.expressionOrRelation ? `
              <div style="font-family: monospace; font-size: 11px; color: #155E75; background-color: #FFFFFF; border: 1px solid #BAE6FD; padding: 4px 8px; border-radius: 4px; margin-bottom: 6px;">
                ${escapeHtml(cd.expressionOrRelation)}
              </div>
            ` : ''}
            ${cd.coordinatePoints && cd.coordinatePoints.length > 0 ? `
              <div style="margin-bottom: 6px; font-size: 9.5px; display: flex; flex-wrap: wrap; gap: 4px;">
                <strong style="color: #0E7490; margin-right: 2px;">Coordinates (x, y):</strong>
                ${cd.coordinatePoints.map(pt => `<span style="background-color: #FFFFFF; border: 1px solid #BAE6FD; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #0369A1;">(${pt.x}, ${pt.y})${pt.label ? ` [${escapeHtml(pt.label)}]` : ''}</span>`).join('')}
              </div>
            ` : ''}
            ${cd.tableHeaders && cd.tableRows && cd.tableRows.length > 0 ? `
              <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: left; background-color: #FFFFFF; border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
                <thead>
                  <tr style="background-color: #CFFAFE; color: #0E7490;">
                    ${cd.tableHeaders.map(h => `<th style="padding: 4px 6px; border: 1px solid #A5F3FC; font-weight: 700;">${escapeHtml(h)}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${cd.tableRows.map((r, rIdx) => `
                    <tr style="background-color: ${rIdx % 2 === 0 ? '#FFFFFF' : '#F0FDFA'};">
                      ${r.map(cell => `<td style="padding: 4px 6px; border: 1px solid #E0F2FE; font-family: monospace;">${escapeHtml(String(cell))}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
            ${cd.keyObservations && cd.keyObservations.length > 0 ? `
              <div style="font-size: 9.5px; color: #0E7490;">
                <strong>Observations:</strong>
                ${cd.keyObservations.map(obs => `<span style="display: block; margin-top: 1px;">• ${escapeHtml(obs)}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `;
      }

      // Physics Practical / Laboratory Experiment
      let physicsExperimentHtml = '';
      if (topic.physicsExperiment) {
        const pe = topic.physicsExperiment;
        physicsExperimentHtml = `
          <div style="margin-top: 10px; background-color: #FFFBEB; border: 1.5px solid #FCD34D; padding: 10px 12px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: #B45309;">🔬 Practical / Experiment: ${escapeHtml(pe.title || 'Laboratory Practical')}</span>
              <span style="font-size: 9.5px; font-weight: 700; background-color: #FEF3C7; color: #92400E; padding: 2px 6px; border-radius: 4px;">Physics Practical</span>
            </div>
            ${pe.aimOrObjective ? `
              <div style="font-size: 10.5px; color: #78350F; margin-bottom: 4px;"><strong>Aim:</strong> ${escapeHtml(pe.aimOrObjective)}</div>
            ` : ''}
            ${pe.principleOrLaw ? `
              <div style="font-size: 10px; color: #92400E; background-color: #FEF3C7; padding: 4px 8px; border-radius: 4px; margin-bottom: 6px;">
                <strong>Principle:</strong> ${escapeHtml(pe.principleOrLaw)}
              </div>
            ` : ''}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px;">
              ${pe.apparatus && pe.apparatus.length > 0 ? `
                <div style="background-color: #FFFFFF; border: 1px solid #FDE68A; padding: 6px 8px; border-radius: 6px; font-size: 9.5px; color: #78350F;">
                  <strong style="color: #B45309; display: block; margin-bottom: 2px;">Apparatus Required:</strong>
                  <ul style="margin: 0; padding-left: 14px;">
                    ${pe.apparatus.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              ${pe.precautions && pe.precautions.length > 0 ? `
                <div style="background-color: #FFFFFF; border: 1px solid #FDE68A; padding: 6px 8px; border-radius: 6px; font-size: 9.5px; color: #78350F;">
                  <strong style="color: #B45309; display: block; margin-bottom: 2px;">Safety Precautions:</strong>
                  <ul style="margin: 0; padding-left: 14px;">
                    ${pe.precautions.map(p => `<li>${escapeHtml(p)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
            ${pe.procedure && pe.procedure.length > 0 ? `
              <div style="background-color: #FFFFFF; border: 1px solid #FDE68A; padding: 6px 8px; border-radius: 6px; font-size: 9.5px; color: #78350F; margin-bottom: 6px;">
                <strong style="color: #B45309; display: block; margin-bottom: 2px;">Procedure:</strong>
                <ol style="margin: 0; padding-left: 14px;">
                  ${pe.procedure.map(st => `<li>${escapeHtml(st.replace(/^\d+[\.\)]\s*/, ''))}</li>`).join('')}
                </ol>
              </div>
            ` : ''}
            ${pe.observations && pe.observations.length > 0 ? `
              <div style="margin-bottom: 6px; font-size: 9.5px; display: flex; flex-wrap: wrap; gap: 4px;">
                ${pe.observations.map(obs => `<span style="background-color: #FFFFFF; border: 1px solid #FDE68A; padding: 2px 6px; border-radius: 4px; color: #78350F;">${escapeHtml(obs.observation)}: <strong>${escapeHtml(obs.value || '')} ${escapeHtml(obs.unit || '')}</strong></span>`).join('')}
              </div>
            ` : ''}
            ${pe.measurementTable && pe.measurementTable.headers ? `
              <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; text-align: left; background-color: #FFFFFF; border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
                <thead>
                  <tr style="background-color: #FEF3C7; color: #92400E;">
                    ${pe.measurementTable.headers.map(h => `<th style="padding: 4px 6px; border: 1px solid #FDE68A; font-weight: 700;">${escapeHtml(h)}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${pe.measurementTable.rows.map((r, rIdx) => `
                    <tr style="background-color: ${rIdx % 2 === 0 ? '#FFFFFF' : '#FFFDF5'};">
                      ${r.map(cell => `<td style="padding: 4px 6px; border: 1px solid #FEF3C7; font-family: monospace;">${escapeHtml(String(cell))}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
            ${pe.calculationSteps && pe.calculationSteps.length > 0 ? `
              <div style="background-color: #FFFFFF; border: 1px solid #FDE68A; padding: 6px 8px; border-radius: 6px; font-size: 9.5px; color: #78350F; margin-bottom: 6px;">
                <strong style="color: #B45309; display: block; margin-bottom: 2px;">Calculations:</strong>
                ${pe.calculationSteps.map(calc => `
                  <div style="margin-bottom: 3px;">
                    <div>${escapeHtml(calc.step)}: <code>${escapeHtml(calc.formula || '')}</code></div>
                    ${calc.substitution ? `<div>Substitution: <code>${escapeHtml(calc.substitution)}</code></div>` : ''}
                    <div style="font-weight: 700; color: #166534;">Result: ${escapeHtml(calc.result || '')} ${escapeHtml(calc.unit || '')}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${pe.result ? `
              <div style="font-size: 10.5px; font-weight: 700; color: #14532D; background-color: #DCFCE7; border: 1px solid #86EFAC; padding: 5px 8px; border-radius: 4px;">
                ✓ Result: ${escapeHtml(pe.result)}
              </div>
            ` : ''}
            ${pe.sourcesOfError && pe.sourcesOfError.length > 0 ? `
              <div style="margin-top: 4px; font-size: 9px; color: #92400E;">
                <strong>Sources of Error:</strong> ${escapeHtml(pe.sourcesOfError.join('; '))}
              </div>
            ` : ''}
          </div>
        `;
      }

      // Physics Laws
      let physicsLawsHtml = '';
      if (topic.physicsLaws && topic.physicsLaws.length > 0) {
        physicsLawsHtml = `
          <div style="margin-top: 10px; background-color: #EFF6FF; border: 1.5px solid #BFDBFE; padding: 8px 10px; border-radius: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #1D4ED8; margin-bottom: 4px;">⚖️ Governing Laws & Scientific Principles:</div>
            ${topic.physicsLaws.map((law) => `
              <div style="background-color: #FFFFFF; border: 1px solid #DBEAFE; padding: 6px 8px; border-radius: 6px; margin-bottom: 4px;">
                <div style="font-size: 10.5px; font-weight: 700; color: #1E40AF;">${escapeHtml(law.name)}</div>
                <div style="font-size: 10px; color: #334155; margin-top: 2px;">&ldquo;${escapeHtml(law.statement)}&rdquo;</div>
                ${law.mathematicalForm ? `<div style="font-family: monospace; font-size: 10px; color: #1D4ED8; background-color: #EFF6FF; padding: 2px 6px; border-radius: 3px; margin-top: 3px;">${escapeHtml(law.mathematicalForm)}</div>` : ''}
                ${law.conditionsOrLimitations && law.conditionsOrLimitations.length > 0 ? `<div style="font-size: 9px; color: #64748B; margin-top: 2px;">Conditions: ${escapeHtml(law.conditionsOrLimitations.join('; '))}</div>` : ''}
              </div>
            `).join('')}
          </div>
        `;
      }

      // Physical Quantities
      let physicsQuantitiesHtml = '';
      if (topic.physicsQuantities && topic.physicsQuantities.length > 0) {
        physicsQuantitiesHtml = `
          <div style="margin-top: 10px; background-color: #F0FDFA; border: 1.5px solid #99F6E4; padding: 8px 10px; border-radius: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #0F766E; margin-bottom: 4px;">⚛️ Physical Quantities & SI Units:</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; text-align: left; background-color: #FFFFFF;">
              <thead>
                <tr style="background-color: #CCFBF1; color: #0F766E;">
                  <th style="padding: 3px 6px; border: 1px solid #99F6E4;">Quantity</th>
                  <th style="padding: 3px 6px; border: 1px solid #99F6E4;">Symbol</th>
                  <th style="padding: 3px 6px; border: 1px solid #99F6E4;">SI Unit</th>
                  <th style="padding: 3px 6px; border: 1px solid #99F6E4;">Dimensions</th>
                </tr>
              </thead>
              <tbody>
                ${topic.physicsQuantities.map((q) => `
                  <tr>
                    <td style="padding: 3px 6px; border: 1px solid #CCFBF1; font-weight: 700;">${escapeHtml(q.quantity)}</td>
                    <td style="padding: 3px 6px; border: 1px solid #CCFBF1; font-family: monospace;">${escapeHtml(q.symbol)}</td>
                    <td style="padding: 3px 6px; border: 1px solid #CCFBF1;">${escapeHtml(q.siUnit)}</td>
                    <td style="padding: 3px 6px; border: 1px solid #CCFBF1; color: #64748B;">${escapeHtml(q.dimensions || '—')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      // Code Snippet & Sandbox Output (if available)
      let codeSnippetHtml = '';
      if (topic.codeSnippet) {
        const activeCode = options?.activeCodes?.[topic.id] || topic.codeSnippet.code;
        const outputData = options?.codeOutputs?.[topic.id];
        const displayOutput = outputData?.output || topic.codeSnippet.expectedOutput;

        codeSnippetHtml = `
          <div style="margin-top: 10px; background-color: #0F172A; border: 1.5px solid #334155; border-radius: 8px; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; background-color: #1E293B; padding: 6px 10px; border-bottom: 1px solid #334155;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; background-color: #38BDF8; color: #0F172A; padding: 1px 6px; border-radius: 4px;">
                  ${escapeHtml(topic.codeSnippet.language || 'Code')}
                </span>
                <span style="font-size: 11px; font-weight: 700; color: #F8FAFC;">
                  ${escapeHtml(topic.codeSnippet.title || 'Code Implementation')}
                </span>
              </div>
              <span style="font-size: 9.5px; color: #94A3B8; font-family: monospace;">Interactive Sandbox Grounded</span>
            </div>

            <!-- Code Editor Box -->
            <pre style="margin: 0; padding: 10px 12px; font-family: 'Consolas', 'Courier New', monospace; font-size: 10.5px; color: #E2E8F0; background-color: #0F172A; line-height: 1.5; overflow-x: auto; white-space: pre-wrap;">${escapeHtml(activeCode)}</pre>

            <!-- Execution Output Terminal -->
            ${displayOutput ? `
              <div style="background-color: #030712; border-top: 1px solid #1E293B; padding: 8px 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; font-weight: 700; color: #10B981; margin-bottom: 4px; font-family: monospace;">
                  <span>▶ EXECUTION OUTPUT ${outputData?.duration ? `(${outputData.duration}ms)` : ''}</span>
                  <span style="color: ${outputData?.hasError ? '#EF4444' : '#10B981'};">${outputData?.hasError ? 'RUNTIME ERROR' : 'STATUS: EXIT 0'}</span>
                </div>
                <pre style="margin: 0; font-family: 'Consolas', monospace; font-size: 10px; color: ${outputData?.hasError ? '#F87171' : '#34D399'}; line-height: 1.4; white-space: pre-wrap;">${escapeHtml(displayOutput)}</pre>
              </div>
            ` : ''}

            ${topic.codeSnippet.explanation ? `
              <div style="background-color: #1E293B; padding: 6px 10px; font-size: 10px; color: #94A3B8; border-top: 1px solid #334155;">
                <strong style="color: #CBD5E1;">Complexity & Logic:</strong> ${escapeHtml(topic.codeSnippet.explanation)}
              </div>
            ` : ''}
          </div>
        `;
      }

      // Diagram / Flowchart / Concept Map / Process
      let diagramHtml = '';
      if (topic.diagram && topic.diagram.steps && topic.diagram.steps.length > 0) {
        const dType = topic.diagram.type || 'flowchart';
        const typeLabels: Record<string, string> = {
          flowchart: 'PROCESS FLOWCHART',
          process: 'STEP-BY-STEP PROCESS',
          concept_map: 'CONCEPT MAP & RELATIONS',
          cycle: 'ITERATIVE CYCLE / LOOP',
          technical: 'TECHNICAL SYSTEM ARCHITECTURE',
          hierarchy: 'STRUCTURAL HIERARCHY',
        };
        const dLabel = typeLabels[dType] || 'CONCEPT DIAGRAM';

        diagramHtml = `
          <div style="margin-top: 10px; background-color: #F8FAFC; border: 1.5px solid #CBD5E1; padding: 10px 12px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 11px; font-weight: 700; color: #334155;">${escapeHtml(topic.diagram.title)}</span>
              <span style="font-size: 9.5px; font-weight: 700; text-transform: uppercase; background-color: #EEF2F6; color: #475569; padding: 2px 6px; border-radius: 4px; border: 1px solid #CBD5E1;">${dLabel}</span>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${topic.diagram.steps.map((st, stIdx) => `
                <div style="flex: 1; min-width: 140px; background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: 7px 9px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                    <span style="font-size: 9px; font-weight: 800; color: #6D28D9;">STEP ${st.step || stIdx + 1}</span>
                    <span style="font-size: 8.5px; color: #94A3B8; font-family: monospace;">Phase 0${stIdx + 1}</span>
                  </div>
                  <div style="font-size: 11px; font-weight: 700; color: #0F172A; margin: 2px 0;">${escapeHtml(st.label)}</div>
                  <div style="font-size: 10px; color: #64748B; line-height: 1.3;">${escapeHtml(st.description)}</div>
                  ${st.subNodes && st.subNodes.length > 0 ? `
                    <div style="margin-top: 4px; padding-top: 3px; border-top: 1px dashed #E2E8F0; display: flex; flex-wrap: wrap; gap: 3px;">
                      ${st.subNodes.map(sub => `<span style="font-size: 8.5px; background-color: #F1F5F9; color: #475569; padding: 1px 4px; border-radius: 3px;">• ${escapeHtml(sub)}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Comparison & Contrast Table
      let comparisonTableHtml = '';
      if (topic.comparisonTable && topic.comparisonTable.headers && topic.comparisonTable.headers.length > 0) {
        comparisonTableHtml = `
          <div style="margin-top: 10px; background-color: #F8FAFC; border: 1.5px solid #CBD5E1; padding: 8px 10px; border-radius: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #0F172A; margin-bottom: 6px;">📊 ${escapeHtml(topic.comparisonTable.title || 'Comparison Table')}</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: left;">
              <thead>
                <tr style="background-color: #E2E8F0; color: #0F172A;">
                  ${topic.comparisonTable.headers.map(h => `<th style="padding: 5px 8px; border: 1px solid #CBD5E1; font-weight: 700;">${escapeHtml(h)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${topic.comparisonTable.rows.map((row, rIdx) => `
                  <tr style="background-color: ${rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
                    ${row.map(cell => `<td style="padding: 5px 8px; border: 1px solid #E2E8F0; color: #334155; vertical-align: top;">${escapeHtml(cell)}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      // Instructor Tips & Pitfalls
      let tipsAndWarningsHtml = '';
      if (topic.tipsAndWarnings && topic.tipsAndWarnings.length > 0) {
        tipsAndWarningsHtml = `
          <div style="margin-top: 10px;">
            <div style="font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 4px;">💡 Instructor Tips, Pitfalls & Invariants:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              ${topic.tipsAndWarnings.map((item) => {
                const style = {
                  tip: 'background-color: #F0FDF4; border: 1px solid #86EFAC; color: #166534;',
                  warning: 'background-color: #FFFBEB; border: 1px solid #FDE68A; color: #92400E;',
                  comparison: 'background-color: #EEF2FF; border: 1px solid #C7D2FE; color: #3730A3;',
                  conclusion: 'background-color: #FAF5FF; border: 1px solid #E9D5FF; color: #6B21A8;',
                }[item.type] || 'background-color: #F8FAFC; border: 1px solid #E2E8F0; color: #334155;';

                const badge = {
                  tip: '💡 Tip',
                  warning: '⚠️ Warning',
                  comparison: '🔄 Distinction',
                  conclusion: '🎯 Takeaway',
                }[item.type] || '📌 Note';

                return `
                  <div style="${style} padding: 6px 8px; border-radius: 6px;">
                    <div style="font-size: 9.5px; font-weight: 800; text-transform: uppercase;">${badge} ${item.title ? `— ${escapeHtml(item.title)}` : ''}</div>
                    <div style="font-size: 10px; margin-top: 2px; line-height: 1.4;">${escapeHtml(item.content)}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      // Algorithm & Logic Workflow
      let algorithmHtml = '';
      if (topic.algorithm) {
        algorithmHtml = `
          <div style="margin-top: 10px; background-color: #0F172A; border: 1.5px solid #334155; border-radius: 8px; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; background-color: #1E293B; padding: 6px 10px; border-bottom: 1px solid #334155;">
              <span style="font-size: 11px; font-weight: 700; color: #F8FAFC;">⚡ Algorithm / Pseudocode: ${escapeHtml(topic.algorithm.name || 'Core Logic')}</span>
              <div style="display: flex; gap: 6px;">
                ${topic.algorithm.timeComplexity ? `<span style="font-family: monospace; font-size: 9.5px; background-color: #312E81; color: #C7D2FE; padding: 1px 5px; border-radius: 3px;">Time: ${escapeHtml(topic.algorithm.timeComplexity)}</span>` : ''}
                ${topic.algorithm.spaceComplexity ? `<span style="font-family: monospace; font-size: 9.5px; background-color: #312E81; color: #C7D2FE; padding: 1px 5px; border-radius: 3px;">Space: ${escapeHtml(topic.algorithm.spaceComplexity)}</span>` : ''}
              </div>
            </div>
            ${topic.algorithm.pseudocode && topic.algorithm.pseudocode.length > 0 ? `
              <pre style="margin: 0; padding: 8px 10px; font-family: 'Consolas', 'Courier New', monospace; font-size: 10px; color: #E0E7FF; background-color: #0F172A; line-height: 1.4; white-space: pre-wrap;">${escapeHtml(topic.algorithm.pseudocode.join('\n'))}</pre>
            ` : ''}
          </div>
        `;
      }

      // Instructor Examples
      let instructorExamplesHtml = '';
      if (topic.instructorExamples && topic.instructorExamples.length > 0) {
        instructorExamplesHtml = `
          <div style="margin-top: 10px; background-color: #F0F9FF; border: 1px solid #BAE6FD; padding: 8px 10px; border-radius: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #0284C7; margin-bottom: 4px;">Instructor Examples & Traces:</div>
            <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #0369A1;">
              ${topic.instructorExamples.map((ex) => `<li style="margin-bottom: 2px;">• ${escapeHtml(ex)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      // Questions discussed in video (supports string and QuestionAnswer object)
      let questionsHtml = '';
      if (topic.questionsDiscussedInVideo && topic.questionsDiscussedInVideo.length > 0) {
        questionsHtml = `
          <div style="margin-top: 10px; background-color: #FAF5FF; border: 1px solid #E9D5FF; padding: 8px 10px; border-radius: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #6D28D9; margin-bottom: 6px;">Questions Discussed in the Video:</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${topic.questionsDiscussedInVideo.map((item) => {
                const isQA = typeof item === 'object' && item !== null && 'question' in item;
                const qText = isQA ? (item as any).question : String(item);
                const aText = isQA ? (item as any).answer : null;
                return `
                  <div style="font-size: 10.5px; color: #334155;">
                    <div style="font-weight: 700; color: #4C1D95;">• Q: ${escapeHtml(qText)}</div>
                    ${aText ? `<div style="margin-left: 12px; margin-top: 2px; color: #6D28D9; background-color: #FFFFFF; padding: 3px 6px; border-radius: 4px; border: 1px solid #F3E8FF;"><strong style="color: #4C1D95;">Instructor Answer:</strong> ${escapeHtml(aText)}</div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      // Exam revision points
      let examPointsHtml = '';
      if (topic.examRevisionPoints && topic.examRevisionPoints.length > 0) {
        examPointsHtml = `
          <div style="margin-top: 10px; background-color: #ECFDF5; border: 1px solid #A7F3D0; padding: 8px 10px; border-radius: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #047857; margin-bottom: 4px;">High-Yield Exam / Revision Points:</div>
            <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #064E3B;">
              ${topic.examRevisionPoints.map((p) => `<li style="margin-bottom: 2px;">✓ ${escapeHtml(p)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      // Key takeaways
      let takeawaysHtml = '';
      if (topic.keyTakeaways && topic.keyTakeaways.length > 0) {
        takeawaysHtml = `
          <div style="margin-top: 10px;">
            <div style="font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 4px;">Key Takeaways:</div>
            <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #475569;">
              ${topic.keyTakeaways.map((t) => `<li style="margin-bottom: 2px;">★ ${escapeHtml(t)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      topicsHtml += `
        <div class="pdf-topic-card" style="margin-bottom: 22px; padding: 16px; border: 1.5px solid #E2E8F0; border-radius: 12px; background-color: #FFFFFF; box-shadow: 0 1px 3px rgba(0,0,0,0.04); page-break-inside: avoid;">
          <!-- Topic Header Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px; margin-bottom: 10px;">
            <div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                <span style="font-family: monospace; font-size: 9.5px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background-color: #EDE9FE; color: #5B21B6; border: 1px solid #DDD6FE;">${escapeHtml(topic.timestampRange || `${topic.timestamp}${topic.endTimestamp ? `–${topic.endTimestamp}` : ''}`)}</span>
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6D28D9; letter-spacing: 0.5px;">Topic #${idx + 1}</span>
              </div>
              <h3 style="margin: 2px 0 0 0; font-size: 14px; font-weight: 700; color: #0F172A;">${escapeHtml(topic.title)}</h3>
              ${topic.subtitle ? `<div style="font-size: 11px; font-weight: 600; color: #6D28D9; margin-top: 2px;">${escapeHtml(topic.subtitle)}</div>` : ''}
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; ${importanceStyles}">${escapeHtml(topic.importance)}</span>
            </div>
          </div>

          <!-- Simple Explanation -->
          <div style="margin-bottom: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #1E293B;">Simple Explanation:</div>
            <div style="font-size: 11.5px; color: #334155; line-height: 1.6; margin-top: 2px;">${escapeHtml(topic.simpleExplanation)}</div>
          </div>

          <!-- Detailed Technical Explanation -->
          ${topic.detailedExplanation ? `
            <div style="margin-bottom: 8px; background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 8px 10px; border-radius: 8px;">
              <div style="font-size: 10.5px; font-weight: 700; color: #1E293B; margin-bottom: 2px;">Detailed Technical Explanation:</div>
              <div style="font-size: 11px; color: #334155; line-height: 1.5;">${escapeHtml(topic.detailedExplanation)}</div>
            </div>
          ` : ''}

          <!-- Instructor Examples -->
          ${instructorExamplesHtml}

          <!-- Why It Matters & Real World Example -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
            ${topic.whyImportant ? `
              <div style="background-color: #FAF5FF; border: 1px solid #E9D5FF; padding: 8px 10px; border-radius: 8px;">
                <div style="font-size: 10.5px; font-weight: 700; color: #6D28D9;">Why It Matters:</div>
                <div style="font-size: 10.5px; color: #4C1D95; margin-top: 2px; line-height: 1.4;">${escapeHtml(topic.whyImportant)}</div>
              </div>
            ` : ''}

            ${topic.realWorldExample ? `
              <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; padding: 8px 10px; border-radius: 8px;">
                <div style="font-size: 10.5px; font-weight: 700; color: #15803D;">Real-World Example:</div>
                <div style="font-size: 10.5px; color: #14532D; margin-top: 2px; line-height: 1.4;">${escapeHtml(topic.realWorldExample)}</div>
              </div>
            ` : ''}
          </div>

          <!-- Where Used -->
          ${topic.whereUsed && topic.whereUsed.length > 0 ? `
            <div style="margin-top: 8px;">
              <div style="font-size: 10.5px; font-weight: 700; color: #334155; margin-bottom: 4px;">Where It Is Used:</div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                ${topic.whereUsed.map((u) => `<span style="font-size: 10px; background-color: #F1F5F9; color: #334155; padding: 2px 7px; border-radius: 4px; border: 1px solid #E2E8F0;">• ${escapeHtml(u)}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Step by Step -->
          ${stepsHtml}

          <!-- Key Definitions -->
          ${defsHtml}

          <!-- Important Points -->
          ${topic.importantPoints && topic.importantPoints.length > 0 ? `
            <div style="margin-top: 10px;">
              <div style="font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 4px;">Important Points:</div>
              <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #334155;">
                ${topic.importantPoints.map((pt) => `<li style="margin-bottom: 2px;">${escapeHtml(pt)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Formulas -->
          ${formulasHtml}

          <!-- Mathematical Solutions -->
          ${mathSolutionHtml}

          <!-- Step-by-Step Derivation Sequence -->
          ${derivationHtml}

          <!-- Tabular Coordinate Representation -->
          ${coordinateDataHtml}

          <!-- Physics Practical / Laboratory Experiment -->
          ${physicsExperimentHtml}

          <!-- Governing Laws & Scientific Principles -->
          ${physicsLawsHtml}

          <!-- Physical Quantities & SI Units -->
          ${physicsQuantitiesHtml}

          <!-- Code Snippets & Outputs -->
          ${codeSnippetHtml}

          <!-- Language Learning Module -->
          ${topic.languageLesson ? getLanguageLessonHtml(topic.languageLesson, `${topic.title} - Language Module`) : ''}

          <!-- Concept Diagram -->
          ${diagramHtml}

          <!-- Comparison Table -->
          ${comparisonTableHtml}

          <!-- Instructor Tips & Pitfalls -->
          ${tipsAndWarningsHtml}

          <!-- Algorithm & Logic Flow -->
          ${algorithmHtml}

          <!-- Questions -->
          ${questionsHtml}

          <!-- Exam Points -->
          ${examPointsHtml}

          <!-- Takeaways -->
          ${takeawaysHtml}
        </div>
      `;
    });

    // Final Synthesis & Instructor Conclusion
    let finalSummaryHtml = '';
    if (notes.finalSummary) {
      finalSummaryHtml = `
        <div class="pdf-topic-card" style="margin-top: 18px; padding: 16px; border: 1.5px solid #C7D2FE; border-radius: 12px; background-color: #EEF2FF; page-break-inside: avoid;">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #3730A3; margin-bottom: 6px;">
            <span>🎯 Final Synthesis & Instructor Conclusion</span>
          </div>
          <div style="font-size: 11px; color: #1E1B4B; line-height: 1.5;">${escapeHtml(notes.finalSummary)}</div>
        </div>
      `;
    }

    // High-Yield Practice MCQs section (if quiz questions provided)
    let mcqSectionHtml = '';
    if (options?.quizQuestions && options.quizQuestions.length > 0) {
      mcqSectionHtml = `
        <div class="pdf-topic-card" style="margin-top: 20px; padding: 16px; border: 1.5px solid #CBD5E1; border-radius: 12px; background-color: #F8FAFC; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">
            <div style="font-size: 13px; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 6px;">
              <span style="color: #6D28D9;">✓</span> High-Yield Practice MCQs & Knowledge Verification (${options.quizQuestions.length})
            </div>
            <span style="font-size: 10px; font-weight: 700; background-color: #EFF6FF; color: #1D4ED8; padding: 2px 8px; border-radius: 4px; border: 1px solid #BFDBFE;">Grounded Questions</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${options.quizQuestions.slice(0, 8).map((q, qIdx) => `
              <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <span style="font-size: 11px; font-weight: 700; color: #1E293B;">Q${qIdx + 1}: ${escapeHtml(q.question)}</span>
                  <span style="font-size: 9px; font-weight: 700; background-color: #F1F5F9; color: #475569; padding: 1px 5px; border-radius: 3px; height: fit-content;">${escapeHtml(q.difficulty || 'Medium')}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 6px;">
                  ${q.options.map((opt, optIdx) => {
                    const isCorrect = optIdx === q.correctAnswerIndex;
                    return `
                      <div style="font-size: 10px; padding: 4px 6px; border-radius: 4px; border: 1px solid ${isCorrect ? '#86EFAC' : '#E2E8F0'}; background-color: ${isCorrect ? '#F0FDF4' : '#F8FAFC'}; color: ${isCorrect ? '#15803D' : '#334155'}; font-weight: ${isCorrect ? '700' : 'normal'};">
                        ${String.fromCharCode(65 + optIdx)}. ${escapeHtml(opt)} ${isCorrect ? '✓' : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
                <div style="font-size: 9.5px; color: #64748B; background-color: #F8FAFC; padding: 4px 6px; border-radius: 4px; border: 1px solid #F1F5F9;">
                  <strong>Explanation:</strong> ${escapeHtml(q.explanation)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Comprehensive Cheat Sheet
    let cheatSheetHtml = '';
    if (notes.comprehensiveCheatSheet && notes.comprehensiveCheatSheet.length > 0) {
      cheatSheetHtml = `
        <div class="pdf-topic-card" style="margin-top: 18px; padding: 16px; border: 1.5px solid #DDD6FE; border-radius: 12px; background-color: #FAF5FF; page-break-inside: avoid;">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #6D28D9; margin-bottom: 8px;">
            <span>★ Comprehensive Revision Cheat Sheet</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            ${notes.comprehensiveCheatSheet.map((item) => `
              <div style="background-color: #FFFFFF; border: 1px solid #E9D5FF; padding: 6px 10px; border-radius: 6px; font-size: 10.5px; color: #1E293B;">
                <span style="color: #7C3AED; font-weight: 700;">✓</span> ${escapeHtml(item)}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    const subjectBadge = {
      programming: '💻 Programming & Interactive Code Sandbox',
      mathematics: '📐 Mathematics & Step-by-Step Derivations',
      science: '🔬 Science & Natural Process Diagrams',
      theory: '🧠 Conceptual Theory & Concept Maps',
      engineering: '⚙️ Engineering & System Architecture',
      language: '🌐 Language Learning & Grammar Laboratory',
      physics: '⚛️ Physics Laboratory & Governing Principles',
      chemistry: '🧪 Chemistry & Molecular Reactions',
      commerce: '📊 Commerce, Financial Ledgers & Business Strategy',
      humanities: '🏛️ Humanities, Historical Chronology & Ideological Debates',
      medical: '🩺 Clinical Medicine, Pathology & Pharmacotherapy',
      law: '⚖️ Jurisprudence, Statutes & Landmark Case Precedents',
      general: '📚 Subject Mastery & Smart Notes',
    }[notes.subjectType || 'general'] || '📚 Subject Mastery & Smart Notes';

    // Physics Overview Section (if present)
    let physicsOverviewHtml = '';
    if (notes.physicsOverview && ((notes.physicsOverview.laws && notes.physicsOverview.laws.length > 0) || (notes.physicsOverview.quantities && notes.physicsOverview.quantities.length > 0))) {
      const po = notes.physicsOverview;
      physicsOverviewHtml = `
        <div class="pdf-topic-card" style="border: 1.5px solid #93C5FD; border-radius: 12px; padding: 16px; margin-bottom: 20px; background-color: #EFF6FF; page-break-inside: avoid;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #1D4ED8; letter-spacing: 0.5px; margin-bottom: 8px;">
            ⚛️ Physics Overview: Core Laws & Standard Physical Quantities
          </div>
          ${po.laws && po.laws.length > 0 ? `
            <div style="margin-bottom: 10px;">
              <div style="font-size: 10.5px; font-weight: 700; color: #1E40AF; margin-bottom: 4px;">Primary Governing Laws & Principles:</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                ${po.laws.map(law => `
                  <div style="background-color: #FFFFFF; border: 1px solid #BFDBFE; padding: 6px 8px; border-radius: 6px;">
                    <div style="font-size: 10px; font-weight: 700; color: #1E40AF;">${escapeHtml(law.name)}</div>
                    <div style="font-size: 9.5px; color: #334155; margin-top: 2px;">&ldquo;${escapeHtml(law.statement)}&rdquo;</div>
                    ${law.mathematicalForm ? `<div style="font-family: monospace; font-size: 9.5px; color: #1D4ED8; background-color: #EFF6FF; padding: 2px 4px; border-radius: 3px; margin-top: 2px;">${escapeHtml(law.mathematicalForm)}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          ${po.quantities && po.quantities.length > 0 ? `
            <div>
              <div style="font-size: 10.5px; font-weight: 700; color: #0F766E; margin-bottom: 4px;">Standard Physical Quantities & Dimensions:</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; text-align: left; background-color: #FFFFFF; border-radius: 6px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #CCFBF1; color: #0F766E;">
                    <th style="padding: 4px 6px; border: 1px solid #99F6E4;">Quantity</th>
                    <th style="padding: 4px 6px; border: 1px solid #99F6E4;">Symbol</th>
                    <th style="padding: 4px 6px; border: 1px solid #99F6E4;">SI Unit</th>
                    <th style="padding: 4px 6px; border: 1px solid #99F6E4;">Dimensions</th>
                  </tr>
                </thead>
                <tbody>
                  ${po.quantities.map(q => `
                    <tr>
                      <td style="padding: 3px 6px; border: 1px solid #CCFBF1; font-weight: 700;">${escapeHtml(q.quantity)}</td>
                      <td style="padding: 3px 6px; border: 1px solid #CCFBF1; font-family: monospace;">${escapeHtml(q.symbol)}</td>
                      <td style="padding: 3px 6px; border: 1px solid #CCFBF1;">${escapeHtml(q.siUnit)}</td>
                      <td style="padding: 3px 6px; border: 1px solid #CCFBF1; color: #64748B;">${escapeHtml(q.dimensions || '—')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
        </div>
      `;
    }

    container.innerHTML = `
      <!-- Cover Banner -->
      <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); color: #FFFFFF; padding: 22px 26px; border-radius: 12px; margin-bottom: 18px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="font-size: 10px; font-weight: 800; letter-spacing: 1px; color: #A78BFA; text-transform: uppercase;">StudyMind AI — Smart Notes Documentation</div>
          <div style="font-size: 10px; color: #CBD5E1;">${dateStr}</div>
        </div>
        <h1 style="margin: 0; font-size: 18px; font-weight: 800; line-height: 1.3; color: #FFFFFF;">${escapeHtml(notes.videoTitle)}</h1>
        <div style="margin-top: 10px; font-size: 10.5px; color: #C4B5FD; display: flex; flex-wrap: wrap; gap: 14px; align-items: center;">
          <span style="background-color: rgba(255,255,255,0.12); padding: 2px 8px; border-radius: 4px; font-weight: 700; color: #FFFFFF;">${subjectBadge}</span>
          ${notes.detectedLanguage ? `<span style="background-color: rgba(6,182,212,0.2); padding: 2px 8px; border-radius: 4px; color: #A5F3FC;">Detected: <strong>${escapeHtml(notes.detectedLanguage)}</strong>${notes.targetLanguage && notes.targetLanguage.toLowerCase() !== notes.detectedLanguage.toLowerCase() && notes.targetLanguage !== 'original' ? ` → ${escapeHtml(notes.targetLanguage)}` : ' (Preserved)'}</span>` : ''}
          <span>Topics Analyzed: <strong>${notes.topics.length}</strong></span>
          <span>Video ID: <strong>${escapeHtml(notes.videoId)}</strong></span>
          <span>Grounded in Video Captions</span>
        </div>
      </div>

      <!-- Executive Overview -->
      <div class="pdf-topic-card" style="border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 20px; background-color: #F8FAFC;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6D28D9; letter-spacing: 0.5px; margin-bottom: 4px;">Executive Overview</div>
        <div style="font-size: 11.5px; color: #334155; line-height: 1.6;">${escapeHtml(notes.overallSummary)}</div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          ${notes.prerequisites && notes.prerequisites.length > 0 ? `
            <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: 8px 10px; border-radius: 8px;">
              <div style="font-size: 10.5px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">Prerequisites:</div>
              <ul style="margin: 0; padding-left: 16px; font-size: 10.5px; color: #475569;">
                ${notes.prerequisites.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${notes.targetAudience ? `
            <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: 8px 10px; border-radius: 8px;">
              <div style="font-size: 10.5px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">Target Audience:</div>
              <div style="font-size: 10.5px; color: #475569; line-height: 1.4;">${escapeHtml(notes.targetAudience)}</div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Overarching Physics Overview (if present) -->
      ${physicsOverviewHtml}

      <!-- Overarching Language Curriculum (if language subject) -->
      ${notes.languageLearningDetails ? getLanguageLessonHtml(notes.languageLearningDetails, `${notes.languageLearningDetails.targetLanguage} Comprehensive Study Curriculum`) : ''}

      <!-- Analyzed Topics Header -->
      <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-bottom: 12px; margin-top: 18px; display: flex; align-items: center; gap: 6px;">
        <span style="color: #6D28D9;">■</span> Analyzed Topics & Chapters (${notes.topics.length})
      </div>

      <!-- Topics List -->
      ${topicsHtml}

      <!-- Final Synthesis -->
      ${finalSummaryHtml}

      <!-- High-Yield Practice MCQs -->
      ${mcqSectionHtml}

      <!-- Cheat Sheet -->
      ${cheatSheetHtml}

      <!-- Footer Note -->
      <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; font-size: 9.5px; color: #94A3B8;">
        <span>Generated by StudyMind AI — Grounded Video Intelligence</span>
        <span>${escapeHtml(notes.videoTitle)}</span>
      </div>
    `;

    document.body.appendChild(container);

    try {
      // 3. Render canvas at high resolution (scale: 2)
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 800,
      });

      // 4. Initialize jsPDF in A4 Portrait mode
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const margin = 10;
      const usableWidth = pdfWidth - margin * 2;
      const usableHeight = pdfHeight - margin * 2;

      // Calculate canvas height corresponding to one A4 page
      const canvasPageHeight = (canvas.width * usableHeight) / usableWidth;
      const totalCanvasHeight = canvas.height;

      // Smart Section-Aware Pagination:
      const sectionElements = container.querySelectorAll('.pdf-topic-card');
      const containerRect = container.getBoundingClientRect();
      const breakPoints: number[] = [0];

      const cardCanvasTops: number[] = [];
      sectionElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const topInCanvasPixels = (rect.top - containerRect.top) * 2; // scale: 2
        cardCanvasTops.push(topInCanvasPixels);
      });

      let currentY = 0;
      while (currentY < totalCanvasHeight) {
        let nextY = currentY + canvasPageHeight;
        if (nextY >= totalCanvasHeight) {
          breakPoints.push(totalCanvasHeight);
          break;
        }

        const candidateBreak = cardCanvasTops
          .filter((top) => top > currentY + canvasPageHeight * 0.45 && top <= nextY)
          .pop();

        if (candidateBreak && candidateBreak > currentY) {
          nextY = candidateBreak;
        }

        breakPoints.push(nextY);
        currentY = nextY;
      }

      // 5. Slice canvas into pages and insert into PDF
      for (let i = 0; i < breakPoints.length - 1; i++) {
        const startY = breakPoints[i];
        const endY = breakPoints[i + 1];
        const sliceHeight = endY - startY;

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;

        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0, startY, canvas.width, sliceHeight,
            0, 0, canvas.width, sliceHeight
          );

          const imgData = pageCanvas.toDataURL('image/jpeg', 0.96);
          const sliceHeightMm = (sliceHeight * usableWidth) / canvas.width;

          if (i > 0) {
            doc.addPage();
          }

          doc.addImage(imgData, 'JPEG', margin, margin, usableWidth, sliceHeightMm);

          // Add clean running footer on each page
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`StudyMind AI • Page ${i + 1} of ${breakPoints.length - 1}`, pdfWidth - margin, pdfHeight - 4, { align: 'right' });
        }
      }

      // 6. Direct browser download
      const sanitizedTitle = (notes.videoTitle || 'StudyMind_Notes')
        .replace(/[^a-zA-Z0-9_\- ]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .slice(0, 45) || 'StudyMind_Smart_Notes';

      doc.save(`${sanitizedTitle}_Smart_Notes.pdf`);
    } finally {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  }
}
