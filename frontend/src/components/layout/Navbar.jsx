import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Code2, LogOut, RefreshCcw, Menu, X, ChevronDown } from 'lucide-react';
import { API_URL } from '../../utils/config';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [reviewDue, setReviewDue] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!token || !user) return;
    let cancelled = false;
    const fetchCounts = async () => {
      try {
        const res = await fetch(`${API_URL}/review/counts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!cancelled && res.ok) setReviewDue(data.due || 0);
      } catch {
        // silent — non-essential
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [token, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCurriculumOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const curriculumLinks = [
    { to: "/java", label: "Java 50" },
    { to: "/dsa", label: "DSA" },
    { to: "/sql", label: "SQL" },
    { to: "/aptitude", label: "Aptitude" },
    { to: "/theory", label: "CS Core" },
    { to: "/hr", label: "HR Prep" }
  ];

  return (
    <nav className="fixed w-full z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary-600 dark:text-primary-500 hover:opacity-80 transition shrink-0">
          <Code2 size={28} className="stroke-2" />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
            CodeSprint <span className="text-primary-600 dark:text-primary-500">50</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          {user ? (
            <>
              {(user.isAdmin || user.role === 'admin') && (
                <Link to="/admin" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400">
                  Admin
                </Link>
              )}
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsCurriculumOpen(!isCurriculumOpen)}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                >
                  Curriculum <ChevronDown size={16} />
                </button>
                
                {isCurriculumOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden py-1">
                    {curriculumLinks.map(link => (
                      <Link 
                        key={link.to}
                        to={link.to} 
                        onClick={() => setIsCurriculumOpen(false)}
                        className="block px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/assessments" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">
                Placements
              </Link>
              
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700">
                <Link
                  to="/review"
                  className="relative p-2 text-slate-500 hover:text-fuchsia-500 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 rounded-lg transition"
                  title={reviewDue > 0 ? `${reviewDue} review due` : 'Review deck'}
                >
                  <RefreshCcw size={18} />
                  {reviewDue > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-fuchsia-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900">
                      {reviewDue > 99 ? '99+' : reviewDue}
                    </span>
                  )}
                </Link>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition ml-2"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">
                Login
              </Link>
              <Link to="/signup" className="text-sm font-medium px-4 py-1.5 border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700 rounded-md transition">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <div className="lg:hidden flex items-center gap-4">
          {user && reviewDue > 0 && (
             <Link
                to="/review"
                className="relative p-2 text-fuchsia-500 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 rounded-lg transition"
              >
                <RefreshCcw size={18} />
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-fuchsia-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {reviewDue > 99 ? '99+' : reviewDue}
                </span>
             </Link>
          )}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg px-4 py-4 flex flex-col gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              {(user.isAdmin || user.role === 'admin') && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 block">
                  Admin Panel
                </Link>
              )}

              <div className="py-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Curriculum</p>
                <div className="flex flex-col gap-3 pl-2">
                  {curriculumLinks.map(link => (
                    <Link key={link.to} to={link.to} onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <Link to="/assessments" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Placements
              </Link>
              
              <Link to="/review" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                Review Deck {reviewDue > 0 && <span className="bg-fuchsia-100 text-fuchsia-700 px-2 py-0.5 rounded-full text-xs font-bold">{reviewDue} Due</span>}
              </Link>

              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-2 text-sm font-semibold text-red-500 pt-4 border-t border-slate-100 dark:border-slate-800 w-full text-left"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-600 text-center py-2">
                Login
              </Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium bg-primary-600 text-white text-center py-2 rounded-md">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
