import { useState } from 'react';
import { Play, Send, CheckCircle2, XCircle, Bot, Loader2, Code2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../utils/config';
import Editor from '@monaco-editor/react';

export default function CodeEditorModule({ problem, dayNumber, dayTopic, onComplete, isCompleted }) {
  const { token } = useAuth();
  
  // Try to load any existing saved code for this day from local storage, else use starter code.
  const storageKey = `code_safesave_day_${dayNumber}`;
  const [code, setCode] = useState(localStorage.getItem(storageKey) || problem.starterCode || '');
  
  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null);
  
  // Grading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);

  const handleEditorChange = (value) => {
    setCode(value);
    localStorage.setItem(storageKey, value);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    setAiFeedback(null);
    try {
      const res = await fetch(`${API_URL}/compiler/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          language: 'java',
          code: code
        })
      });
      const data = await res.json();
      
      if (data.isError) {
         setOutput({ error: data.output });
      } else {
         setOutput({ stdout: data.output });
      }
    } catch {
      setOutput({ error: 'Failed to connect to execution server.' });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setAiFeedback(null);
    try {
      const res = await fetch(`${API_URL}/ai/grade-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: code,
          dayNumber,
          dayTopic,
          problemDescription: problem.description
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setAiFeedback({ passed: false, text: data.message });
      } else {
        setAiFeedback({ passed: data.passed, text: data.feedback });
        if (data.passed) {
          onComplete("Code Sprint Ide Submission"); // We just need a truthy value or string for existingLink callback
        }
      }
    } catch {
      setAiFeedback({ passed: false, text: 'Network error verifying the code.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="text-slate-500" size={20} />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Interactive Code Editor</h3>
        </div>
        
        {isCompleted && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-md border border-emerald-200 dark:border-emerald-800/50">
            <CheckCircle2 size={14} /> Solved & Verified
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        
        {/* Left Pane: Editor */}
        <div className="flex flex-col h-[500px]">
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 font-mono font-bold">
            <span>Main.java</span>
            <span>Java 17</span>
          </div>
          <div className="flex-1 w-full bg-[#1e1e1e]">
            <Editor
              height="100%"
              defaultLanguage="java"
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                roundedSelection: false,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace"
              }}
            />
          </div>
        </div>

        {/* Right Pane: Output & Actions */}
        <div className="flex flex-col bg-slate-50 dark:bg-slate-900 min-h-[500px]">
          <div className="p-5 flex-1 space-y-5 overflow-y-auto">
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{problem.title}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {problem.description}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden flex flex-col">
              <div className="bg-slate-800 px-3 py-1.5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex justify-between items-center">
                <span>Console Output</span>
                {isRunning && <Loader2 size={12} className="animate-spin text-slate-300" />}
              </div>
              <div className="p-4 font-mono text-xs overflow-y-auto min-h-[120px] max-h-[200px] bg-black text-slate-300">
                {!output && !isRunning && <span className="text-slate-600">Click "Run Code" to compile and execute your Java logic locally...</span>}
                {output?.error && <span className="text-red-400 break-words whitespace-pre-wrap">{output.error}</span>}
                {output?.stdout && <span className="text-emerald-400 break-words whitespace-pre-wrap">{output.stdout}</span>}
                {output && !output.error && !output.stdout && <span className="text-slate-500">Program exited successfully with no output.</span>}
              </div>
            </div>

            {/* AI Feedback */}
            {aiFeedback && !isCompleted && (
              <div className={`p-4 rounded-md flex gap-3 items-start animate-in slide-in-from-bottom-2 ${aiFeedback.passed ? 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'}`}>
                <div className="mt-0.5 shrink-0">
                  {aiFeedback.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </div>
                <div>
                  <h6 className="font-bold text-sm mb-1">{aiFeedback.passed ? 'Accepted!' : 'Compile Error / Wrong Answer'}</h6>
                  <p className="text-xs leading-relaxed opacity-90 font-mono whitespace-pre-wrap">{aiFeedback.text}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-2 gap-3">
             <button
               onClick={handleRunCode}
               disabled={isRunning || isSubmitting}
               className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-md transition flex justify-center items-center gap-2 text-sm border border-slate-200 dark:border-slate-700"
             >
               {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} 
               Run Code
             </button>
             <button
               onClick={handleSubmitCode}
               disabled={isCompleted || isSubmitting || isRunning}
               className={`py-2.5 font-semibold rounded-md flex justify-center items-center gap-2 text-sm transition border ${isCompleted || isSubmitting ? 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-600' : 'bg-slate-900 border-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:border-white dark:text-slate-900 dark:hover:bg-slate-200'}`}
             >
               {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} 
               {isCompleted ? 'Solved' : 'Submit'}
             </button>
             <div className="col-span-2 text-center mt-2">
               <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1"><Bot size={12} className="text-slate-500" /> Analysed by AI Tutor</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
