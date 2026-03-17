import { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Clock } from 'lucide-react';
import { API_URL } from '../../utils/config';
import { useAuth } from '../../context/AuthContext';

export default function CommentSection({ dayNumber }) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_URL}/comments/${dayNumber}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setComments(data);
        }
      } catch (err) {
        console.error('Fetch comments error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [dayNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/comments/${dayNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newComment })
      });
      const data = await res.json();
      if (res.ok) {
        setComments([data, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Post comment error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <MessageSquare className="text-blue-500" size={20} />
        <h3 className="font-bold text-slate-800 dark:text-slate-100">Community Discussion</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Comment Input */}
        {user ? (
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask a question or share your thoughts..."
              className="w-full p-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none text-slate-800 dark:text-slate-200"
              rows="3"
            ></textarea>
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="absolute bottom-4 right-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
            >
              <Send size={18} />
            </button>
          </form>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-500">Please login to join the discussion.</p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="group">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                    <User size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{comment.user?.name}</span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock size={10} />
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400 text-sm py-8 italic">No comments yet. Be the first to start the conversation!</p>
          )}
        </div>
      </div>
    </div>
  );
}
