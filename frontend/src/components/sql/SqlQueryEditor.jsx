import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, CheckCircle2, XCircle, Loader2, Lightbulb, Database } from 'lucide-react';
import { runQuery, compareResults } from '../../utils/sqlRunner';

export default function SqlQueryEditor({ problem, setupSql, onSolved, alreadySolved }) {
  const [query, setQuery] = useState(problem.starterQuery || '');
  const [isRunning, setIsRunning] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const handleRun = async () => {
    if (!query.trim()) return;
    setIsRunning(true);
    setVerdict(null);
    const out = await runQuery(setupSql, query);
    setIsRunning(false);
    setRunResult(out);
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setIsGrading(true);
    setVerdict(null);

    const student = await runQuery(setupSql, query);
    if (student.error) {
      setVerdict({ passed: false, reason: `Error running your query: ${student.error}` });
      setRunResult(student);
      setIsGrading(false);
      return;
    }

    const expected = await runQuery(setupSql, problem.solutionQuery);
    if (expected.error) {
      setVerdict({ passed: false, reason: `Internal: reference solution failed — ${expected.error}` });
      setIsGrading(false);
      return;
    }

    const cmp = compareResults(student.lastResult, expected.lastResult, problem.orderMatters);
    setRunResult(student);
    setVerdict({ passed: cmp.equal, reason: cmp.equal ? 'Correct! Your result matches the expected output.' : cmp.reason });
    if (cmp.equal) onSolved?.(problem._id);
    setIsGrading(false);
  };

  const resultTable = runResult?.lastResult;
  const difficultyColor =
    problem.difficulty === 'Hard'
      ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50'
      : problem.difficulty === 'Medium'
        ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50'
        : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Database className="text-slate-500 shrink-0" size={18} />
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{problem.title}</h4>
          <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${difficultyColor}`}>
            {problem.difficulty}
          </span>
        </div>
        {alreadySolved && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-md border border-emerald-200 dark:border-emerald-800/50 shrink-0">
            <CheckCircle2 size={14} /> Solved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        {/* Left: prompt + editor */}
        <div className="flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{problem.prompt}</p>
            {problem.hint && (
              <button
                onClick={() => setShowHint((s) => !s)}
                className="mt-3 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline"
              >
                <Lightbulb size={12} /> {showHint ? 'Hide hint' : 'Show hint'}
              </button>
            )}
            {showHint && problem.hint && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-md p-2 font-mono">
                {problem.hint}
              </p>
            )}
          </div>
          <div className="h-[220px] sm:h-[260px] lg:h-[300px] bg-[#1e1e1e]">
            <Editor
              height="100%"
              defaultLanguage="sql"
              theme="vs-dark"
              value={query}
              onChange={(v) => setQuery(v || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                padding: { top: 12 },
                scrollBeyondLastLine: false,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace"
              }}
            />
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning || isGrading}
              className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-md flex justify-center items-center gap-2 text-sm border border-slate-200 dark:border-slate-700 disabled:opacity-50"
            >
              {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Run
            </button>
            <button
              onClick={handleSubmit}
              disabled={isGrading || isRunning || alreadySolved}
              className={`py-2 font-semibold rounded-md flex justify-center items-center gap-2 text-sm transition border ${
                alreadySolved
                  ? 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-600'
                  : 'bg-slate-900 border-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:border-white dark:text-slate-900 dark:hover:bg-slate-200'
              }`}
            >
              {isGrading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {alreadySolved ? 'Solved' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Right: result table + verdict */}
        <div className="flex flex-col bg-slate-50 dark:bg-slate-900 min-h-[280px] lg:min-h-[360px]">
          <div className="px-4 py-2 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            Result
          </div>
          <div className="p-4 flex-1 overflow-auto">
            {!runResult && <p className="text-xs text-slate-500">Click Run to execute your query.</p>}
            {runResult?.error && (
              <pre className="text-xs text-red-600 dark:text-red-400 font-mono whitespace-pre-wrap break-words">
                {runResult.error}
              </pre>
            )}
            {resultTable && (
              <div className="overflow-auto">
                <table className="text-xs font-mono border-collapse w-full">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800">
                      {resultTable.columns.map((c) => (
                        <th key={c} className="border border-slate-200 dark:border-slate-700 px-2 py-1 text-left text-slate-700 dark:text-slate-300 font-bold">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultTable.values.slice(0, 50).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        {row.map((cell, j) => (
                          <td key={j} className="border border-slate-200 dark:border-slate-700 px-2 py-1 text-slate-600 dark:text-slate-400">
                            {cell === null ? <span className="text-slate-400 italic">NULL</span> : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {resultTable.values.length > 50 && (
                  <p className="text-[10px] text-slate-500 mt-2">Showing first 50 of {resultTable.values.length} rows.</p>
                )}
              </div>
            )}
            {runResult && !resultTable && !runResult.error && (
              <p className="text-xs text-slate-500 italic">Query executed. No rows returned.</p>
            )}
          </div>

          {verdict && (
            <div
              className={`mx-4 mb-4 p-3 rounded-md flex gap-2 items-start border ${
                verdict.passed
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
              }`}
            >
              {verdict.passed ? <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> : <XCircle size={14} className="mt-0.5 shrink-0" />}
              <div className="text-xs leading-relaxed">
                <p className="font-bold">{verdict.passed ? 'Accepted' : 'Incorrect'}</p>
                <p className="opacity-90">{verdict.reason}</p>
                {verdict.passed && problem.explanation && (
                  <p className="mt-2 opacity-90 italic">{problem.explanation}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
