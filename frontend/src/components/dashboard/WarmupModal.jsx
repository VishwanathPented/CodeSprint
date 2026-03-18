import { useState, useEffect } from 'react';
import { X, Brain, CircleCheckBig, XCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { API_URL } from '../../utils/config';
import { useAuth } from '../../context/AuthContext';

export default function WarmupModal({ isOpen, onClose }) {
  const { token, user } = useAuth();
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      setLoading(true);
      fetch(`${API_URL}/user/warmup`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setMcqs(data.mcqs || []);
        setCurrentIndex(0);
        setSelectedOption(null);
        setShowResult(false);
        setScore(0);
        setQuizFinished(false);
      })
      .catch(err => console.error("Error fetching warmup MCQs", err))
      .finally(() => setLoading(false));
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleSelect = (idx) => {
    if (!showResult) {
      setSelectedOption(idx);
    }
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    setShowResult(true);
    if (selectedOption === mcqs[currentIndex].correctOption) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < mcqs.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/50">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Brain size={22} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white leading-tight">Daily Warmup</h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Spaced Repetition</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition rounded-full hover:bg-white dark:hover:bg-slate-700">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 min-h-[350px] flex flex-col">
          {loading ? (
            <div className="flex-grow flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="text-slate-500 font-medium">Brewing questions from your history...</p>
            </div>
          ) : mcqs.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                <Brain size={32} />
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white">Not enough data yet!</h4>
              <p className="text-slate-500 text-sm max-w-[250px]">
                Complete at least one Day in the roadmap to unlock the Daily Warmup feature.
              </p>
              <button 
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-xl"
              >
                Go to Roadmap
              </button>
            </div>
          ) : quizFinished ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center space-y-6 animate-in slide-in-from-bottom-4">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <Sparkles size={40} />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Warmup Complete!</h4>
                <p className="text-slate-500 font-medium">You scored <span className="text-blue-600 dark:text-blue-400 font-black">{score}</span> out of {mcqs.length}</p>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000" 
                  style={{ width: `${(score / mcqs.length) * 100}%` }}
                />
              </div>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-xl shadow-blue-500/20 active:scale-[0.98]"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <div className="flex-grow flex flex-col animate-in fade-in">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">
                  Question {currentIndex + 1} of {mcqs.length}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  from Day {mcqs[currentIndex].sourceDay}
                </span>
              </div>
              
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6 leading-relaxed">
                {mcqs[currentIndex].question}
              </h4>

              <div className="space-y-3 mb-8">
                {mcqs[currentIndex].options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectDoc = mcqs[currentIndex].correctOption === idx;
                  
                  // Styling logic
                  let btnClass = "w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-200 ";
                  
                  if (!showResult) {
                    btnClass += isSelected 
                      ? "border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200" 
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200  dark:hover:bg-slate-700";
                  } else {
                    if (isCorrectDoc) {
                      btnClass += "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-600";
                    } else if (isSelected && !isCorrectDoc) {
                      btnClass += "bg-red-50 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600";
                    } else {
                      btnClass += "border-slate-200 bg-slate-50 text-slate-400 opacity-50 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-500";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={showResult}
                      className={btnClass}
                    >
                      <div className="flex justify-between items-center">
                        <span>{opt}</span>
                        {showResult && isCorrectDoc && <CircleCheckBig size={18} className="text-emerald-500 shrink-0" />}
                        {showResult && isSelected && !isCorrectDoc && <XCircle size={18} className="text-red-500 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                {!showResult ? (
                  <button
                    onClick={handleCheck}
                    disabled={selectedOption === null}
                    className="w-full py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold rounded-xl disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 transition shadow-sm active:scale-[0.98]"
                  >
                    Check Answer
                  </button>
                ) : (
                  <div className="space-y-4 animate-in slide-in-from-bottom-2">
                    <div className="p-4 bg-blue-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 rounded-xl border border-blue-100 dark:border-slate-700">
                      <strong className="text-blue-800 dark:text-blue-400 block mb-1">Explanation:</strong>
                      {mcqs[currentIndex].explanation}
                    </div>
                    <button
                      onClick={handleNext}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                    >
                      {currentIndex === mcqs.length - 1 ? 'Finish Warmup' : 'Next Question'}
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
