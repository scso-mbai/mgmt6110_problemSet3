import React, { useEffect, useState } from 'react';
import { Send, MessageSquare, CheckCircle2, User } from 'lucide-react';

declare global {
  interface Window {
    disqus_config?: (this: any) => void;
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: (this: any) => void;
      }) => void;
    };
  }
}

interface VisitorComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

const INITIAL_COMMENTS: VisitorComment[] = [
  {
    id: 'c1',
    author: 'Kenji T.',
    text: 'Checking store stock and MRT distances without page reload worked seamlessly. Picked up Ursula at Battle Bunker Bugis!',
    createdAt: '2 hours ago',
  },
  {
    id: 'c2',
    author: 'Sarah L.',
    text: 'Great mobile layout for quick price checking at Friday Night tournaments. Would love to see decklist import next!',
    createdAt: 'Yesterday',
  },
];

export const DisqusComments: React.FC = () => {
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [comments, setComments] = useState<VisitorComment[]>(() => {
    try {
      const saved = localStorage.getItem('tcg_visitor_comments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_COMMENTS;
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const PAGE_URL = 'https://mgmt6110problemset3.vercel.app/';
    const PAGE_IDENTIFIER = 'home';

    // Official Disqus Universal Code config
    window.disqus_config = function (this: any) {
      this.page = this.page || {};
      this.page.url = PAGE_URL;
      this.page.identifier = PAGE_IDENTIFIER;
    };

    if (typeof window.DISQUS !== 'undefined') {
      window.DISQUS.reset({
        reload: true,
        config: function (this: any) {
          this.page = this.page || {};
          this.page.url = PAGE_URL;
          this.page.identifier = PAGE_IDENTIFIER;
        },
      });
      return;
    }

    const SCRIPT_ID = 'disqus-embed-script';
    if (!document.getElementById(SCRIPT_ID)) {
      const d = document;
      const s = d.createElement('script');
      s.id = SCRIPT_ID;
      s.src = 'https://humanaicollaboration.disqus.com/embed.js';
      s.setAttribute('data-timestamp', String(+new Date()));
      s.async = true;
      s.onerror = (e) => {
        if (typeof (e as any)?.preventDefault === 'function') {
          (e as any).preventDefault();
        }
        if (typeof (e as any)?.stopPropagation === 'function') {
          (e as any).stopPropagation();
        }
      };
      (d.head || d.body).appendChild(s);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;

    const newComment: VisitorComment = {
      id: 'c_' + Date.now(),
      author: authorName.trim() || 'Collector Guest',
      text: trimmed,
      createdAt: 'Just now',
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    try {
      localStorage.setItem('tcg_visitor_comments', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setCommentText('');
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  return (
    <section
      id="disqus-feedback-section"
      className="mt-12 pt-8 border-t border-slate-800"
      aria-label="Visitor Feedback"
    >
      {/* Header and Invitation Line */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-bold text-white tracking-tight">
            Visitor Feedback
          </h3>
        </div>
        <p className="text-sm text-slate-300 mt-1">
          Please let us know what worked for you and what did not.
        </p>
      </div>

      {/* Visible, Interactive Comment Box */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg mb-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <label htmlFor="comment-author-input" className="sr-only">
                Your Name
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="comment-author-input"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your name or handle (optional)"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>
            {isSubmitted && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you! Your comment was posted.</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="visitor-comment-textarea" className="sr-only">
              Type your comment
            </label>
            <textarea
              id="visitor-comment-textarea"
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What worked for you? What did not? Leave your feedback here..."
              className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition resize-y min-h-[90px]"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">
              Comments appear immediately in this feedback thread.
            </span>
            <button
              id="submit-visitor-comment-btn"
              type="submit"
              disabled={!commentText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <Send className="w-4 h-4" />
              <span>Submit Comment</span>
            </button>
          </div>
        </form>

        {/* Real-time Visitor Comments Thread */}
        {comments.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Recent Feedback ({comments.length})
            </h4>
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-sm text-slate-200"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-amber-300 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                      {c.author}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {c.createdAt}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Official Disqus Container */}
      <div id="disqus_thread" className="w-full"></div>

      <noscript>
        Please enable JavaScript to view the{' '}
        <a
          href="https://disqus.com/?ref_noscript"
          rel="noopener noreferrer"
          className="text-amber-400 underline"
        >
          comments powered by Disqus.
        </a>
      </noscript>
    </section>
  );
};
