import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Edit, Save, ArrowLeft, Loader2, Search, Upload } from 'lucide-react';
import { API_URL } from '../../utils/config';

/**
 * Generic CRUD UI for 4-option MCQ banks (theory, aptitude).
 *
 * Props:
 *   - token: auth bearer
 *   - basePath: backend resource (e.g. '/admin/theory')
 *   - label: human-readable name (e.g. 'Theory Question')
 *   - sections: array of section enum values (e.g. ['os','networks','oop'])
 *   - showPassage: whether to render an optional passage textarea
 */
export default function QuestionBankManager({ token, basePath, label, sections, showPassage = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // null | 'new' | object
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}${basePath}`, { headers });
      setItems(await res.json());
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [basePath]);

  const blank = () => ({
    section: sections[0],
    topic: '',
    difficulty: 'Medium',
    question: '',
    passage: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
    timeLimit: showPassage ? 75 : 45
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isNew = editing === 'new' || !editing._id;
      const url = isNew ? `${API_URL}${basePath}` : `${API_URL}${basePath}/${editing._id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers,
        body: JSON.stringify(editing === 'new' ? blank() : editing)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Save failed: ${data.message || res.status}`);
      } else {
        setEditing(null);
        await load();
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${label}?`)) return;
    const res = await fetch(`${API_URL}${basePath}/${id}`, {
      method: 'DELETE', headers
    });
    if (res.ok) load();
  };

  const handleBulkImport = async () => {
    const json = window.prompt(`Paste a JSON array of ${label}s to bulk-import:`);
    if (!json) return;
    try {
      const parsed = JSON.parse(json);
      const bank = basePath.replace('/admin/', '');
      const res = await fetch(`${API_URL}/admin/bulk-import/${bank}`, {
        method: 'POST', headers, body: JSON.stringify(parsed)
      });
      const data = await res.json();
      alert(`Imported ${data.inserted || 0} items${data.message ? ` (${data.message})` : ''}`);
      load();
    } catch (e) {
      alert(`Invalid JSON: ${e.message}`);
    }
  };

  const filtered = items.filter(q => {
    if (sectionFilter !== 'all' && q.section !== sectionFilter) return false;
    if (!search) return true;
    const t = search.toLowerCase();
    return (q.question?.toLowerCase().includes(t)) ||
           (q.topic?.toLowerCase().includes(t));
  });

  if (editing) {
    const data = editing === 'new' ? blank() : editing;
    return (
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800 space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {editing === 'new' ? `New ${label}` : `Edit ${label}`}
          </h2>
          <button type="button" onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
            <ArrowLeft size={22} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Section">
            <select required value={data.section} onChange={e => setEditing({ ...data, section: e.target.value })} className={inputCls}>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Topic">
            <input required type="text" value={data.topic} onChange={e => setEditing({ ...data, topic: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Difficulty">
            <select value={data.difficulty} onChange={e => setEditing({ ...data, difficulty: e.target.value })} className={inputCls}>
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </Field>
        </div>

        {showPassage && (
          <Field label="Passage (optional, for reading-comp questions)">
            <textarea rows="4" value={data.passage || ''} onChange={e => setEditing({ ...data, passage: e.target.value })} className={inputCls} />
          </Field>
        )}

        <Field label="Question">
          <textarea required rows="3" value={data.question} onChange={e => setEditing({ ...data, question: e.target.value })} className={inputCls} />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.options.map((opt, i) => (
            <input
              key={i}
              required
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={e => {
                const opts = [...data.options];
                opts[i] = e.target.value;
                setEditing({ ...data, options: opts });
              }}
              className={`${inputCls} ${data.correctIndex === i ? 'ring-2 ring-emerald-500 border-emerald-500' : ''}`}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <Field label="Correct Option">
            <select value={data.correctIndex} onChange={e => setEditing({ ...data, correctIndex: Number(e.target.value) })} className={inputCls}>
              {[0, 1, 2, 3].map(i => <option key={i} value={i}>Option {i + 1}</option>)}
            </select>
          </Field>
          <Field label="Time Limit (seconds)">
            <input type="number" min="10" value={data.timeLimit || 45} onChange={e => setEditing({ ...data, timeLimit: Number(e.target.value) })} className={inputCls} />
          </Field>
        </div>

        <Field label="Explanation">
          <textarea rows="3" value={data.explanation || ''} onChange={e => setEditing({ ...data, explanation: e.target.value })} className={inputCls} />
        </Field>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={() => setEditing(null)} className="px-6 py-2 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
          <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save
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
            <input
              placeholder={`Search ${label.toLowerCase()}s...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            />
          </div>
          <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
            <option value="all">All sections</option>
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={handleBulkImport} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-200">
            <Upload size={14} /> Bulk Import
          </button>
          <button onClick={() => setEditing('new')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm flex items-center gap-2">
            <Plus size={14} /> New {label}
          </button>
        </div>
      </div>

      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {filtered.length} {label.toLowerCase()}{filtered.length === 1 ? '' : 's'}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs">Section</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs">Topic</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs">Question</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs">Diff</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filtered.map(q => (
                <tr key={q._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-bold uppercase">{q.section}</span></td>
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{q.topic}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 line-clamp-1 max-w-md">{q.question}</td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-500">{q.difficulty}</td>
                  <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                    <button onClick={() => setEditing(q)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(q._id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-12 text-center text-slate-500">No {label.toLowerCase()}s found.</td></tr>
              )}
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
