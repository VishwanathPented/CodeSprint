import { useEffect, useMemo, useState } from 'react';
import { Trash2, Loader2, MessageSquare } from 'lucide-react';
import { API_URL } from '../../utils/config';

export default function CommentsManager({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/comments`, { headers });
      setItems(await res.json());
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    const res = await fetch(`${API_URL}/admin/comments/${id}`, { method: 'DELETE', headers });
    if (res.ok) load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" size={32} /></div>;

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{items.length} comment{items.length === 1 ? '' : 's'}</div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800/50">
        {items.map(c => (
          <div key={c._id} className="p-4 flex gap-4 items-start hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 flex-shrink-0">
              {c.user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">{c.user?.name || 'Unknown'}</span>
                <span className="text-slate-400">·</span>
                <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[10px] font-bold">Day {c.dayNumber}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap break-words">{c.text}</p>
            </div>
            <button onClick={() => handleDelete(c._id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"><Trash2 size={16} /></button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="px-4 py-16 text-center text-slate-500">
            <MessageSquare size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p>No comments yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
