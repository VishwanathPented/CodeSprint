import { useState, useMemo } from 'react';
import { BookOpen, CheckCircle, Sparkles, Loader2, Code2, Terminal, Lightbulb, ListChecks, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { API_URL } from '../../utils/config';

// Split a detailedExplanation block into a "lead" paragraph and the remaining
// paragraphs/bulleted sections so the UI can render them with clear hierarchy.
function parseExplanation(text = '') {
  const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  if (blocks.length === 0) return { lead: '', rest: [] };
  return { lead: blocks[0], rest: blocks.slice(1) };
}

// Pull bullet-style lines (starting with -, *, •, or "1.") out of a block so we
// can render them as a real list rather than a wall of text.
function extractBullets(block) {
  const lines = block.split('\n');
  const bullets = [];
  const prose = [];
  for (const line of lines) {
    const m = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (m) bullets.push(m[1].trim());
    else if (line.trim()) prose.push(line.trim());
  }
  return { bullets, prose: prose.join(' ') };
}

export default function ConceptModule({ content, onComplete, isCompleted, token }) {
  const [simpleLoading, setSimpleLoading] = useState(false);
  const [simpleText, setSimpleText] = useState('');
  const [showSimple, setShowSimple] = useState(false);

  const handleGenerateSimple = async () => {
    if (showSimple) { setShowSimple(false); return; }
    if (simpleText) { setShowSimple(true); return; }

    setSimpleLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/eli5`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          topicTitle: content.topicTitle,
          description: content.detailedExplanation || content.description
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSimpleText(data.simplifiedText);
        setShowSimple(true);
      } else {
        alert(data.message || 'Failed to generate a simple response.');
      }
    } catch (err) {
      console.error(err);
      alert('Could not reach the AI service.');
    } finally {
      setSimpleLoading(false);
    }
  };

  const { lead, rest } = useMemo(() => parseExplanation(content.detailedExplanation || ''), [content.detailedExplanation]);
  const sections = useMemo(() => rest.map(extractBullets), [rest]);
  const examples = content.predictOutput || [];
  const starter = content.codingProblem?.starterCode;
  const codingProblem = content.codingProblem;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
        <BookOpen className="text-primary-500" size={24} />
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">1. Concept &amp; Technical Deep Dive</h3>
      </div>

      <div className="p-6 space-y-8">
        {/* Lead summary */}
        {lead && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-primary-500" />
              <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">What you'll master today</h4>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed whitespace-pre-wrap border-l-4 border-primary-200 dark:border-primary-800 pl-4">
              {lead}
            </p>
          </section>
        )}

        {/* Detailed sections — each "paragraph" in detailedExplanation becomes its own card.
            Bulleted lines get rendered as a list, prose stays as paragraphs. */}
        {sections.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ListChecks size={18} className="text-blue-500" />
              <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">Technical Breakdown</h4>
            </div>
            <div className="space-y-4">
              {sections.map((sec, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30 p-4">
                  {sec.prose && (
                    <p className="text-slate-700 dark:text-slate-300 text-[14.5px] leading-relaxed whitespace-pre-wrap mb-2">
                      {sec.prose}
                    </p>
                  )}
                  {sec.bullets.length > 0 && (
                    <ul className="space-y-1.5 text-[14.5px] text-slate-700 dark:text-slate-300">
                      {sec.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2 leading-relaxed">
                          <span className="text-primary-500 font-bold shrink-0 mt-0.5">›</span>
                          <span dangerouslySetInnerHTML={{
                            __html: b
                              // bold for `code` and **bold**
                              .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[13px]">$1</code>')
                              .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-slate-100">$1</strong>')
                          }} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Worked Examples — pulled from predictOutput. Shows code → output → why. */}
        {examples.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Code2 size={18} className="text-emerald-500" />
              <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">Worked Examples</h4>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">walk-through</span>
            </div>
            <div className="space-y-4">
              {examples.map((ex, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Example {idx + 1}</span>
                    <span className="text-[10px] text-slate-400">trace through it line by line</span>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 text-sm p-4 overflow-x-auto font-mono leading-relaxed">
                    <code>{ex.codeSnippet}</code>
                  </pre>
                  <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border-t border-emerald-100 dark:border-emerald-900/40 flex items-start gap-2">
                    <Terminal size={14} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <span className="font-semibold text-emerald-900 dark:text-emerald-300">Output:</span>{' '}
                      <code className="text-emerald-700 dark:text-emerald-400 font-mono">{ex.expectedOutput}</code>
                    </div>
                  </div>
                  {ex.explanation && (
                    <div className="px-4 py-3 text-[14px] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 leading-relaxed">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Why: </span>
                      {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Starter template + assignment context — gives the student a clear preview
            of what they'll be coding later in the day. */}
        {codingProblem && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Code2 size={18} className="text-purple-500" />
              <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">Today's Coding Assignment</h4>
            </div>
            <div className="rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-900/10 p-4 mb-3">
              <div className="font-semibold text-purple-900 dark:text-purple-200 mb-1">{codingProblem.title}</div>
              <p className="text-sm text-purple-900/80 dark:text-purple-300/80 leading-relaxed">
                {codingProblem.description}
              </p>
              {codingProblem.expectedOutput && (
                <div className="mt-2 text-xs text-purple-800/70 dark:text-purple-300/70">
                  Expected output: <code className="font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/40">{codingProblem.expectedOutput.replace(/\n/g, '⏎ ')}</code>
                </div>
              )}
            </div>
            {starter && (
              <pre className="bg-slate-900 text-slate-100 text-sm p-4 overflow-x-auto font-mono leading-relaxed rounded-xl border border-slate-200 dark:border-slate-700">
                <code>{starter}</code>
              </pre>
            )}
          </section>
        )}

        {/* Common confusions — high-signal section. Kept distinct visually. */}
        {content.commonConfusions && (
          <section className="p-5 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/40 rounded-xl">
            <h4 className="font-bold text-orange-800 dark:text-orange-400 mb-2 flex items-center gap-2">
              <Lightbulb size={18} /> Common Pitfalls &amp; Confusions
            </h4>
            <p className="text-orange-800 dark:text-orange-300/90 text-sm leading-relaxed whitespace-pre-wrap">
              {content.commonConfusions}
            </p>
          </section>
        )}

        {/* Generate Simple Response — calls the existing /api/ai/eli5 endpoint. */}
        <section className="rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-900/10 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold text-indigo-900 dark:text-indigo-200 text-sm">
                Need this in plain English?
              </p>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-300/70">
                One click for an AI-rewritten beginner-friendly version.
              </p>
            </div>
            <button
              onClick={handleGenerateSimple}
              disabled={simpleLoading}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm shadow-sm transition"
            >
              {simpleLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {simpleLoading ? 'Generating...' : showSimple ? 'Hide Simple Response' : 'Generate Simple Response'}
            </button>
          </div>

          {showSimple && simpleText && (
            <div className="mt-4 prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-slate-900 p-4 rounded-md border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-700 dark:text-indigo-400">Simplified by Sprint-AI</span>
              </div>
              <ReactMarkdown
                components={{
                  strong: ({ children }) => <strong className="font-black text-indigo-900 dark:text-indigo-200">{children}</strong>,
                  p: ({ children }) => <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc ml-4 space-y-1.5 mb-3 text-slate-700 dark:text-slate-300">{children}</ul>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  code: ({ children }) => <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[13px]">{children}</code>
                }}
              >
                {simpleText}
              </ReactMarkdown>
            </div>
          )}
        </section>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {isCompleted ? "Great! You've worked through this concept." : "Read through the explanation and examples before moving on."}
          </p>
          <button
            onClick={onComplete}
            disabled={isCompleted}
            className={`px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 justify-center ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md'
            }`}
          >
            {isCompleted ? <><CheckCircle size={18} /> Read</> : 'Mark as Read'}
          </button>
        </div>
      </div>
    </div>
  );
}
