import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Edit, Save, ArrowLeft, Loader2, Search, Upload } from 'lucide-react';
import { API_URL } from '../../utils/config';
import BulkImportModal from './BulkImportModal';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const QUERY_DIFF = ['Easy', 'Medium', 'Hard'];

export default function SqlManager({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState(false);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/sql`, { headers });
      setItems(await res.json());
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const blank = () => ({
    lessonNumber: (items.at(-1)?.lessonNumber || 0) + 1,
    title: '',
    description: '',
    difficulty: 'Beginner',
    conceptExplanation: '',
    schemaDescription: '',
    setupSql: '',
    theoryMcqs: [],
    queryProblems: []
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isNew = editing === 'new' || !editing._id;
      const payload = editing === 'new' ? blank() : editing;
      const url = isNew ? `${API_URL}/admin/sql` : `${API_URL}/admin/sql/${editing._id}`;
      const res = await fetch(url, { method: isNew ? 'POST' : 'PUT', headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Save failed: ${data.message || res.status}`);
      } else { setEditing(null); load(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this SQL lesson?')) return;
    const res = await fetch(`${API_URL}/admin/sql/${id}`, { method: 'DELETE', headers });
    if (res.ok) load();
  };

  const handleBulkImport = async (items) => {
    const res = await fetch(`${API_URL}/admin/bulk-import/sql`, { method: 'POST', headers, body: JSON.stringify(items) });
    const data = await res.json();
    alert(`Imported ${data.inserted || 0} lessons${data.message ? ` (${data.message})` : ''}`);
    load();
  };

  const filtered = items.filter(l => {
    if (!search) return true;
    const t = search.toLowerCase();
    return l.title?.toLowerCase().includes(t) || String(l.lessonNumber).includes(t);
  });

  if (editing) {
    const data = editing === 'new' ? blank() : editing;

    const updateMcq = (mIdx, fn) => {
      const arr = [...data.theoryMcqs]; arr[mIdx] = fn(arr[mIdx]); setEditing({ ...data, theoryMcqs: arr });
    };
    const updateQp = (qIdx, fn) => {
      const arr = [...data.queryProblems]; arr[qIdx] = fn(arr[qIdx]); setEditing({ ...data, queryProblems: arr });
    };

    return (
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800 space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{editing === 'new' ? 'New SQL Lesson' : `Edit Lesson ${data.lessonNumber}`}</h2>
          <button type="button" onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><ArrowLeft size={22} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Lesson Number"><input required type="number" value={data.lessonNumber} onChange={e => setEditing({ ...data, lessonNumber: Number(e.target.value) })} className={inputCls} /></Field>
          <Field label="Difficulty">
            <select value={data.difficulty} onChange={e => setEditing({ ...data, difficulty: e.target.value })} className={inputCls}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Title"><input required value={data.title} onChange={e => setEditing({ ...data, title: e.target.value })} className={inputCls} /></Field>
        </div>

        <Field label="Description"><textarea required rows="2" value={data.description} onChange={e => setEditing({ ...data, description: e.target.value })} className={inputCls} /></Field>
        <Field label="Concept Explanation (Markdown)"><textarea required rows="6" value={data.conceptExplanation} onChange={e => setEditing({ ...data, conceptExplanation: e.target.value })} className={inputCls + ' font-mono text-xs'} /></Field>
        <Field label="Schema Description"><textarea rows="3" value={data.schemaDescription || ''} onChange={e => setEditing({ ...data, schemaDescription: e.target.value })} className={inputCls + ' font-mono text-xs'} /></Field>
        <Field label="Setup SQL"><textarea required rows="6" value={data.setupSql} onChange={e => setEditing({ ...data, setupSql: e.target.value })} className={inputCls + ' font-mono text-xs bg-slate-900 text-emerald-300'} /></Field>

        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Theory MCQs ({data.theoryMcqs.length})</span>
            <button type="button" onClick={() => setEditing({ ...data, theoryMcqs: [...data.theoryMcqs, { question: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }], explanation: '' }] })} className="text-xs text-blue-600 font-bold flex items-center gap-1"><Plus size={12} /> Add MCQ</button>
          </div>
          {data.theoryMcqs.map((mcq, mIdx) => (
            <div key={mIdx} className="p-4 bg-white dark:bg-slate-800 rounded-lg space-y-2 relative border border-slate-200 dark:border-slate-700">
              <button type="button" onClick={() => setEditing({ ...data, theoryMcqs: data.theoryMcqs.filter((_, i) => i !== mIdx) })} className="absolute top-2 right-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded p-1"><Trash2 size={14} /></button>
              <input placeholder="Question" value={mcq.question} onChange={e => updateMcq(mIdx, m => ({ ...m, question: e.target.value }))} className={inputCls} />
              {mcq.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex gap-2 items-center">
                  <input type="radio" name={`correct-${mIdx}`} checked={opt.isCorrect} onChange={() => updateMcq(mIdx, m => ({ ...m, options: m.options.map((o, i) => ({ ...o, isCorrect: i === oIdx })) }))} />
                  <input placeholder={`Option ${oIdx + 1}`} value={opt.text} onChange={e => updateMcq(mIdx, m => ({ ...m, options: m.options.map((o, i) => i === oIdx ? { ...o, text: e.target.value } : o) }))} className={inputCls} />
                </div>
              ))}
              <input placeholder="Explanation (optional)" value={mcq.explanation || ''} onChange={e => updateMcq(mIdx, m => ({ ...m, explanation: e.target.value }))} className={inputCls} />
            </div>
          ))}
        </div>

        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Query Problems ({data.queryProblems.length})</span>
            <button type="button" onClick={() => setEditing({ ...data, queryProblems: [...data.queryProblems, { title: '', prompt: '', starterQuery: '', solutionQuery: '', hint: '', explanation: '', orderMatters: false, difficulty: 'Easy' }] })} className="text-xs text-blue-600 font-bold flex items-center gap-1"><Plus size={12} /> Add Query</button>
          </div>
          {data.queryProblems.map((qp, qIdx) => (
            <div key={qIdx} className="p-4 bg-white dark:bg-slate-800 rounded-lg space-y-2 relative border border-slate-200 dark:border-slate-700">
              <button type="button" onClick={() => setEditing({ ...data, queryProblems: data.queryProblems.filter((_, i) => i !== qIdx) })} className="absolute top-2 right-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded p-1"><Trash2 size={14} /></button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input placeholder="Title" value={qp.title} onChange={e => updateQp(qIdx, q => ({ ...q, title: e.target.value }))} className={inputCls} />
                <select value={qp.difficulty} onChange={e => updateQp(qIdx, q => ({ ...q, difficulty: e.target.value }))} className={inputCls}>
                  {QUERY_DIFF.map(d => <option key={d}>{d}</option>)}
                </select>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={qp.orderMatters} onChange={e => updateQp(qIdx, q => ({ ...q, orderMatters: e.target.checked }))} />
                  Row order matters
                </label>
              </div>
              <textarea rows="2" placeholder="Prompt" value={qp.prompt} onChange={e => updateQp(qIdx, q => ({ ...q, prompt: e.target.value }))} className={inputCls} />
              <textarea rows="2" placeholder="Starter Query" value={qp.starterQuery || ''} onChange={e => updateQp(qIdx, q => ({ ...q, starterQuery: e.target.value }))} className={inputCls + ' font-mono text-xs'} />
              <textarea rows="2" placeholder="Solution Query (admin-only reference)" value={qp.solutionQuery} onChange={e => updateQp(qIdx, q => ({ ...q, solutionQuery: e.target.value }))} className={inputCls + ' font-mono text-xs bg-slate-900 text-emerald-300'} />
              <input placeholder="Hint (optional)" value={qp.hint || ''} onChange={e => updateQp(qIdx, q => ({ ...q, hint: e.target.value }))} className={inputCls} />
              <input placeholder="Explanation (optional)" value={qp.explanation || ''} onChange={e => updateQp(qIdx, q => ({ ...q, explanation: e.target.value }))} className={inputCls} />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={() => setEditing(null)} className="px-6 py-2 font-bold text-slate-500">Cancel</button>
          <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}Save
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search lessons..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setImporting(true)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-sm flex items-center gap-2"><Upload size={14} />Bulk</button>
          <button onClick={() => setEditing('new')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm flex items-center gap-2"><Plus size={14} />New Lesson</button>
        </div>
      </div>

      <BulkImportModal
        open={importing}
        onClose={() => setImporting(false)}
        onImport={handleBulkImport}
        label="SQL Lesson"
        sampleObject={blank()}
      />

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" size={32} /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(l => (
            <div key={l._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 group">
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-bold uppercase">Lesson {l.lessonNumber}</span>
                <span className="text-[10px] font-bold text-slate-400">{l.difficulty}</span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1 line-clamp-1">{l.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{l.description}</p>
              <div className="flex gap-3 text-xs text-slate-500 font-bold mb-3">
                <span>{l.theoryMcqs?.length || 0} MCQs</span>
                <span>{l.queryProblems?.length || 0} queries</span>
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setEditing(l)} className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold flex justify-center items-center gap-1"><Edit size={12} />Edit</button>
                <button onClick={() => handleDelete(l._id)} className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</span>
      {children}
    </label>
  );
}
