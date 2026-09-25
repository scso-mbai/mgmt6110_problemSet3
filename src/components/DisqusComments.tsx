import React, { useEffect, useState, useCallback } from 'react';
import { Send, MessageSquare, CheckCircle2, User, AlertCircle, Loader2 } from 'lucide-react';

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

function formatCommentDate(isoOrDateString: string): string {
  try {
    const date = new Date(isoOrDateString);
    if (isNaN(date.getTime())) return isoOrDateString;
    const now = Date.now();
    const diffSeconds = Math.floor((now - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return isoOrDateString;
  }
}

export const DisqusComments: React.FC = () => {
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [comments, setComments] = useState<VisitorComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch comments from shared backend API on load
  const loadComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/comments');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.comments)) {
          setComments(data.comments);
        }
      } else {
        console.warn('Could not fetch comments from server:', res.status);
      }
    } catch (err) {
      console.error('Failed to load comments from backend API:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Requirement 11: Basic validation
    const trimmedText = commentText.trim();
    if (!trimmedText) {
      setErrorMessage('Feedback text cannot be empty.');
      return;
    }

    if (trimmedText.length > 500) {
      setErrorMessage('Comment cannot exceed 500 characters.');
      return;
    }

    const trimmedAuthor = authorName.trim().slice(0, 60);

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: trimmedAuthor || 'Collector Guest',
          text: trimmedText,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();

      // Requirement 10: Only display a comment as successfully submitted when the backend confirms it was saved
      if (data.success && data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setCommentText('');
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 4000);
      } else {
        throw new Error('Server did not return a confirmed comment.');
      }
    } catch (err: any) {
      console.error('Failed to submit comment:', err);
      setErrorMessage(err.message || 'Unable to submit comment to backend. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
                maxLength={60}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your name or handle (optional)"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>

            {isSubmitted && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you! Your comment was saved to the server.</span>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800/80 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label htmlFor="visitor-comment-textarea" className="sr-only">
              Type your comment
            </label>
            <textarea
              id="visitor-comment-textarea"
              rows={3}
              maxLength={500}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What worked for you? What did not? Leave your feedback here..."
              className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition resize-y min-h-[90px]"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">
              {500 - commentText.length} characters remaining · Shared across all visitors
            </span>
            <button
              id="submit-visitor-comment-btn"
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Comment</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Real-time Visitor Comments Thread */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Shared Visitor Feedback ({comments.length})
            </h4>
            {isLoading && (
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                Loading comments...
              </span>
            )}
          </div>

          {comments.length === 0 && !isLoading ? (
            <p className="text-xs text-slate-500 italic py-2">
              No feedback submitted yet. Be the first visitor to leave a comment!
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
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
                      {formatCommentDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
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
