import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, ArrowLeft, Loader2, Users, PieChart, Layout, Plus, Trash2, Edit, Rocket, Github, Download, Search, AlertCircle, Phone, BookOpen, Clock, ShieldCheck, Target, TriangleAlert, Code2, Database, Brain, Calculator, MessageCircle, MessageSquare, Crown, RotateCcw, X, KeyRound, FileText, CheckSquare, Square, Wand2 } from 'lucide-react';
import { API_URL } from '../utils/config';
import QuestionBankManager from '../components/admin/QuestionBankManager';
import DsaManager from '../components/admin/DsaManager';
import SqlManager from '../components/admin/SqlManager';
import HrManager from '../components/admin/HrManager';
import CommentsManager from '../components/admin/CommentsManager';
import UserDetailDrawer from '../components/admin/UserDetailDrawer';
import AssessmentBuilder from '../components/admin/AssessmentBuilder';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  // UI State
  const [activeTab, setActiveTab] = useState('dsa');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data State
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [assessmentResults, setAssessmentResults] = useState([]);

  // Assessment CMS State
  const [assessmentSubTab, setAssessmentSubTab] = useState('logs');
  const [adminTests, setAdminTests] = useState([]);
  const [editTestId, setEditTestId] = useState(null);
  const [editTestData, setEditTestData] = useState(null);

  // Users Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // all | premium | free | admin

  // Multi-select state for bulk actions
  const [selectedUserIds, setSelectedUserIds] = useState(() => new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Per-user edit modal
  const [editUser, setEditUser] = useState(null);
  const [savingUser, setSavingUser] = useState(false);

  // User detail drawer (read-only deep view)
  const [detailUserId, setDetailUserId] = useState(null);

  // Tracks which student's PDF is generating (id) so we can show a per-row spinner
  const [reportGeneratingId, setReportGeneratingId] = useState(null);
  const [bulkProgress, setBulkProgress] = useState(null); // { done, total } | null

  const downloadStudentReport = async (student) => {
    setReportGeneratingId(student._id);
    try {
      const { generateStudentReportPdf } = await import('../utils/studentReport');
      generateStudentReportPdf(student);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF report.');
    } finally {
      setReportGeneratingId(null);
    }
  };

  const downloadBulkReports = async (students) => {
    if (!students.length) return;
    if (!window.confirm(`Generate PDF reports for ${students.length} user${students.length === 1 ? '' : 's'} and download as a ZIP?`)) return;

    setBulkProgress({ done: 0, total: students.length });
    try {
      const [{ generateStudentReportPdf }, { default: JSZip }] = await Promise.all([
        import('../utils/studentReport'),
        import('jszip')
      ]);
      const zip = new JSZip();
      for (let i = 0; i < students.length; i++) {
        const { blob, filename } = generateStudentReportPdf(students[i], { returnBlob: true });
        zip.file(filename, blob);
        setBulkProgress({ done: i + 1, total: students.length });
        // Yield to the event loop so the progress UI repaints between renders.
        await new Promise(r => setTimeout(r, 0));
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CodeSprint_Reports_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(`Bulk export failed: ${err.message}`);
    } finally {
      setBulkProgress(null);
    }
  };

  useEffect(() => {
    if (user && !(user.isAdmin || user.role === 'admin')) {
      console.warn('Unauthorized access to Admin. Redirecting...', user);
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    // Tabs whose components manage their own data fetching
    const selfManaged = ['dsa', 'sql', 'theory', 'aptitude', 'hr', 'comments'];
    if (selfManaged.includes(activeTab)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'users') {
        const res = await fetch(`${API_URL}/admin/users`, { headers });
        setAllUsers(await res.json());
      } else if (activeTab === 'stats') {
        const res = await fetch(`${API_URL}/admin/stats`, { headers });
        setStats(await res.json());
      } else if (activeTab === 'assessments') {
        const [resLogs, resTests] = await Promise.all([
           fetch(`${API_URL}/admin/assessments/results`, { headers }),
           fetch(`${API_URL}/admin/assessments`, { headers })
        ]);
        setAssessmentResults(await resLogs.json());
        setAdminTests(await resTests.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (id) => {
    if(!window.confirm('Are you sure you want to delete this test? All student results will be permanently wiped!')) return;
    try {
      const res = await fetch(`${API_URL}/admin/assessments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if(res.ok) {
        alert('Assessment deleted.');
        fetchData();
      }
    } catch(err) { console.error(err); }
  };

  const handleDeleteResult = async (id, studentName) => {
    if (!window.confirm(`Delete ${studentName}'s submission? They'll be able to re-attempt the test.`)) return;
    const res = await fetch(`${API_URL}/admin/assessments/results/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchData();
    else { const d = await res.json().catch(() => ({})); alert(d.message || 'Delete failed'); }
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editTestId === 'new' ? `${API_URL}/admin/assessments` : `${API_URL}/admin/assessments/${editTestId}`;
      const method = editTestId === 'new' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editTestData)
      });
      if (res.ok) {
        alert('Assessment saved successfully!');
        fetchData();
        setEditTestId(null);
        setEditTestData(null);
      } else {
        const data = await res.json();
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ===== User actions =====
  const handleToggleSubscription = async (u) => {
    const res = await fetch(`${API_URL}/admin/users/${u._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isSubscribed: !u.isSubscribed })
    });
    if (res.ok) fetchData();
  };

  const handleToggleAdmin = async (u) => {
    const nextRole = u.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${u.name}'s role to ${nextRole}?`)) return;
    const res = await fetch(`${API_URL}/admin/users/${u._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role: nextRole })
    });
    if (res.ok) fetchData();
  };

  const handleResetProgress = async (u) => {
    if (!window.confirm(`Wipe ALL progress for ${u.name}? Streaks, completed days, scores, and review cards will be cleared. This cannot be undone.`)) return;
    const res = await fetch(`${API_URL}/admin/users/${u._id}/reset-progress`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) { alert('Progress reset'); fetchData(); }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Permanently DELETE ${u.name} (${u.email})? Their account and all related data will be removed.`)) return;
    if (!window.confirm(`Are you absolutely sure? Type "${u.email}" was already confirmed implicitly. Click OK to delete.`)) return;
    const res = await fetch(`${API_URL}/admin/users/${u._id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      alert('User deleted');
      setSelectedUserIds(prev => {
        const next = new Set(prev);
        next.delete(u._id);
        return next;
      });
      fetchData();
    }
    else { const d = await res.json().catch(() => ({})); alert(d.message || 'Delete failed'); }
  };

  // ===== Multi-select helpers =====
  const toggleSelectUser = (id) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedUserIds).filter(id => id !== user?._id);
    if (ids.length === 0) {
      alert('No deletable users selected (you cannot delete your own admin account).');
      return;
    }
    if (!window.confirm(`Permanently DELETE ${ids.length} user${ids.length === 1 ? '' : 's'}? All accounts, results, comments, and review cards will be removed. This cannot be undone.`)) return;
    if (!window.confirm(`Final confirmation — proceed with deleting ${ids.length} user${ids.length === 1 ? '' : 's'}?`)) return;

    setBulkDeleting(true);
    try {
      const res = await fetch(`${API_URL}/admin/users/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert(data.message || `Deleted ${data.deletedCount} user(s)`);
        setSelectedUserIds(new Set());
        fetchData();
      } else {
        alert(data.message || 'Bulk delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Bulk delete request failed');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      const res = await fetch(`${API_URL}/admin/users/${editUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: editUser.name,
          email: editUser.email,
          username: editUser.username,
          isSubscribed: editUser.isSubscribed,
          role: editUser.role,
          currentDay: editUser.currentDay,
          streak: editUser.streak,
          githubRepo: editUser.githubRepo,
          registrationDetails: editUser.registrationDetails
        })
      });
      if (res.ok) { setEditUser(null); fetchData(); }
      else { const d = await res.json().catch(() => ({})); alert(d.message || 'Save failed'); }
    } finally { setSavingUser(false); }
  };

  const handleExportCSV = () => {
    if (!allUsers || allUsers.length === 0) return;

    const headers = ['Name', 'Email', 'USN', 'Year', 'Branch', 'Phone', 'Current Day', 'Streak', 'Joined Date'];
    
    const csvContent = allUsers.map(s => {
      const usn = s.registrationDetails?.usn || 'N/A';
      const year = s.registrationDetails?.year || 'N/A';
      const branch = s.registrationDetails?.branch || 'N/A';
      const phone = s.registrationDetails?.phoneNumber || 'N/A';
      const joined = new Date(s.createdAt).toLocaleDateString();

      return `"${s.name}","${s.email}","${usn}","${year}","${branch}","${phone}",${s.currentDay},${s.streak},"${joined}"`;
    });

    csvContent.unshift(headers.join(',')); // Add headers to top

    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `CodeSprint_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = allUsers.filter(s => {
    const term = searchTerm.toLowerCase();
    const usn = s.registrationDetails?.usn?.toLowerCase() || '';
    const branch = s.registrationDetails?.branch?.toLowerCase() || '';
    const matchesSearch = s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      usn.includes(term) ||
      branch.includes(term);
    if (!matchesSearch) return false;
    if (userFilter === 'premium') return s.isSubscribed;
    if (userFilter === 'free') return !s.isSubscribed && s.role !== 'admin';
    if (userFilter === 'admin') return s.role === 'admin';
    return true;
  });

  // Self can never be selected, so the "select all" anchor is the filtered list
  // minus the current admin's own row.
  const selectableFiltered = filteredStudents.filter(s => s._id !== user?._id);
  const visibleSelectedCount = selectableFiltered.filter(s => selectedUserIds.has(s._id)).length;
  const allFilteredSelected = selectableFiltered.length > 0 && visibleSelectedCount === selectableFiltered.length;

  const toggleSelectAllVisible = () => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        selectableFiltered.forEach(s => next.delete(s._id));
      } else {
        selectableFiltered.forEach(s => next.add(s._id));
      }
      return next;
    });
  };

  const renderUserManager = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 w-full relative z-10 justify-between items-stretch sm:items-center">
         <div className="flex flex-col sm:flex-row gap-3 flex-1">
           <div className="relative w-full sm:w-72">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
             <input
               type="text"
               placeholder="Search by Name, USN, Branch..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
             />
           </div>
           <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
             {[
               { id: 'all', label: 'All' },
               { id: 'premium', label: 'Premium' },
               { id: 'free', label: 'Free' },
               { id: 'admin', label: 'Admins' },
             ].map(f => (
               <button
                 key={f.id}
                 onClick={() => setUserFilter(f.id)}
                 className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${userFilter === f.id ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
               >
                 {f.label}
               </button>
             ))}
           </div>
         </div>

         <div className="flex gap-2">
           <button
             onClick={() => downloadBulkReports(filteredStudents)}
             disabled={!!bulkProgress || filteredStudents.length === 0}
             className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 whitespace-nowrap text-sm"
           >
             {bulkProgress
               ? <><Loader2 className="animate-spin" size={16} /> {bulkProgress.done}/{bulkProgress.total}</>
               : <><FileText size={16} /> PDF ZIP ({filteredStudents.length})</>}
           </button>
           <button
             onClick={handleExportCSV}
             className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50 whitespace-nowrap text-sm"
           >
             <Download size={16} /> CSV
           </button>
         </div>
      </div>

      {selectedUserIds.size > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3 sm:p-4 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-900/40 rounded-xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-300">
            <CheckSquare size={16} />
            {selectedUserIds.size} user{selectedUserIds.size === 1 ? '' : 's'} selected
            {visibleSelectedCount < selectedUserIds.size && (
              <span className="text-xs font-normal text-red-700/70 dark:text-red-300/70">
                ({selectedUserIds.size - visibleSelectedCount} hidden by current filter)
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedUserIds(new Set())}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Clear selection
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition flex items-center gap-2"
            >
              {bulkDeleting
                ? <><Loader2 className="animate-spin" size={14} /> Deleting...</>
                : <><Trash2 size={14} /> Delete selected</>}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="pl-6 pr-2 py-4 w-10">
                  <button
                    type="button"
                    onClick={toggleSelectAllVisible}
                    disabled={selectableFiltered.length === 0}
                    title={allFilteredSelected ? 'Deselect all visible' : 'Select all visible'}
                    className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30"
                  >
                    {allFilteredSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">USN</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Branch/Year</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-center">Progress</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Contact & Setup</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredStudents.map((s) => {
                const isSelf = s._id === user?._id;
                const isSelected = selectedUserIds.has(s._id);
                return (
                <tr key={s._id} className={`transition group ${isSelected ? 'bg-red-50/60 dark:bg-red-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'}`}>
                  <td className="pl-6 pr-2 py-4 w-10">
                    {!isSelf ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectUser(s._id)}
                        className="w-4 h-4 accent-indigo-600 cursor-pointer"
                        aria-label={`Select ${s.name}`}
                      />
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">self</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setDetailUserId(s._id)}
                      className="flex items-center gap-3 text-left hover:opacity-80 transition"
                      title="View detailed progress"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {s.name}
                          </span>
                          {s.role === 'admin' && (
                            <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded text-[9px] font-black uppercase tracking-wider">Admin</span>
                          )}
                          {s.isSubscribed && (
                            <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded text-[9px] font-black uppercase tracking-wider">Premium</span>
                          )}
                          {s._id === user?._id && (
                            <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded text-[9px] font-black uppercase tracking-wider">You</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">{s.email}</div>
                      </div>
                    </button>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-600 dark:text-slate-300 uppercase">
                    {s.registrationDetails?.usn || <span className="opacity-40">- pending -</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <div className="flex flex-wrap items-center gap-2">
                        <BookOpen size={12} className="text-indigo-400" /> 
                        {s.registrationDetails?.branch || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-primary-400" /> 
                        {s.registrationDetails?.year || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center font-black text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {s.currentDay}
                      </div>
                      <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-[10px] font-bold">
                        {s.streak} 🔥
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium space-y-2">
                    {s.registrationDetails?.phoneNumber ? (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                        <Phone size={14} className="text-slate-400" />
                        {s.registrationDetails.phoneNumber}
                      </div>
                    ) : (
                      <span className="opacity-40 italic block text-xs">No Phone</span>
                    )}
                    
                    {s.githubRepo ? (
                      <a href={s.githubRepo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
                        <Github size={12} /> Repo Link
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic flex items-center gap-1"><Github size={12} /> No repo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => setEditUser(s)} title="Edit user" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleToggleSubscription(s)} title={s.isSubscribed ? 'Revoke premium' : 'Grant premium'} className={`p-2 rounded ${s.isSubscribed ? 'text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <Crown size={14} />
                      </button>
                      {s._id !== user?._id && (
                        <button onClick={() => handleToggleAdmin(s)} title={s.role === 'admin' ? 'Demote to user' : 'Promote to admin'} className={`p-2 rounded ${s.role === 'admin' ? 'text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                          <ShieldCheck size={14} />
                        </button>
                      )}
                      <button onClick={() => handleResetProgress(s)} title="Reset all progress" className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded text-orange-500">
                        <RotateCcw size={14} />
                      </button>
                      <button onClick={() => downloadStudentReport(s)} disabled={reportGeneratingId === s._id} title="Download progress report (PDF)" className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded text-emerald-600 disabled:opacity-50">
                        {reportGeneratingId === s._id ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                      </button>
                      {s._id !== user?._id && (
                        <button onClick={() => handleDeleteUser(s)} title="Delete user" className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center text-slate-500">
                    <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                    <p className="text-lg">No users found matching your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAssessmentsManager = () => (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button className={`pb-3 px-2 font-bold text-sm border-b-2 transition ${assessmentSubTab === 'logs' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`} onClick={() => setAssessmentSubTab('logs')}>Student Result Logs</button>
        <button className={`pb-3 px-2 font-bold text-sm border-b-2 transition ${assessmentSubTab === 'manage' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`} onClick={() => setAssessmentSubTab('manage')}>Manage Exams (CMS)</button>
      </div>

      {assessmentSubTab === 'logs' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden animate-in fade-in">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Placement Test Logs</h2>
            <p className="text-sm text-slate-500">Monitor automated proctoring strikes and standardized test scores globally.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Candidate / USN</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Assessment</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-center">Final Score</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-center">Proctoring Status</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {assessmentResults.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{r.studentName}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{r.usn || r.studentEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded uppercase">
                           {r.company}
                         </span>
                         <span className="font-medium text-slate-700 dark:text-slate-300">{r.testTitle}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className={`inline-flex items-center justify-center w-16 py-1 rounded-md font-black text-sm ${r.warnings >= 3 ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-500' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-500'}`}>
                         {r.score} / {r.total}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       {r.warnings >= 3 ? (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 dark:bg-red-900/10 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold">
                           <TriangleAlert size={14} /> Terminated
                         </div>
                       ) : r.warnings > 0 ? (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 dark:bg-amber-900/10 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold">
                           <AlertCircle size={14} /> {r.warnings} Strikes
                         </div>
                       ) : (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold">
                           <ShieldCheck size={14} /> Secure
                         </div>
                       )}
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-xs text-slate-500 font-medium">
                         {new Date(r.submittedAt).toLocaleString()}
                         {r.isAutoSubmitted && <span className="block text-red-400 mt-0.5 italic text-[10px]">Auto-Submitted</span>}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => handleDeleteResult(r._id, r.studentName)} title="Delete this submission" className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500">
                         <Trash2 size={14} />
                       </button>
                    </td>
                  </tr>
                ))}
                {assessmentResults.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                      <Target size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                      <p className="text-lg">No assessment logs available yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4">
           <button onClick={() => {
              setEditTestData({ companyName: '', title: '', description: '', durationMinutes: 60, difficulty: 'Medium', isActive: true, mcqs: [], codingProblems: [] });
              setEditTestId('new');
           }} className="bg-indigo-50 border-2 border-dashed border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition min-h-[200px]">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 rounded-full flex items-center justify-center">
                <Plus size={24} />
              </div>
              <div>
                <h3 className="font-black tracking-tight text-indigo-900 dark:text-indigo-300">Create New Exam</h3>
                <p className="text-xs text-indigo-600/70 font-medium mt-1">Build a fresh mock assessment for placement readiness.</p>
              </div>
           </button>
  
           {adminTests.map(t => (
             <div key={t._id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm flex flex-col justify-between group min-h-[200px]">
               <div>
                  <div className="flex justify-between items-start mb-3">
                     <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded ${t.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>{t.isActive ? 'Live' : 'Draft'}</span>
                     <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{t.difficulty}</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1">{t.companyName} Assessment</h3>
                  <p className="text-sm font-medium text-slate-500 mb-2 line-clamp-1">{t.title}</p>
                  <div className="flex gap-4 text-xs font-bold text-slate-400 mt-4">
                     <span className="flex items-center gap-1"><Clock size={12}/> {t.durationMinutes}m</span>
                     <span className="flex items-center gap-1"><BookOpen size={12}/> {t.mcqs?.length} MCQs</span>
                  </div>
               </div>
               <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditTestData(t); setEditTestId(t._id); }} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 transition flex justify-center items-center gap-2 text-xs">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDeleteTest(t._id)} className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 transition">
                    <Trash2 size={16} />
                  </button>
               </div>
             </div>
           ))}
        </div>
      )}
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

    const content = stats.content || {};
    const contentCards = [
      { label: 'Curriculum Days', value: content.days || 0 },
      { label: 'DSA Problems', value: content.dsa || 0 },
      { label: 'SQL Lessons', value: content.sql || 0 },
      { label: 'Theory Qs', value: content.theory || 0 },
      { label: 'Aptitude Qs', value: content.aptitude || 0 },
      { label: 'HR Qs', value: content.hr || 0 },
      { label: 'Mock Tests', value: content.mockTests || 0 },
      { label: 'Test Submissions', value: content.testResults || 0 },
      { label: 'Comments', value: content.comments || 0 },
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
              <div className={`w-10 h-10 rounded-md ${item.bgColor} ${item.darkBg} ${item.text} ${item.darkText} flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{item.label}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{item.value}</h3>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Content Inventory</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {contentCards.map((c, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{c.label}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{c.value}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };


  const renderTestEditor = () => (
    <form onSubmit={handleSaveTest} className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-md border border-slate-200 dark:border-slate-700 space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-slate-700">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{editTestId === 'new' ? 'Create New Company Assessment' : 'Edit Assessment'}</h2>
        </div>
        <button type="button" onClick={() => { setEditTestId(null); setEditTestData(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name</label>
            <input required type="text" value={editTestData.companyName} onChange={e => setEditTestData({...editTestData, companyName: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
         </div>
         <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Test Title</label>
            <input required type="text" value={editTestData.title} onChange={e => setEditTestData({...editTestData, title: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
         </div>
         <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <textarea required rows="3" value={editTestData.description} onChange={e => setEditTestData({...editTestData, description: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
         </div>
         <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration (Minutes)</label>
            <input required type="number" min="1" value={editTestData.durationMinutes} onChange={e => setEditTestData({...editTestData, durationMinutes: Number(e.target.value)})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
         </div>
         <div className="flex gap-4">
           <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Difficulty</label>
              <select value={editTestData.difficulty} onChange={e => setEditTestData({...editTestData, difficulty: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
                 <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
              </select>
           </div>
           <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Publish Status</label>
              <select value={editTestData.isActive} onChange={e => setEditTestData({...editTestData, isActive: e.target.value === 'true'})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
                 <option value="true">Live (Active)</option><option value="false">Hidden (Draft)</option>
              </select>
           </div>
         </div>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">MCQ Questions</h3>
            <button type="button" onClick={() => {
              setEditTestData({...editTestData, mcqs: [...(editTestData.mcqs || []), { question: '', options: ['','','',''], correctAnswer: 0, explanation: '' }]});
            }} className="px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg font-bold text-xs flex items-center gap-2 transition hover:bg-blue-100">
               <Plus size={14}/> Add MCQ
            </button>
         </div>
         <div className="space-y-6">
            {editTestData.mcqs?.map((mcq, idx) => (
               <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl relative shadow-sm">
                  <button type="button" title="Remove MCQ" onClick={() => {
                     const newMcqs = [...editTestData.mcqs];
                     newMcqs.splice(idx, 1);
                     setEditTestData({...editTestData, mcqs: newMcqs});
                  }} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 transition">
                     <Trash2 size={16}/>
                  </button>
                  <label className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 block">Question {idx+1}</label>
                  <textarea required placeholder="Question text... \nUse \n for newlines" rows="3" value={mcq.question} onChange={e => {
                     const m = [...editTestData.mcqs]; m[idx].question = e.target.value; setEditTestData({...editTestData, mcqs: m});
                  }} className="w-full p-3 mb-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:border-indigo-500 outline-none" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                     {mcq.options.map((opt, oIdx) => (
                       <input key={oIdx} required placeholder={`Option ${oIdx+1}`} value={opt} onChange={e => {
                          const m = [...editTestData.mcqs]; m[idx].options[oIdx] = e.target.value; setEditTestData({...editTestData, mcqs: m});
                       }} className={`p-3 rounded-xl border text-sm bg-white dark:bg-slate-800 outline-none transition ${mcq.correctAnswer === oIdx ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'}`} />
                     ))}
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <div className="flex gap-2 text-xs font-bold items-center text-slate-600 dark:text-slate-300">
                      Correct Option (1-4): 
                      <select value={mcq.correctAnswer} onChange={e => {
                         const m = [...editTestData.mcqs]; m[idx].correctAnswer = Number(e.target.value); setEditTestData({...editTestData, mcqs: m});
                      }} className="p-1 px-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg ml-2 outline-none">
                        {[0,1,2,3].map(i=><option key={i} value={i}>Option {i+1}</option>)}
                      </select>
                    </div>
                  </div>
               </div>
            ))}
            {editTestData.mcqs?.length === 0 && <p className="text-sm text-slate-500 italic">No MCQs added yet. Students will auto-pass this section if empty.</p>}
         </div>
      </div>

      <div className="pt-8 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
         <button type="button" onClick={() => { setEditTestId(null); setEditTestData(null); }} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition">Cancel</button>
         <button type="submit" disabled={saving} className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition">
           {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} {editTestId === 'new' ? 'Publish Exam' : 'Update Existing'}
         </button>
      </div>
    </form>
  );

  if (loading && !editTestData && !stats && !allUsers.length) return (
     <div className="flex flex-col items-center justify-center p-20 space-y-4 h-[70vh]">
        <Loader2 className="animate-spin text-primary-500 uppercase" size={40} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Accessing Secure Admin Vault...</p>
     </div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
        <div className="flex items-center gap-4 sm:gap-5">
           <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-xl flex items-center justify-center sm:scale-110">
              <Settings size={28} className="sm:w-8 sm:h-8" />
           </div>
           <div className="min-w-0">
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Command Center</h1>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
                 <p className="text-[11px] sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">
                   CodeSprint Control Panel <span className="text-slate-300 dark:text-slate-600 mx-2 hidden sm:inline">|</span> <span className="hidden sm:inline">Admin: {user?.name}</span>
                 </p>
              </div>
           </div>
        </div>

        <div className="flex flex-wrap overflow-x-auto bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 gap-0.5">
          {[
            { id: 'dsa', label: 'DSA', icon: <Code2 size={14} /> },
            { id: 'sql', label: 'SQL', icon: <Database size={14} /> },
            { id: 'theory', label: 'Theory', icon: <Brain size={14} /> },
            { id: 'aptitude', label: 'Aptitude', icon: <Calculator size={14} /> },
            { id: 'hr', label: 'HR', icon: <MessageCircle size={14} /> },
            { id: 'assessments', label: 'Mocks', icon: <Target size={14} /> },
            { id: 'builder', label: 'Builder', icon: <Wand2 size={14} /> },
            { id: 'users', label: 'Users', icon: <Users size={14} /> },
            { id: 'comments', label: 'Comments', icon: <MessageSquare size={14} /> },
            { id: 'stats', label: 'Analytics', icon: <PieChart size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Body */}
      {editTestId ? renderTestEditor() : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'users' && renderUserManager()}
          {activeTab === 'assessments' && renderAssessmentsManager()}
          {activeTab === 'builder' && <AssessmentBuilder token={token} />}
          {activeTab === 'stats' && renderStats()}
          {activeTab === 'dsa' && <DsaManager token={token} />}
          {activeTab === 'sql' && <SqlManager token={token} />}
          {activeTab === 'theory' && (
            <QuestionBankManager
              key="theory"
              token={token}
              basePath="/admin/theory"
              label="Theory Question"
              sections={['os', 'networks', 'oop']}
            />
          )}
          {activeTab === 'aptitude' && (
            <QuestionBankManager
              key="aptitude"
              token={token}
              basePath="/admin/aptitude"
              label="Aptitude Question"
              sections={['quantitative', 'logical', 'verbal']}
              showPassage
            />
          )}
          {activeTab === 'hr' && <HrManager token={token} />}
          {activeTab === 'comments' && <CommentsManager token={token} />}
        </div>
      )}

      {editUser && (
        <UserEditModal
          user={editUser}
          saving={savingUser}
          onChange={setEditUser}
          onSave={handleSaveUser}
          onClose={() => setEditUser(null)}
          onDownloadReport={() => downloadStudentReport(editUser)}
          downloading={reportGeneratingId === editUser._id}
        />
      )}

      {detailUserId && (
        <UserDetailDrawer
          userId={detailUserId}
          token={token}
          onClose={() => setDetailUserId(null)}
          onDownloadReport={() => {
            const target = allUsers.find(u => u._id === detailUserId);
            if (target) downloadStudentReport(target);
          }}
          downloading={reportGeneratingId === detailUserId}
        />
      )}
    </div>
  );
}

function UserEditModal({ user, saving, onChange, onSave, onClose, onDownloadReport, downloading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={onSave}
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-8 space-y-5 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit User: {user.name}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModalField label="Name"><input value={user.name || ''} onChange={e => onChange({ ...user, name: e.target.value })} className={modalInputCls} /></ModalField>
          <ModalField label="Email"><input type="email" value={user.email || ''} onChange={e => onChange({ ...user, email: e.target.value })} className={modalInputCls} /></ModalField>
          <ModalField label="Username"><input value={user.username || ''} onChange={e => onChange({ ...user, username: e.target.value })} className={modalInputCls} /></ModalField>
          <ModalField label="Role">
            <select value={user.role || 'user'} onChange={e => onChange({ ...user, role: e.target.value })} className={modalInputCls}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </ModalField>
          <ModalField label="USN"><input value={user.registrationDetails?.usn || ''} onChange={e => onChange({ ...user, registrationDetails: { ...user.registrationDetails, usn: e.target.value } })} className={modalInputCls} /></ModalField>
          <ModalField label="Branch"><input value={user.registrationDetails?.branch || ''} onChange={e => onChange({ ...user, registrationDetails: { ...user.registrationDetails, branch: e.target.value } })} className={modalInputCls} /></ModalField>
          <ModalField label="Year"><input value={user.registrationDetails?.year || ''} onChange={e => onChange({ ...user, registrationDetails: { ...user.registrationDetails, year: e.target.value } })} className={modalInputCls} /></ModalField>
          <ModalField label="Phone"><input value={user.registrationDetails?.phoneNumber || ''} onChange={e => onChange({ ...user, registrationDetails: { ...user.registrationDetails, phoneNumber: e.target.value } })} className={modalInputCls} /></ModalField>
          <ModalField label="Current Day"><input type="number" min="1" value={user.currentDay || 1} onChange={e => onChange({ ...user, currentDay: Number(e.target.value) })} className={modalInputCls} /></ModalField>
          <ModalField label="Streak"><input type="number" min="0" value={user.streak || 0} onChange={e => onChange({ ...user, streak: Number(e.target.value) })} className={modalInputCls} /></ModalField>
          <ModalField label="GitHub Repo"><input value={user.githubRepo || ''} onChange={e => onChange({ ...user, githubRepo: e.target.value })} className={modalInputCls} /></ModalField>
          <ModalField label="Subscription">
            <label className="flex items-center gap-2 px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm">
              <input type="checkbox" checked={!!user.isSubscribed} onChange={e => onChange({ ...user, isSubscribed: e.target.checked })} />
              <span className="font-bold flex items-center gap-1"><KeyRound size={14} /> Premium Active</span>
            </label>
          </ModalField>
        </div>

        <div className="flex justify-between items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onDownloadReport}
            disabled={downloading}
            className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {downloading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {downloading ? 'Generating...' : 'Download PDF Report'}
          </button>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-2">
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const modalInputCls = "w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm";

function ModalField({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</span>
      {children}
    </label>
  );
}
