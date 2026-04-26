import { useState } from 'react';
import { Sparkles, Plus, Trash2, Loader2, Save, Wand2, Pencil, AlertCircle, Check, RotateCw } from 'lucide-react';
import { API_URL } from '../../utils/config';

const emptyMcq = () => ({
  question: '',
  options: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]
});

const emptyPredict = () => ({
  codeSnippet: '',
  expectedOutput: '',
  explanation: ''
});

export default function AssessmentBuilder({ token }) {
  const [mode, setMode] = useState('ai'); // 'ai' | 'manual'
  const [dayNumber, setDayNumber] = useState(1);
  const [topicSummary, setTopicSummary] = useState('');
  const [mcqCount, setMcqCount] = useState(10);
  const [predictCount, setPredictCount] = useState(3);
  const [difficulty, setDifficulty] = useState('mixed');

  const [mcqs, setMcqs] = useState([]);
  const [predictOutput, setPredictOutput] = useState([]);

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMode, setSaveMode] = useState('append');
  const [statusMessage, setStatusMessage] = useState(null); // { kind: 'ok'|'err', text }

  const totalQuestions = mcqs.length + predictOutput.length;

  const handleGenerate = async () => {
    if (topicSummary.trim().length < 5) {
      setStatusMessage({ kind: 'err', text: 'Add a topic summary first.' });
      return;
    }
    setGenerating(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`${API_URL}/admin/assessment-builder/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          dayNumber: Number(dayNumber),
          topicSummary,
          mcqCount: Number(mcqCount),
          predictCount: Number(predictCount),
          difficulty
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({ kind: 'err', text: data.message || 'Generation failed.' });
        return;
      }
      setMcqs(data.mcqs || []);
      setPredictOutput(data.predictOutput || []);
      setStatusMessage({
        kind: 'ok',
        text: `Generated ${data.meta?.generatedMcq ?? 0} MCQ(s) + ${data.meta?.generatedPredict ?? 0} predict-output. Review and edit before saving.`
      });
    } catch (err) {
      console.error(err);
      setStatusMessage({ kind: 'err', text: 'Network error. Try again.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (totalQuestions === 0) {
      setStatusMessage({ kind: 'err', text: 'Nothing to save — add or generate questions first.' });
      return;
    }
    // Local validation mirrors backend validation so the admin gets quick feedback.
    for (const [i, m] of mcqs.entries()) {
      if (!m.question.trim()) { setStatusMessage({ kind: 'err', text: `MCQ #${i + 1} has no question text.` }); return; }
      if (m.options.filter(o => o.isCorrect).length !== 1) {
        setStatusMessage({ kind: 'err', text: `MCQ #${i + 1} must have exactly one correct option.` }); return;
      }
      if (m.options.some(o => !o.text.trim())) {
        setStatusMessage({ kind: 'err', text: `MCQ #${i + 1} has empty option(s).` }); return;
      }
    }
    for (const [i, p] of predictOutput.entries()) {
      if (!p.codeSnippet.trim() || !p.expectedOutput.trim()) {
        setStatusMessage({ kind: 'err', text: `Predict-output #${i + 1} needs code + expected output.` }); return;
      }
    }

    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`${API_URL}/admin/assessment-builder/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          dayNumber: Number(dayNumber),
          mcqs,
          predictOutput,
          mode: saveMode
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({ kind: 'err', text: data.message || 'Save failed.' });
        return;
      }
      setStatusMessage({ kind: 'ok', text: data.message || 'Saved.' });
    } catch (err) {
      console.error(err);
      setStatusMessage({ kind: 'err', text: 'Network error while saving.' });
    } finally {
      setSaving(false);
    }
  };

  const updateMcq = (idx, patch) => {
    setMcqs((prev) => prev.map((m, i) => i === idx ? { ...m, ...patch } : m));
  };
  const updateOption = (mIdx, oIdx, patch) => {
    setMcqs((prev) => prev.map((m, i) => {
      if (i !== mIdx) return m;
      return { ...m, options: m.options.map((o, j) => j === oIdx ? { ...o, ...patch } : o) };
    }));
  };
  const setCorrectOption = (mIdx, oIdx) => {
    setMcqs((prev) => prev.map((m, i) => {
      if (i !== mIdx) return m;
      return { ...m, options: m.options.map((o, j) => ({ ...o, isCorrect: j === oIdx })) };
    }));
  };
  const addOption = (mIdx) => {
    setMcqs((prev) => prev.map((m, i) => i === mIdx ? { ...m, options: [...m.options, { text: '', isCorrect: false }] } : m));
  };
  const removeOption = (mIdx, oIdx) => {
    setMcqs((prev) => prev.map((m, i) => {
      if (i !== mIdx) return m;
      const next = m.options.filter((_, j) => j !== oIdx);
      // Ensure at least one is correct.
      if (!next.some(o => o.isCorrect) && next.length > 0) next[0].isCorrect = true;
      return { ...m, options: next };
    }));
  };

  const updatePredict = (idx, patch) => {
    setPredictOutput((prev) => prev.map((p, i) => i === idx ? { ...p, ...patch } : p));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Wand2 className="text-indigo-500" size={22} /> Assessment Builder
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Author per-day MCQs &amp; predict-output questions. Use AI to draft a set, then review and edit before publishing.
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          {[
            { id: 'ai', label: 'AI Auto-Generate', icon: <Sparkles size={14} /> },
            { id: 'manual', label: 'Manual', icon: <Pencil size={14} /> }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${mode === m.id ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </header>

      {/* Day target + AI inputs */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Target Day
            <input
              type="number" min="1" max="200"
              value={dayNumber}
              onChange={(e) => setDayNumber(e.target.value)}
              className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono"
            />
          </label>
          {mode === 'ai' && (
            <>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                # of MCQs
                <input
                  type="number" min="0" max="25"
                  value={mcqCount}
                  onChange={(e) => setMcqCount(e.target.value)}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                # of Predict-Output
                <input
                  type="number" min="0" max="10"
                  value={predictCount}
                  onChange={(e) => setPredictCount(e.target.value)}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Difficulty
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </label>
            </>
          )}
        </div>

        {mode === 'ai' && (
          <div className="mt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Topic / Concept Summary
            </label>
            <textarea
              rows={4}
              value={topicSummary}
              onChange={(e) => setTopicSummary(e.target.value)}
              placeholder="e.g. Polymorphism and Method Overloading in Java — covering compile-time vs runtime dispatch, overloading rules, the role of @Override, and common pitfalls (return-type-only differences, ambiguous overloads)."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm leading-relaxed"
            />
            <div className="mt-3 flex flex-wrap gap-2 justify-end">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition shadow"
              >
                {generating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> Generate questions</>}
              </button>
            </div>
          </div>
        )}

        {mode === 'manual' && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Manual mode — use the buttons below each section to add questions one by one.
          </p>
        )}
      </section>

      {statusMessage && (
        <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${statusMessage.kind === 'ok' ? 'bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-300'}`}>
          {statusMessage.kind === 'ok' ? <Check size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* MCQs */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">MCQs <span className="text-xs text-slate-400 font-normal ml-2">{mcqs.length} total</span></h3>
          <button
            onClick={() => setMcqs((prev) => [...prev, emptyMcq()])}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
          >
            <Plus size={14} /> Add MCQ
          </button>
        </div>
        {mcqs.length === 0 && (
          <p className="text-sm text-slate-400 italic py-6 text-center">No MCQs yet. Generate or add manually.</p>
        )}
        <div className="space-y-4">
          {mcqs.map((m, mIdx) => (
            <div key={mIdx} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/40 dark:bg-slate-800/30">
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-2 shrink-0">Q{mIdx + 1}</span>
                <textarea
                  rows={2}
                  value={m.question}
                  onChange={(e) => updateMcq(mIdx, { question: e.target.value })}
                  placeholder="Question prompt..."
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={() => setMcqs((prev) => prev.filter((_, i) => i !== mIdx))}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  title="Delete this MCQ"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {m.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${mIdx}`}
                      checked={!!opt.isCorrect}
                      onChange={() => setCorrectOption(mIdx, oIdx)}
                      className="accent-emerald-600 cursor-pointer shrink-0"
                      title="Mark as correct"
                    />
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOption(mIdx, oIdx, { text: e.target.value })}
                      placeholder={`Option ${oIdx + 1}`}
                      className={`flex-1 bg-white dark:bg-slate-900 border rounded px-3 py-1.5 text-sm ${opt.isCorrect ? 'border-emerald-400 dark:border-emerald-700' : 'border-slate-200 dark:border-slate-700'}`}
                    />
                    {m.options.length > 2 && (
                      <button
                        onClick={() => removeOption(mIdx, oIdx)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                        title="Remove option"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
                {m.options.length < 6 && (
                  <button
                    onClick={() => addOption(mIdx)}
                    className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1"
                  >
                    <Plus size={12} /> Add option
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Predict Output */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Predict the Output <span className="text-xs text-slate-400 font-normal ml-2">{predictOutput.length} total</span></h3>
          <button
            onClick={() => setPredictOutput((prev) => [...prev, emptyPredict()])}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
          >
            <Plus size={14} /> Add Predict
          </button>
        </div>
        {predictOutput.length === 0 && (
          <p className="text-sm text-slate-400 italic py-6 text-center">No predict-output questions yet.</p>
        )}
        <div className="space-y-4">
          {predictOutput.map((p, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/40 dark:bg-slate-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Snippet {idx + 1}</span>
                <button
                  onClick={() => setPredictOutput((prev) => prev.filter((_, i) => i !== idx))}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <textarea
                rows={6}
                value={p.codeSnippet}
                onChange={(e) => updatePredict(idx, { codeSnippet: e.target.value })}
                placeholder="public class Test { ... }"
                className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded px-3 py-2 text-xs font-mono leading-relaxed"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Expected Output
                  <textarea
                    rows={2}
                    value={p.expectedOutput}
                    onChange={(e) => updatePredict(idx, { expectedOutput: e.target.value })}
                    placeholder="exact console output"
                    className="mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-xs font-mono"
                  />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Explanation
                  <textarea
                    rows={2}
                    value={p.explanation}
                    onChange={(e) => updatePredict(idx, { explanation: e.target.value })}
                    placeholder="Why this output (1-2 sentences)"
                    className="mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-xs"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Save */}
      <section className="sticky bottom-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-800 dark:text-slate-100">Day {dayNumber}</span> · {mcqs.length} MCQ + {predictOutput.length} predict ready to save.
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-bold">
              {['append', 'replace'].map((m) => (
                <button
                  key={m}
                  onClick={() => setSaveMode(m)}
                  className={`px-3 py-1.5 rounded-md transition capitalize ${saveMode === m ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            {mode === 'ai' && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                title="Regenerate from the same topic summary"
              >
                <RotateCw size={12} /> Regenerate
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || totalQuestions === 0}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition shadow"
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save to Day {dayNumber}</>}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
