import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Download, Search, Loader2, Users, AlertCircle, Phone, BookOpen, Clock } from 'lucide-react';
import { API_URL } from '../utils/config';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch student data. Ensure you have Admin privileges.');
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStudents();
  }, [token]);

  const handleExportCSV = () => {
    if (!students || students.length === 0) return;

    const headers = ['Name', 'Email', 'USN', 'Year', 'Branch', 'Phone', 'Current Day', 'Streak', 'Joined Date'];
    
    const csvContent = students.map(s => {
      const usn = s.registrationDetails?.usn || 'N/A';
      const year = s.registrationDetails?.year || 'N/A';
      const branch = s.registrationDetails?.branch || 'N/A';
      const phone = s.registrationDetails?.phoneNumber || 'N/A';
      const joined = new Date(s.createdAt).toLocaleDateString();

      return `"${s.name}","${s.email}","${usn}","${year}","${branch}","${phone}",${s.currentDay},${s.streak},"${joined}"`;
    });

    csvContent.unshift(headers.join(',')); // Add headers to top

    const blob = new Blob([csvContent.join('\\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `CodeSprint_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(s => {
    const term = searchTerm.toLowerCase();
    const usn = s.registrationDetails?.usn?.toLowerCase() || '';
    const branch = s.registrationDetails?.branch?.toLowerCase() || '';
    return s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term) || usn.includes(term) || branch.includes(term);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShieldCheck size={80} className="mx-auto text-red-500 mb-6 opacity-80" />
        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          You do not have the necessary security clearance to view highly sensitive collegiate data. 
          If you are an administrator, please contact support.
        </p>
        {/* Dev helper hidden button */}
        <button 
           onClick={async () => {
             await fetch(`${API_URL}/user/make-me-admin`, {
               method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
             });
             window.location.reload();
           }}
           className="text-xs text-indigo-400 hover:text-indigo-500 underline"
        >
          [Dev: Force Upgrade Context to Admin]
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {/* Header Panel */}
      <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative overflow-hidden">
        <div className="absolute -top-32 -right-16 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2 text-indigo-400">
            <ShieldCheck size={28} />
            <span className="font-bold tracking-widest uppercase text-sm">Elevated Access</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Student Database</h1>
          <p className="text-slate-400 font-medium">Monitoring {students.length} active sprinters.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10">
           <div className="relative">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
             <input 
               type="text"
               placeholder="Search by Name, USN, Branch..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full sm:w-72 bg-slate-800/80 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
             />
           </div>
           
           <button 
             onClick={handleExportCSV}
             className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50 whitespace-nowrap"
           >
             <Download size={18} /> Export CSV
           </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-900/50 rounded-xl font-medium flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">USN</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Branch/Year</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-center">Current Day</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredStudents.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          {s.name}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">{s.email}</div>
                      </div>
                    </div>
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
                    <div className="inline-flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center font-black text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {s.currentDay}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Day</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {s.registrationDetails?.phoneNumber ? (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                        <Phone size={14} className="text-slate-400" />
                        {s.registrationDetails.phoneNumber}
                      </div>
                    ) : (
                      <span className="opacity-40 italic">Not provided</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-slate-500">
                    <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                    <p className="text-lg">No students found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
