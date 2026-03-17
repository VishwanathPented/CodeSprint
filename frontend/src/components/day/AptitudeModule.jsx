import { useState } from 'react';
import { Lightbulb, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';

export default function AptitudeModule({ questions, onComplete, score }) {
  const [answers, setAnswers] = useState({});
  const [showHints, setShowHints] = useState({});
  const [submitted, setSubmitted] = useState(score !== null);

  const handleSelect = (qIndex, oIndex) => {
    if (submitted) return;
    setAnswers({ ...answers, [qIndex]: oIndex });
  };

  const toggleHint = (qIndex) => {
    setShowHints({ ...showHints, [qIndex]: !showHints[qIndex] });
  };

  const handleSubmit = () => {
    let currentScore = 0;
    questions.forEach((q, qIndex) => {
      if (answers[qIndex] !== undefined && q.options[answers[qIndex]].isCorrect) {
        currentScore += 1;
      }
    });
    setSubmitted(true);
    onComplete(currentScore);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HelpCircle className="text-amber-500" size={24} />
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">4. Aptitude Practice</h3>
        </div>
        {submitted && (
          <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full text-sm font-bold">
            Score: {score !== null ? score : '0'} / {questions.length}
          </div>
        )}
      </div>

      <div className="p-6 space-y-10">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                <span className="text-slate-400 mr-2">Q{qIndex + 1}.</span>
                {q.question}
              </h4>
              <button 
                onClick={() => toggleHint(qIndex)}
                className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 px-2 py-1.5 rounded-md transition"
              >
                <Lightbulb size={14} /> Hint
              </button>
            </div>

            {showHints[qIndex] && (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-3 rounded-lg text-sm text-amber-800 dark:text-amber-300 ml-6">
                <span className="font-bold mr-1">Hint:</span> {q.hint}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
              {q.options.map((opt, oIndex) => {
                const isSelected = answers[qIndex] === oIndex;
                const showCorrect = submitted && opt.isCorrect;
                const showWrong = submitted && isSelected && !opt.isCorrect;

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleSelect(qIndex, oIndex)}
                    disabled={submitted}
                    className={clsx(
                      "text-left p-3.5 rounded-xl border flex items-center justify-between transition-all",
                      showCorrect ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" :
                      showWrong ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800" :
                      isSelected ? "bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-600" :
                      "bg-white border-slate-200 hover:border-amber-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:border-amber-500",
                      submitted && !showCorrect && !showWrong && "opacity-50"
                    )}
                  >
                    <span className={clsx("text-sm sm:text-base font-medium", 
                      showCorrect ? "text-emerald-700 dark:text-emerald-400" : 
                      showWrong ? "text-red-700 dark:text-red-400" : 
                      "text-slate-700 dark:text-slate-300"
                    )}>
                      {opt.text}
                    </span>
                    {showCorrect && <CheckCircle2 className="text-emerald-500" size={18} />}
                    {showWrong && <XCircle className="text-red-500" size={18} />}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div className="ml-6 mt-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm border border-slate-100 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Explanation:</span>
                <span className="text-slate-600 dark:text-slate-400">{q.explanation}</span>
              </div>
            )}
          </div>
        ))}

        {!submitted && (
          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < questions.length}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Submit Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
