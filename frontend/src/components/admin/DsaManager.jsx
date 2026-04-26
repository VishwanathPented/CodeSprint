import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Edit, Save, ArrowLeft, Loader2, Search, Upload } from 'lucide-react';
import { API_URL } from '../../utils/config';
import BulkImportModal from './BulkImportModal';

const TOPICS = ['arrays', 'strings', 'linked-list', 'stack-queue', 'hashing', 'recursion-trees'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function DsaManager({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [importing, setImporting] = useState(false);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/dsa`, { headers });
      setItems(await res.json());
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const blank = () => ({
    slug: '',
    order: (items.at(-1)?.order || 0) + 1,
    title: '',
    topic: 'arrays',
    difficulty: 'Easy',
    companies: [],
    description: '',
    constraints: '',
    starterCode: '// write your solution\n',
    hints: [],
    sampleTests: [{ input: '', expectedOutput: '', explanation: '' }],
    solutionNotes: ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isNew = editing === 'new' || !editing._id;
      const payload = editing === 'new' ? blank() : editing;
      const url = isNew ? `${API_URL}/admin/dsa` : `${API_URL}/admin/dsa/${editing._id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT', headers, body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Save failed: ${data.message || res.status}`);
      } else {
        setEditing(null); load();
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this DSA problem?')) return;
    const res = await fetch(`${API_URL}/admin/dsa/${id}`, { method: 'DELETE', headers });
    if (res.ok) load();
  };

  const handleBulkImport = async (items) => {
    const res = await fetch(`${API_URL}/admin/bulk-import/dsa`, {
      method: 'POST', headers, body: JSON.stringify(items)
    });
    const data = await res.json();
    alert(`Imported ${data.inserted || 0} problems${data.message ? ` (${data.message})` : ''}`);
    load();
  };

  const filtered = items.filter(p => {
    if (topicFilter !== 'all' && p.topic !== topicFilter) return false;
    if (!search) return true;
    const t = search.toLowerCase();
    return p.title?.toLowerCase().includes(t) || p.slug?.toLowerCase().includes(t);
  });

  if (editing) {
    const data = editing === 'new' ? blank() : editing;
    return (
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-lg p-5 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {editing === 'new' ? 'New DSA Problem' : `Edit: ${data.title}`}
          </h2>
          <button type="button" onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><ArrowLeft size={22} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Title"><input required value={data.title} onChange={e => setEditing({ ...data, title: e.target.value })} className={inputCls} /></Field>
          <Field label="Slug (URL)"><input required value={data.slug} onChange={e => setEditing({ ...data, slug: e.target.value })} className={inputCls} placeholder="two-sum" /></Field>
          <Field label="Topic">
            <select value={data.topic} onChange={e => setEditing({ ...data, topic: e.target.value })} className={inputCls}>
              {TOPICS.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Difficulty">
            <select value={data.difficulty} onChange={e => setEditing({ ...data, difficulty: e.target.value })} className={inputCls}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Order"><input type="number" value={data.order} onChange={e => setEditing({ ...data, order: Number(e.target.value) })} className={inputCls} /></Field>
          <Field label="Companies (comma-separated)">
            <input value={(data.companies || []).join(', ')} onChange={e => setEditing({ ...data, companies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className={inputCls} placeholder="TCS, Infosys, Wipro" />
          </Field>
        </div>

        <Field label="Description (Markdown)">
          <textarea required rows="6" value={data.description} onChange={e => setEditing({ ...data, description: e.target.value })} className={inputCls + ' font-mono text-xs'} />
        </Field>
        <Field label="Constraints">
          <textarea rows="3" value={data.constraints || ''} onChange={e => setEditing({ ...data, constraints: e.target.value })} className={inputCls + ' font-mono text-xs'} />
        </Field>
        <Field label="Starter Code">
          <textarea required rows="6" value={data.starterCode} onChange={e => setEditing({ ...data, starterCode: e.target.value })} className={inputCls + ' font-mono text-xs bg-slate-900 text-emerald-300 dark:text-emerald-300'} />
        </Field>
        <Field label="Hints (one per line)">
          <textarea rows="3" value={(data.hints || []).join('\n')} onChange={e => setEditing({ ...data, hints: e.target.value.split('\n').filter(Boolean) })} className={inputCls} />
        </Field>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase">Sample Tests ({(data.sampleTests || []).length})</span>
            <button type="button" onClick={() => setEditing({ ...data, sampleTests: [...(data.sampleTests || []), { input: '', expectedOutput: '', explanation: '' }] })} className="text-xs text-blue-600 font-bold flex items-center gap-1"><Plus size={12} /> Add</button>
          </div>
          {(data.sampleTests || []).map((tc, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg relative">
              <input placeholder="Input" value={tc.input} onChange={e => {
                const arr = [...data.sampleTests]; arr[i].input = e.target.value; setEditing({ ...data, sampleTests: arr });
              }} className={inputCls + ' font-mono text-xs'} />
              <input placeholder="Expected Output" value={tc.expectedOutput} onChange={e => {
                const arr = [...data.sampleTests]; arr[i].expectedOutput = e.target.value; setEditing({ ...data, sampleTests: arr });
              }} className={inputCls + ' font-mono text-xs'} />
              <div className="flex gap-2">
                <input placeholder="Explanation (opt)" value={tc.explanation || ''} onChange={e => {
                  const arr = [...data.sampleTests]; arr[i].explanation = e.target.value; setEditing({ ...data, sampleTests: arr });
                }} className={inputCls + ' flex-1'} />
                <button type="button" onClick={() => setEditing({ ...data, sampleTests: data.sampleTests.filter((_, idx) => idx !== i) })} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded p-2"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        <Field label="Solution Notes (admin-only)">
          <textarea rows="3" value={data.solutionNotes || ''} onChange={e => setEditing({ ...data, solutionNotes: e.target.value })} className={inputCls + ' font-mono text-xs'} />
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
            <input placeholder="Search problems..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
          </div>
          <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
            <option value="all">All topics</option>
            {TOPICS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setImporting(true)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-sm flex items-center gap-2"><Upload size={14} />Bulk</button>
          <button onClick={() => setEditing('new')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm flex items-center gap-2"><Plus size={14} />New Problem</button>
        </div>
      </div>

      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{filtered.length} problem{filtered.length === 1 ? '' : 's'}</div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-xs">#</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-xs">Title</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-xs">Topic</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-xs">Diff</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-xs">Companies</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filtered.map(p => (
                <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.order}</td>
                  <td className="px-4 py-3"><div className="font-bold text-slate-800 dark:text-slate-200">{p.title}</div><div className="text-xs text-slate-400 font-mono">{p.slug}</div></td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-bold">{p.topic}</span></td>
                  <td className="px-4 py-3 text-xs font-bold">{p.difficulty}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{(p.companies || []).join(', ')}</td>
                  <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                    <button onClick={() => setEditing(p)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(p._id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-500">No problems found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <BulkImportModal
        open={importing}
        onClose={() => setImporting(false)}
        onImport={handleBulkImport}
        label="DSA Problem"
        sampleObject={blank()}
      />
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
