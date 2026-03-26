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
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <MessageSquare className="text-slate-500" size={18} />
        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Discussion</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Comment Input */}
        {user ? (
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask a question or share your thoughts..."
              className="w-full p-3 pr-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-slate-400 outline-none transition resize-none text-sm text-slate-800 dark:text-slate-200"
              rows="3"
            ></textarea>
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="absolute bottom-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-200 dark:hover:bg-white text-white dark:text-slate-900 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </form>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-md border border-dashed border-slate-300 dark:border-slate-800 text-center">
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
              <div key={comment._id} className="py-4 border-b border-slate-100 dark:border-slate-800 last:border-0 group">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                    <User size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{comment.user?.name}</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {comment.text}
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
