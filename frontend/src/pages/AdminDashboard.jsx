import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { API_URL } from '../utils/config';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [days, setDays] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const res = await fetch(`${API_URL}/content/roadmap`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDays(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadDayForEdit = async (dayNumber) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/content/day/${dayNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setEditData(data);
      setSelectedDayId(dayNumber);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/day/${selectedDayId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        alert('Day updated successfully!');
        fetchRoadmap();
        setSelectedDayId(null);
      } else {
        alert('Failed to update day.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving data.');
    } finally {
      setSaving(false);
    }
  };

  const renderEditor = () => {
    if (!editData) return null;
    return (
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Editing Day {editData.dayNumber}</h2>
          <button 
            type="button" 
            onClick={() => setSelectedDayId(null)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeft size={16} /> Back to List
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">General Info</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topic Title</label>
              <input 
                type="text" 
                value={editData.topicTitle} 
                onChange={e => setEditData({...editData, topicTitle: e.target.value})}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Short Description</label>
              <textarea 
                value={editData.description} 
                onChange={e => setEditData({...editData, description: e.target.value})}
                className="w-full p-2.5 h-20 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Video YouTube Embed URL</label>
              <input 
                type="url" 
                value={editData.videoUrl || ''} 
                onChange={e => setEditData({...editData, videoUrl: e.target.value})}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Detailed Explanation</label>
              <textarea 
                value={editData.detailedExplanation || ''} 
                onChange={e => setEditData({...editData, detailedExplanation: e.target.value})}
                className="w-full p-2.5 h-48 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm leading-relaxed"
                placeholder="Write the full lesson here..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Common Confusions</label>
              <textarea 
                value={editData.commonConfusions || ''} 
                onChange={e => setEditData({...editData, commonConfusions: e.target.value})}
                className="w-full p-2.5 h-32 rounded-lg border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10 text-orange-900 dark:text-orange-100 font-mono text-sm leading-relaxed"
                placeholder="What beginners get wrong..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">Coding Challenge</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Challenge Title</label>
              <input 
                type="text" 
                value={editData.codingProblem?.title || ''} 
                onChange={e => setEditData({...editData, codingProblem: {...editData.codingProblem, title: e.target.value}})}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instructions</label>
              <textarea 
                value={editData.codingProblem?.description || ''} 
                onChange={e => setEditData({...editData, codingProblem: {...editData.codingProblem, description: e.target.value}})}
                className="w-full p-2.5 h-20 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Starter Code (Java)</label>
              <textarea 
                value={editData.codingProblem?.starterCode || ''} 
                onChange={e => setEditData({...editData, codingProblem: {...editData.codingProblem, starterCode: e.target.value}})}
                className="w-full p-2.5 h-48 font-mono text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-[#1e1e1e] text-[#d4d4d4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-600 dark:text-emerald-500 mb-1">Expected Console Output (Exact Match)</label>
              <textarea 
                value={editData.codingProblem?.expectedOutput || ''} 
                onChange={e => setEditData({...editData, codingProblem: {...editData.codingProblem, expectedOutput: e.target.value}})}
                className="w-full p-2.5 h-24 font-mono text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-[#0d0d0d] text-[#4af626]"
                placeholder="e.g. Hello World!\n"
              />
            </div>
            <p className="text-xs text-slate-500 italic block mt-1">* Note: MCQs and Aptitude questions can be edited directly in the database or added to this UI later for brevity.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-70 transition"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Save Changes to Database'}
          </button>
        </div>
      </form>
    );
  };

  if (loading && !editData) return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
          <Settings size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage all 50 days of CodeSprint curriculum content.</p>
        </div>
      </div>

      {selectedDayId ? (
        renderEditor()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {days.map((day) => (
            <button
              key={day.dayNumber}
              onClick={() => loadDayForEdit(day.dayNumber)}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition text-left flex flex-col items-start gap-2"
            >
              <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md">
                Day {day.dayNumber}
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{day.topicTitle}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{day.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
