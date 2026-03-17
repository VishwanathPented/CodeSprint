import { useState } from 'react';
import { Terminal, Play, CheckCircle } from 'lucide-react';
import { API_URL } from '../../utils/config';

export default function CodeModule({ problem, onComplete, isCompleted }) {
  const [code, setCode] = useState(problem.starterCode || '');
  const [output, setOutput] = useState(null);
  const [isSuccess, setIsSuccess] = useState(isCompleted);

  const handleRunCode = async () => {
    setOutput('Compiling and running Java code...');
    
    try {
      const res = await fetch(`${API_URL}/compiler/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      const data = await res.json();
      
      if (data.isError) {
        setOutput(`Compilation/Execution Error:\n${data.output}`);
        return;
      }
      
      const cleanExpected = problem.expectedOutput ? problem.expectedOutput.trim() : "";
      const cleanReal = data.output ? data.output.trim() : "";
      
      if (cleanExpected === cleanReal || cleanExpected === "true") {
        setOutput(`Success!\n\nOutput:\n${data.output}`);
        setTimeout(() => {
          setIsSuccess(true);
          if (!isCompleted) {
            onComplete();
          }
        }, 1000);
      } else {
        setOutput(`Output:\n${data.output}\n\n[Warning] Expected Output:\n${cleanExpected}`);
      }
      
    } catch (err) {
      setOutput('Failed to execute code. Ensure the backend compiler API is running.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="text-blue-500" size={24} />
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">3. Coding Challenge</h3>
        </div>
        {isSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-bold">
            <CheckCircle size={16} /> Passed
          </div>
        )}
      </div>

      <div className="p-6">
        <h4 className="font-bold text-slate-900 dark:text-white mb-2">{problem.title}</h4>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">{problem.description}</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Editor (Main.java)</label>
            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-700 dark:border-slate-700 bg-[#1e1e1e]">
              <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-slate-400 ml-2 font-mono">Main.java</span>
              </div>
              <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isSuccess}
                className="w-full h-96 p-4 font-mono text-sm bg-transparent text-[#d4d4d4] outline-none resize-none focus:ring-1 focus:ring-blue-500/50 disabled:opacity-80 leading-relaxed"
                spellCheck="false"
              ></textarea>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Console Output</label>
              <button 
                onClick={handleRunCode}
                disabled={isSuccess}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition ${
                  isSuccess 
                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                }`}
              >
                <Play size={16} /> {isSuccess ? 'Completed' : 'Run Code'}
              </button>
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-700 dark:border-slate-700 bg-[#0d0d0d] h-[calc(100%-52px)]">
              <div className="bg-[#1a1a1a] px-4 py-2 flex items-center border-b border-slate-800">
                 <span className="text-xs text-slate-400 font-mono">Terminal</span>
              </div>
              <div className="p-4 font-mono text-sm text-[#4af626] overflow-y-auto h-[calc(100%-33px)] w-full">
                {output ? (
                  <pre className="whitespace-pre-wrap">{output}</pre>
                ) : (
                  <span className="text-slate-600">// Click "Run Code" to execute...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
