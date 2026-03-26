import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Code2, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed w-full z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary-600 dark:text-primary-500 hover:opacity-80 transition">
          <Code2 size={28} className="stroke-2" />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            CodeSprint <span className="text-primary-600 dark:text-primary-500">50</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {(user.isAdmin || user.role === 'admin') && (
                <Link to="/admin" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 mr-2">
                  Admin Panel
                </Link>
              )}
              <Link to="/assessments" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">
                Placements
              </Link>
              <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline-block font-medium">{user?.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
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
      </div>
    </nav>
  );
}
