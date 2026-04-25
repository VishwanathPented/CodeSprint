import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Edit, Save, ArrowLeft, Loader2, Search, Upload } from 'lucide-react';
import { API_URL } from '../../utils/config';

const CATEGORIES = ['introduction', 'behavioral', 'strengths', 'career', 'situational', 'closing'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function HrManager({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/hr`, { headers });
      setItems(await res.json());
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const blank = () => ({
    order: (items.at(-1)?.order || 0) + 1,
    category: 'behavioral',
    question: '',
    difficulty: 'Medium',
    framework: 'STAR',
    sampleAnswer: '',
    tips: []
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isNew = editing === 'new' || !editing._id;
      const payload = editing === 'new' ? blank() : editing;
      const url = isNew ? `${API_URL}/admin/hr` : `${API_URL}/admin/hr/${editing._id}`;
      const res = await fetch(url, { method: isNew ? 'POST' : 'PUT', headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Save failed: ${data.message || res.status}`);
      } else { setEditing(null); load(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this HR question?')) return;
    const res = await fetch(`${API_URL}/admin/hr/${id}`, { method: 'DELETE', headers });
    if (res.ok) load();
  };

  const handleBulkImport = async () => {
    const json = window.prompt('Paste a JSON array of HR questions:');
    if (!json) return;
    try {
      const parsed = JSON.parse(json);
      const res = await fetch(`${API_URL}/admin/bulk-import/hr`, { method: 'POST', headers, body: JSON.stringify(parsed) });
      const data = await res.json();
      alert(`Imported ${data.inserted || 0} questions${data.message ? ` (${data.message})` : ''}`);
      load();
    } catch (e) { alert(`Invalid JSON: ${e.message}`); }
  };

  const filtered = items.filter(q => {
    if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;
    if (!search) return true;
    return q.question?.toLowerCase().includes(search.toLowerCase());
  });

  if (editing) {
    const data = editing === 'new' ? blank() : editing;
    return (
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800 space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{editing === 'new' ? 'New HR Question' : `Edit Q${data.order}`}</h2>
          <button type="button" onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><ArrowLeft size={22} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Order"><input required type="number" value={data.order} onChange={e => setEditing({ ...data, order: Number(e.target.value) })} className={inputCls} /></Field>
          <Field label="Category">
            <select value={data.category} onChange={e => setEditing({ ...data, category: e.target.value })} className={inputCls}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Difficulty">
            <select value={data.difficulty} onChange={e => setEditing({ ...data, difficulty: e.target.value })} className={inputCls}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Question"><textarea required rows="2" value={data.question} onChange={e => setEditing({ ...data, question: e.target.value })} className={inputCls} /></Field>
        <Field label="Framework (STAR, PEEL, etc)"><input required value={data.framework} onChange={e => setEditing({ ...data, framework: e.target.value })} className={inputCls} /></Field>
        <Field label="Sample Answer"><textarea required rows="6" value={data.sampleAnswer} onChange={e => setEditing({ ...data, sampleAnswer: e.target.value })} className={inputCls} /></Field>
        <Field label="Tips (one per line)">
          <textarea rows="3" value={(data.tips || []).join('\n')} onChange={e => setEditing({ ...data, tips: e.target.value.split('\n').filter(Boolean) })} className={inputCls} />
        </Field>

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
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
            <option value="all">All categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={handleBulkImport} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-sm flex items-center gap-2"><Upload size={14} />Bulk</button>
          <button onClick={() => setEditing('new')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm flex items-center gap-2"><Plus size={14} />New Question</button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" size={32} /></div> : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-xs">#</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-xs">Category</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-xs">Question</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-xs">Framework</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filtered.map(q => (
                <tr key={q._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{q.order}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-bold uppercase">{q.category}</span></td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 line-clamp-1 max-w-md">{q.question}</td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-500">{q.framework}</td>
                  <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                    <button onClick={() => setEditing(q)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(q._id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="5" className="px-4 py-12 text-center text-slate-500">No HR questions found.</td></tr>}
            </tbody>
          </table>
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
