import { useState, useEffect } from 'react';
import { Terminal, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

export default function PredictOutputModule({ predicts, onComplete, isCompleted }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [allPassed, setAllPassed] = useState(isCompleted);

  // If there are no predict questions, auto-complete
  useEffect(() => {
    if (!predicts || predicts.length === 0) {
      if (!isCompleted) onComplete();
    }
  }, [predicts, isCompleted, onComplete]);

  if (!predicts || predicts.length === 0 || allPassed) return null;

  const currentSnippet = predicts[currentIndex];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Normalize string to ignore trailing spaces/newlines for leniency
    const normalizedInput = userInput.trim().replace(/\r\n/g, '\n');
    const normalizedExpected = currentSnippet.expectedOutput.trim().replace(/\r\n/g, '\n');

    if (normalizedInput === normalizedExpected) {
      if (currentIndex < predicts.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setUserInput('');
        setShowAnswer(false);
      } else {
        setAllPassed(true);
        onComplete();
      }
    } else {
      setError('Incorrect output. Trace the variables carefully!');
    }
  };

  const skipQuestion = () => {
    // Only used conceptually if they give up, but let's just show answer instead
    setShowAnswer(true);
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800 text-slate-300">
      <div className="flex items-center gap-2 mb-6 text-white font-bold">
        <Terminal size={22} className="text-emerald-400" />
        <h2>Predict the Output ({currentIndex + 1}/{predicts.length})</h2>
      </div>

      <p className="text-sm text-slate-400 mb-6">
        Read the following Java snippet like a compiler. What exactly will print to the console?
      </p>

      <div className="bg-black/50 p-4 rounded-xl border border-slate-700 font-mono text-sm text-blue-300 mb-6 overflow-x-auto">
        <pre><code>{currentSnippet.codeSnippet}</code></pre>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
            Console Output
          </label>
          <textarea
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              setError('');
            }}
            placeholder="Type exactly what prints here..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition h-24"
          />
        </div>

        {error && !showAnswer && (
          <div className="flex items-center gap-2 text-red-400 text-sm font-bold bg-red-900/20 p-3 rounded-xl border border-red-900/50">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {showAnswer && (
          <div className="flex items-start gap-3 bg-indigo-900/30 p-4 rounded-xl border border-indigo-800/50">
            <Eye size={20} className="text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-indigo-200 text-sm mb-2"><strong className="text-white">Expected Output:</strong> {currentSnippet.expectedOutput}</p>
              <p className="text-indigo-300 text-xs italic">{currentSnippet.explanation}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition"
          >
            Submit Prediction
          </button>
          {!showAnswer && (
            <button
              type="button"
              onClick={skipQuestion}
              className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl transition"
            >
              Show Answer
            </button>
          )}
          {showAnswer && (
             <button
               type="button"
               onClick={() => {
                 // Force complete basically
                 if (currentIndex < predicts.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                    setUserInput('');
                    setShowAnswer(false);
                  } else {
                    setAllPassed(true);
                    onComplete();
                  }
               }}
               className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
             >
               I Understand <CheckCircle2 size={18} />
             </button>
          )}
        </div>
      </form>
    </div>
  );
}
