import React, { useEffect, useMemo } from 'react';

// Disqus configuration constants
// - My Disqus shortname is: [PASTE YOUR SHORTNAME]
// - My live address is: [PASTE THE FULL https://yourproject.vercel.app ADDRESS]
export const DISQUS_SHORTNAME =
  import.meta.env.VITE_DISQUS_SHORTNAME || '[PASTE YOUR SHORTNAME]';

export const LIVE_ADDRESS =
  import.meta.env.VITE_LIVE_ADDRESS || 'https://yourproject.vercel.app';

declare global {
  interface Window {
    disqus_config?: (this: { page: { url: string; identifier: string } }) => void;
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: (this: { page: { url: string; identifier: string } }) => void;
      }) => void;
    };
  }
}

/**
 * Normalizes the live address so it is guaranteed to:
 * 1. Use the https protocol
 * 2. Contain no query string or hash fragment
 */
export function getCanonicalLiveUrl(rawAddress: string): string {
  if (!rawAddress) {
    return 'https://yourproject.vercel.app';
  }

  // Strip query string and fragment
  let clean = rawAddress.split('?')[0].split('#')[0].trim();

  // If prompt placeholder was retained, extract canonical URL or fallback
  if (clean.includes('[PASTE')) {
    const match = clean.match(/https:\/\/[^\s\]]+/);
    clean = match ? match[0] : 'https://yourproject.vercel.app';
  }

  // Ensure https
  if (clean.startsWith('http://')) {
    clean = clean.replace(/^http:\/\//, 'https://');
  } else if (!clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }

  return clean.replace(/\/+$/, '');
}

interface DisqusCommentsProps {
  shortname?: string;
  url?: string;
  identifier?: string;
}

export const DisqusComments: React.FC<DisqusCommentsProps> = ({
  shortname = DISQUS_SHORTNAME,
  url = LIVE_ADDRESS,
  identifier = 'home',
}) => {
  const canonicalUrl = useMemo(() => getCanonicalLiveUrl(url), [url]);

  useEffect(() => {
    const SCRIPT_ID = 'disqus-embed-script';

    // Set configuration variables for Disqus Universal Code
    window.disqus_config = function (this: { page: { url: string; identifier: string } }) {
      this.page.url = canonicalUrl;
      this.page.identifier = identifier;
    };

    // If Disqus is already loaded on the window, reset the thread with updated config
    if (typeof window.DISQUS !== 'undefined') {
      window.DISQUS.reset({
        reload: true,
        config: function (this: { page: { url: string; identifier: string } }) {
          this.page.url = canonicalUrl;
          this.page.identifier = identifier;
        },
      });
      return;
    }

    // Load the Disqus Universal Code script ONLY ONCE
    if (!document.getElementById(SCRIPT_ID)) {
      const d = document;
      const s = d.createElement('script');
      s.id = SCRIPT_ID;
      s.src = `https://${shortname}.disqus.com/embed.js`;
      s.setAttribute('data-timestamp', String(+new Date()));
      s.async = true;
      (d.head || d.body).appendChild(s);
    }
  }, [shortname, canonicalUrl, identifier]);

  return (
    <section
      id="disqus-feedback-section"
      className="mt-12 pt-8 border-t border-slate-800"
      aria-label="Product feedback comments"
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Visitor Feedback
        </h3>
        <p className="text-sm text-slate-300 mt-1">
          Please let us know what worked for you and what did not.
        </p>
      </div>

      <div
        id="disqus_thread"
        className="min-h-[160px] bg-slate-900/40 rounded-2xl p-4 border border-slate-800/80"
      />
    </section>
  );
};
