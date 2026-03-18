import { useState } from 'react';
import { FileQuestion, CircleCheckBig, XCircle } from 'lucide-react';
import clsx from 'clsx';

export default function McqModule({ mcqs, onComplete, score }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(score !== null);

  const handleSelect = (qIndex, oIndex) => {
    if (submitted) return;
    setAnswers({ ...answers, [qIndex]: oIndex });
  };

  const handleSubmit = () => {
    let currentScore = 0;
    mcqs.forEach((q, qIndex) => {
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
          <FileQuestion className="text-purple-500" size={24} />
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">2. Knowledge Check (MCQs)</h3>
        </div>
        {submitted && (
          <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-full text-sm font-bold">
            Score: {score !== null ? score : '0'} / {mcqs.length}
          </div>
        )}
      </div>

      <div className="p-6 space-y-8">
        {mcqs.map((q, qIndex) => (
          <div key={qIndex} className="space-y-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              <span className="text-slate-400 mr-2">{qIndex + 1}.</span>
              {q.question}
            </h4>
            <div className="space-y-2 pl-6">
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
                      "w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all",
                      showCorrect ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" :
                      showWrong ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800" :
                      isSelected ? "bg-purple-50 border-purple-300 dark:bg-purple-900/20 dark:border-purple-600" :
                      "bg-white border-slate-200 hover:border-purple-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:border-purple-500",
                      submitted && !showCorrect && !showWrong && "opacity-50"
                    )}
                  >
                    <span className={clsx("text-sm sm:text-base", 
                      showCorrect ? "text-emerald-700 dark:text-emerald-400 font-medium" : 
                      showWrong ? "text-red-700 dark:text-red-400" : 
                      "text-slate-700 dark:text-slate-300"
                    )}>
                      {opt.text}
                    </span>
                    {showCorrect && <CircleCheckBig className="text-emerald-500" size={20} />}
                    {showWrong && <XCircle className="text-red-500" size={20} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {!submitted && (
          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < mcqs.length}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Submit Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
