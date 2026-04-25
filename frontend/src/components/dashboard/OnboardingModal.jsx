import { useState } from 'react';
import { GraduationCap, Phone, Hash, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { API_URL } from '../../utils/config';
import { useAuth } from '../../context/AuthContext';

export default function OnboardingModal() {
  const { token, fetchUser } = useAuth();
  
  const [formData, setFormData] = useState({
    usn: '',
    year: '1st Year',
    branch: 'CSE',
    phoneNumber: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const branches = [
    "CSE", "ISE", "ECE", "EEE", "MECH", "CIVIL", "AIML", "Other"
  ];
  const years = [
    "1st Year", "2nd Year", "3rd Year", "4th Year", "Graduated"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.usn || !formData.phoneNumber) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/user/complete-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned a non-JSON response (${res.status}). Ensure the backend is updated.`);
      }

      if (res.ok) {
        // Refresh global user state to remove the modal
        await fetchUser();
      } else {
        setError(data.message || 'Failed to complete onboarding.');
      }
    } catch (e) {
      if (e?.message?.includes('Server returned')) {
        setError(e.message);
      } else {
        setError('Network error or server unreachable. Please make sure the backend is live.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred dark backdrop overlay */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 pt-10 pb-6 bg-gradient-to-br from-indigo-600 via-primary-600 to-violet-600 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
           
           <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner mb-6 relative z-10">
              <GraduationCap size={32} className="text-white" />
           </div>
           
           <h2 className="text-3xl font-black text-white mb-2 relative z-10">Welcome to CodeSprint!</h2>
           <p className="text-indigo-100 font-medium relative z-10 opacity-90">Please complete your collegiate profile to unlock the dashboard.</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* USN */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Hash size={16} className="text-primary-500" />
                University Seat Number (USN)
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. 1RV21CS001"
                value={formData.usn}
                onChange={(e) => setFormData({...formData, usn: e.target.value.toUpperCase()})}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all font-mono uppercase"
              />
            </div>

            {/* Split row for Year and Branch */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <GraduationCap size={16} className="text-primary-500" />
                    Current Year
                  </label>
                  <select 
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition-all font-medium appearance-none cursor-pointer"
                  >
                     {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
               </div>
               
               <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <BookOpen size={16} className="text-primary-500" />
                    Branch
                  </label>
                  <select 
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition-all font-medium appearance-none cursor-pointer"
                  >
                     {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
               </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-primary-500" />
                Phone Number
              </label>
              <input 
                type="tel" 
                required
                placeholder="+91 9876543210"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all font-medium"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/50">
                ⚠️ {error}
              </p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-primary-600 hover:from-indigo-500 hover:to-primary-500 text-white font-bold py-4 px-6 rounded-xl transition transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  Start Coding <ChevronRight size={20} />
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
