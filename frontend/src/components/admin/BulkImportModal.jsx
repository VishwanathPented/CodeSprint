import { useState } from 'react';
import { X, Upload, Loader2, FileText } from 'lucide-react';

/**
 * Reusable bulk-import modal. Hands a parsed JS array up to onImport(items).
 * Parent is responsible for the actual POST and result alert.
 */
export default function BulkImportModal({ open, onClose, onImport, label, sampleObject }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async () => {
    setError('');
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`);
      return;
    }
    const items = Array.isArray(parsed) ? parsed : parsed.items;
    if (!Array.isArray(items)) {
      setError('Top-level value must be a JSON array (or { items: [...] }).');
      return;
    }
    setBusy(true);
    try {
      await onImport(items);
      setText('');
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const sample = JSON.stringify([sampleObject], null, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload size={18} /> Bulk Import {label}s
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Paste a JSON array. Items that fail validation will be skipped.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><X size={18} /></button>
        </div>

        <details className="text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <summary className="cursor-pointer px-3 py-2 font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2"><FileText size={12} /> Show example schema</summary>
          <pre className="px-3 py-2 text-[10px] font-mono text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-pre-wrap">{sample}</pre>
          <button
            type="button"
            onClick={() => setText(sample)}
            className="mx-3 mb-3 text-[10px] font-bold text-indigo-600 hover:underline"
          >
            Load example into editor →
          </button>
        </details>

        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setError(''); }}
          rows="14"
          placeholder={`[\n  ${JSON.stringify(sampleObject)},\n  ...\n]`}
          className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono"
        />

        {error && (
          <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="px-5 py-2 font-bold text-slate-500 hover:text-slate-700 text-sm">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={busy || !text.trim()}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg flex items-center gap-2 text-sm"
          >
            {busy ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
