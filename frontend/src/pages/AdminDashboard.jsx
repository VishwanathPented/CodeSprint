import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, ArrowLeft, Loader2, Users, PieChart, Layout, Plus, Trash2, Edit, CheckCircle, Rocket } from 'lucide-react';
import { API_URL } from '../utils/config';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  // UI State
  const [activeTab, setActiveTab] = useState('content'); // content, users, stats
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data State
  const [days, setDays] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Editor State
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (user && !(user.isAdmin || user.role === 'admin')) {
      console.warn('Unauthorized access to Admin. Redirecting...', user);
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      if (activeTab === 'content') {
        const res = await fetch(`${API_URL}/content/roadmap`, { headers });
        setDays(await res.json());
      } else if (activeTab === 'users') {
        const res = await fetch(`${API_URL}/admin/users`, { headers });
        setAllUsers(await res.json());
      } else if (activeTab === 'stats') {
        const res = await fetch(`${API_URL}/admin/stats`, { headers });
        setStats(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
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
        alert('Day content updated!');
        fetchData();
        setSelectedDayId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // MCQ Add/Remove helper
  const addMcq = () => {
    const newMcqs = [...(editData.mcqs || []), { question: '', options: ['', '', '', ''], correctAnswer: 0 }];
    setEditData({ ...editData, mcqs: newMcqs });
  };
  
  const removeMcq = (index) => {
    const newMcqs = editData.mcqs.filter((_, i) => i !== index);
    setEditData({ ...editData, mcqs: newMcqs });
  };

  const renderContentManager = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {days.map((day) => (
        <button
          key={day.dayNumber}
          onClick={() => loadDayForEdit(day.dayNumber)}
          className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition text-left"
        >
          <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded uppercase tracking-wider mb-2 w-fit">
            Day {day.dayNumber}
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1 line-clamp-1">{day.topicTitle}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{day.description}</p>
        </button>
      ))}
    </div>
  );

  const renderUserManager = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">User</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Progress</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Streak</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">GitHub</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Subscription</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {allUsers.map(u => (
            <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
              <td className="p-4">
                <p className="font-bold text-slate-800 dark:text-slate-100">{u.name}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                   <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500" 
                        style={{ width: `${(u.completedDays?.length / 50) * 100}%` }}
                      ></div>
                   </div>
                   <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Day {u.currentDay}</span>
                </div>
              </td>
              <td className="p-4">
                <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-bold">
                  {u.streak} 🔥
                </span>
              </td>
              <td className="p-4">
                {u.githubRepo ? (
                  <a 
                    href={u.githubRepo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary-600 hover:underline font-medium"
                  >
                    <Github size={12} /> Repo
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">No repo</span>
                )}
              </td>
              <td className="p-4">
                {u.isSubscribed ? (
                  <span className="text-emerald-600 flex items-center gap-1 text-xs font-bold">
                    <CheckCircle size={14} /> Premium
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs font-bold italic">Free Plan</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderStats = () => {
    if (!stats) return null;
    
    const statCards = [
      { label: 'Total Students', value: stats.totalUsers || 0, icon: <Users size={20} />, bgColor: 'bg-blue-100', text: 'text-blue-600', darkBg: 'dark:bg-blue-900/40', darkText: 'dark:text-blue-400' },
      { label: 'Premium Users', value: stats.subscribedUsers || 0, icon: <Layout size={20} />, bgColor: 'bg-emerald-100', text: 'text-emerald-600', darkBg: 'dark:bg-emerald-900/40', darkText: 'dark:text-emerald-400' },
      { label: 'Total Revenue', value: `$${stats.revenue || 0}`, icon: <Rocket size={20} />, bgColor: 'bg-purple-100', text: 'text-purple-600', darkBg: 'dark:bg-purple-900/40', darkText: 'dark:text-purple-400' },
      { label: 'Avg Study Days', value: stats.avgCompletion || 0, icon: <PieChart size={20} />, bgColor: 'bg-orange-100', text: 'text-orange-600', darkBg: 'dark:bg-orange-900/40', darkText: 'dark:text-orange-400' },
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg ${item.bgColor} ${item.darkBg} ${item.text} ${item.darkText} flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{item.label}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{item.value}</h3>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEditor = () => (
    <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-md border border-slate-200 dark:border-slate-700 space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-slate-700">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Day {editData.dayNumber} Editor</h2>
           <p className="text-sm text-slate-500 font-medium">Updating: {editData.topicTitle}</p>
        </div>
        <button type="button" onClick={() => setSelectedDayId(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Video & Lesson */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-primary-600 flex items-center gap-2">
            <Layout size={20} /> Content & Video
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Topic Title</label>
              <input 
                type="text" 
                value={editData.topicTitle} 
                onChange={e => setEditData({...editData, topicTitle: e.target.value})}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Video (YouTube Embed URL)</label>
              <input 
                type="text" 
                value={editData.videoUrl} 
                onChange={e => setEditData({...editData, videoUrl: e.target.value})}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Detailed Explanation</label>
              <textarea 
                value={editData.detailedExplanation} 
                onChange={e => setEditData({...editData, detailedExplanation: e.target.value})}
                rows="10"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Quizzes & Coding */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-amber-600 flex items-center gap-2">
            <Edit size={20} /> Interaction & Code
          </h3>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase">MCQ Questions ({editData.mcqs?.length || 0})</label>
              <button 
                type="button" 
                onClick={addMcq}
                className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Add Question
              </button>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {editData.mcqs?.map((mcq, mIdx) => (
                <div key={mIdx} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 relative">
                  <button 
                    type="button" 
                    onClick={() => removeMcq(mIdx)}
                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                  <input 
                    type="text" 
                    value={mcq.question}
                    placeholder="Question text..."
                    onChange={(e) => {
                      const newMcqs = [...editData.mcqs];
                      newMcqs[mIdx].question = e.target.value;
                      setEditData({...editData, mcqs: newMcqs});
                    }}
                    className="w-full text-sm font-bold border-b border-slate-100 dark:border-slate-700 pb-2 bg-transparent outline-none focus:border-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {mcq.options.map((opt, oIdx) => (
                      <input 
                        key={oIdx}
                        value={opt}
                        placeholder={`Option ${oIdx + 1}`}
                        onChange={(e) => {
                          const newMcqs = [...editData.mcqs];
                          newMcqs[mIdx].options[oIdx] = e.target.value;
                          setEditData({...editData, mcqs: newMcqs});
                        }}
                        className={`text-xs p-2 rounded-lg border ${mcq.correctAnswer === oIdx ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-700 bg-transparent'}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Correct Index:</span>
                     <select 
                       value={mcq.correctAnswer}
                       onChange={(e) => {
                         const newMcqs = [...editData.mcqs];
                         newMcqs[mIdx].correctAnswer = Number(e.target.value);
                         setEditData({...editData, mcqs: newMcqs});
                       }}
                       className="text-xs bg-slate-100 dark:bg-slate-700 rounded p-1"
                     >
                       {[0,1,2,3].map(i => <option key={i} value={i}>{i + 1}</option>)}
                     </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
             <label className="block text-xs font-bold text-slate-500 uppercase">Expected Code Output</label>
             <input 
              type="text" 
              value={editData.codingProblem?.expectedOutput} 
              onChange={e => setEditData({...editData, codingProblem: {...editData.codingProblem, expectedOutput: e.target.value}})}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-emerald-500 font-mono text-xs"
              placeholder="e.g. Hello World!\n"
            />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100 dark:border-slate-700 flex justify-end">
         <button 
           type="submit" 
           disabled={saving}
           className="px-8 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 flex items-center gap-2 transition"
         >
           {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
           {saving ? 'Publishing...' : 'Save & Publish Live'}
         </button>
      </div>
    </form>
  );

  if (loading && !editData && !stats && !allUsers.length) return (
     <div className="flex flex-col items-center justify-center p-20 space-y-4 h-[70vh]">
        <Loader2 className="animate-spin text-primary-500 uppercase" size={40} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Accessing Secure Admin Vault...</p>
     </div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-10 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 text-white shadow-xl flex items-center justify-center scale-110">
              <Settings size={32} />
           </div>
           <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Command Center</h1>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                   CodeSprint Control Panel <span className="text-slate-300 dark:text-slate-600 mx-2">|</span> Admin: {user?.name}
                 </p>
              </div>
           </div>
        </div>

        {!selectedDayId && (
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {[
              { id: 'content', label: 'Curriculum', icon: <Layout size={16} /> },
              { id: 'users', label: 'Students', icon: <Users size={16} /> },
              { id: 'stats', label: 'Analytics', icon: <PieChart size={16} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Body */}
      {selectedDayId ? renderEditor() : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'content' && renderContentManager()}
          {activeTab === 'users' && renderUserManager()}
          {activeTab === 'stats' && renderStats()}
        </div>
      )}
    </div>
  );
}

