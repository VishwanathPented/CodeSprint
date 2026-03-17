import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, ShieldCheck, Zap, Star, Rocket, CreditCard, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../utils/config';

export default function Subscription() {
  const { token, user, updateProgress } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(user?.isSubscribed || false);
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // Mock payment loading delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const res = await fetch(`${API_URL}/user/subscribe`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        updateProgress({ ...user, isSubscribed: true });
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 h-[calc(100vh-64px)]">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-emerald-100 dark:border-emerald-900/50 p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">You're In!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            You have successfully unlocked the full 50-day CodeSprint journey. Let's make it happen.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Unlock the Full Journey
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Get lifetime access to all 50 days of coding lectures, quizzes, challenges, and aptitude preparation.
        </p>
      </div>

      <div className="max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="bg-primary-600 dark:bg-primary-700 p-8 text-white text-center">
          <Rocket size={48} className="mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl font-bold mb-1">CodeSprint Pro</h3>
          <div className="flex items-end justify-center gap-1">
            <span className="text-4xl font-extrabold">$29</span>
            <span className="text-primary-200 mb-1">/ one-time</span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <ul className="space-y-4">
            {['Access to all 50 Days of content', 'Unlimited coding challenge execution', 'In-depth aptitude explanations', 'Certificate of Completion'].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                {feature}
              </li>
            ))}
          </ul>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-3">
              <CreditCard size={16} /> Mock Payment Form
            </div>
            <input type="text" placeholder="Card Number" defaultValue="4242 4242 4242 4242" disabled className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 mb-2 skeleton cursor-not-allowed" />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="MM/YY" defaultValue="12/26" disabled className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 cursor-not-allowed" />
              <input type="text" placeholder="CVC" defaultValue="123" disabled className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 cursor-not-allowed" />
            </div>
          </div>

          <button 
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white shadow-xl transition disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? 'Processing Payment...' : 'Pay $29 and Unlock'}
          </button>
        </div>
      </div>
    </div>
  );
}
