import { useState } from 'react';
import { Github, Save, CircleCheckBig, Loader2, ExternalLink } from 'lucide-react';
import { API_URL } from '../../utils/config';

export default function GithubRepoLinker({ user, token, onUpdate }) {
  const [repoUrl, setRepoUrl] = useState(user?.githubRepo || '');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!user?.githubRepo);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!repoUrl.includes('github.com')) {
      alert('Please enter a valid GitHub repository URL');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user/update-repo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ githubRepo: repoUrl })
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate(data.user);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Github className="text-slate-900 dark:text-white" size={20} />
          <h3 className="font-bold text-slate-900 dark:text-white">Your Project Repo</h3>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold text-primary-600 hover:underline"
          >
            Edit Link
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Link your dedicated GitHub repository for this 50-day challenge.
          </p>
          <div className="flex gap-2">
            <input 
              type="url"
              required
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/my-codesprint-50"
              className="flex-grow px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition"
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate min-w-0 flex-1">
              {user.githubRepo}
            </span>
            <a 
              href={user.githubRepo} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-500"
            >
              <ExternalLink size={16} />
            </a>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            <CircleCheckBig size={12} /> Connected to GitHub
          </div>
        </div>
      )}
    </div>
  );
}
