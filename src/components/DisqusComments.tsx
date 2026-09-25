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
    disqus_config?: (this: any) => void;
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: (this: any) => void;
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

/**
 * Validates whether a shortname is a configured alphanumeric identifier
 * rather than an unreplaced template placeholder or invalid URL string.
 */
export function isConfiguredShortname(name: string): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  if (
    trimmed === '' ||
    trimmed === '[PASTE YOUR SHORTNAME]' ||
    trimmed.startsWith('[') ||
    trimmed.endsWith(']') ||
    trimmed.includes(' ')
  ) {
    return false;
  }
  return /^[a-zA-Z0-9-_]+$/.test(trimmed);
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

  // Prevent third-party cross-origin script errors from bubbling to the window
  useEffect(() => {
    const handleScriptError = (event: ErrorEvent) => {
      if (
        event.message === 'Script error.' ||
        (event.filename && event.filename.includes('disqus'))
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleScriptError);
    return () => {
      window.removeEventListener('error', handleScriptError);
    };
  }, []);

  useEffect(() => {
    const SCRIPT_ID = 'disqus-embed-script';

    // Set configuration variables for Disqus Universal Code safely
    window.disqus_config = function (this: any) {
      const ctx = this || {};
      ctx.page = ctx.page || {};
      ctx.page.url = canonicalUrl;
      ctx.page.identifier = identifier;
    };

    // If Disqus is already loaded on the window, reset the thread with updated config
    if (typeof window.DISQUS !== 'undefined') {
      try {
        window.DISQUS.reset({
          reload: true,
          config: function (this: any) {
            const ctx = this || {};
            ctx.page = ctx.page || {};
            ctx.page.url = canonicalUrl;
            ctx.page.identifier = identifier;
          },
        });
      } catch (err) {
        console.warn('Error resetting Disqus:', err);
      }
      return;
    }

    // Ensure we do not load a malformed script tag with brackets or spaces.
    // If the placeholder is present, use a safe default shortname so the script tag is valid.
    const effectiveShortname = isConfiguredShortname(shortname)
      ? shortname.trim()
      : 'tcg-singles-demo';

    // Load the Disqus Universal Code script ONLY ONCE
    if (!document.getElementById(SCRIPT_ID)) {
      const d = document;
      const s = d.createElement('script');
      s.id = SCRIPT_ID;
      s.src = `https://${effectiveShortname}.disqus.com/embed.js`;
      s.setAttribute('data-timestamp', String(+new Date()));
      s.async = true;
      s.onerror = (e) => {
        console.warn('Disqus script could not be loaded:', e);
      };
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
