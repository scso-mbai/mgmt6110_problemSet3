import React, { useEffect, useMemo } from 'react';

// Disqus configuration constants:
export const DISQUS_SHORTNAME = 'humanaicollaboration';
export const LIVE_ADDRESS =
  import.meta.env.VITE_LIVE_ADDRESS || 'https://mgmt6110problemset3.vercel.app/';

declare global {
  interface Window {
    disqus_config?: (this: any) => void;
    disqus_shortname?: string;
    disqus_identifier?: string;
    disqus_url?: string;
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: (this: any) => void;
      }) => void;
    };
  }
}

/**
 * Normalizes the production URL:
 * - Guarantees HTTPS protocol
 * - Strips any query string (no '?')
 * - Strips any hash fragment (no '#')
 */
export function getCanonicalLiveUrl(rawAddress: string): string {
  if (!rawAddress) {
    return 'https://mgmt6110problemset3.vercel.app/';
  }

  // Strip query string and fragment
  let clean = rawAddress.split('?')[0].split('#')[0].trim();

  // If placeholder was present, fallback to production address
  if (clean.includes('[PASTE') || clean.includes('yourproject.vercel.app')) {
    clean = 'https://mgmt6110problemset3.vercel.app/';
  }

  // Ensure https protocol
  if (clean.startsWith('http://')) {
    clean = clean.replace(/^http:\/\//, 'https://');
  } else if (!clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }

  return clean;
}

// 3. Define initial Disqus configuration early on window before any embed script load
if (typeof window !== 'undefined') {
  window.disqus_shortname = DISQUS_SHORTNAME;
  window.disqus_identifier = 'home';
  window.disqus_url = 'https://mgmt6110problemset3.vercel.app/';
  window.disqus_config = function (this: any) {
    this.page = this.page || {};
    this.page.identifier = 'home';
    this.page.url = 'https://mgmt6110problemset3.vercel.app/';
  };
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
    // 14. Detect whether the app is running inside an embedded preview with:
    //     window.self !== window.top
    let isInsideIframe = false;
    try {
      isInsideIframe = window.self !== window.top;
    } catch {
      isInsideIframe = true;
    }

    if (isInsideIframe) {
      console.log(
        'The app is running inside an embedded preview. Disqus should also be tested on the deployed production URL.'
      );
    }

    // 10. Listen for Content Security Policy violations involving Disqus
    const handleCspViolation = (e: SecurityPolicyViolationEvent) => {
      const blocked = e.blockedURI || '';
      if (
        blocked.includes('disqus.com') ||
        blocked.includes('disquscdn.com') ||
        blocked.includes('humanaicollaboration')
      ) {
        console.error('Content Security Policy blocked Disqus resource:', {
          blockedURI: e.blockedURI,
          violatedDirective: e.violatedDirective,
          originalPolicy: e.originalPolicy,
        });
      }
    };
    window.addEventListener('securitypolicyviolation', handleCspViolation);

    // 1 & 2. Verify that the main page contains exactly one persistent element with id="disqus_thread"
    const threadEl = document.getElementById('disqus_thread');
    if (!threadEl) {
      console.error(
        'Disqus Error: #disqus_thread container element was not found in the DOM.'
      );
      return;
    }

    // 3. Define the configuration before the embed script loads
    // 4. Keep this.page.identifier = "home"
    // 5. Keep existing production page URL configuration
    window.disqus_shortname = 'humanaicollaboration';
    window.disqus_identifier = identifier;
    window.disqus_url = canonicalUrl;
    window.disqus_config = function (this: any) {
      this.page = this.page || {};
      this.page.identifier = identifier;
      this.page.url = canonicalUrl;
    };

    console.log('Disqus Configuration Ready:', {
      shortname: 'humanaicollaboration',
      identifier: identifier,
      url: canonicalUrl,
    });

    const SCRIPT_ID = 'disqus-embed-script';
    const EMBED_URL = 'https://humanaicollaboration.disqus.com/embed.js';

    // 9. Inspect contents of #disqus_thread and verify whether Disqus inserts an iframe inside it
    let iframeDetected = false;
    const observer = new MutationObserver(() => {
      const iframe = threadEl.querySelector('iframe');
      if (iframe) {
        iframeDetected = true;
        console.log('Disqus iframe detected inside #disqus_thread:', {
          name: iframe.name,
          title: iframe.title,
          src: iframe.src || 'disqus-embed',
        });
      }
    });
    observer.observe(threadEl, { childList: true, subtree: true });

    // 10. Check if an iframe appears within 5 seconds; if not, log diagnostic information
    const checkTimer = setTimeout(() => {
      const iframe = threadEl.querySelector('iframe');
      if (!iframe && !iframeDetected) {
        console.warn('Disqus Diagnostic: No iframe found in #disqus_thread after 5s.', {
          cookiesEnabled: navigator.cookieEnabled,
          isEmbeddedIframe: isInsideIframe,
          online: navigator.onLine,
          threadElement: threadEl.outerHTML.slice(0, 100),
        });
      }
    }, 5000);

    // 8. If embed.js has already loaded, do not inject another copy. Use DISQUS.reset
    if (typeof window.DISQUS !== 'undefined') {
      try {
        window.DISQUS.reset({
          reload: true,
          config: function (this: any) {
            this.page = this.page || {};
            this.page.identifier = identifier;
            this.page.url = canonicalUrl;
          },
        });
        console.log('Disqus thread reset successfully for identifier:', identifier);
      } catch (err) {
        console.error('Disqus reset error:', err);
      }

      return () => {
        clearTimeout(checkTimer);
        observer.disconnect();
        window.removeEventListener('securitypolicyviolation', handleCspViolation);
      };
    }

    // 6 & 7. Load Disqus script from exactly https://humanaicollaboration.disqus.com/embed.js only once
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = EMBED_URL;
      s.setAttribute('data-timestamp', String(+new Date()));
      s.async = true;

      s.onload = () => {
        console.log('Disqus embed.js script loaded successfully from:', EMBED_URL);
      };

      s.onerror = (e) => {
        if (typeof (e as any)?.stopPropagation === 'function') {
          (e as any).stopPropagation();
        }
        if (typeof (e as any)?.preventDefault === 'function') {
          (e as any).preventDefault();
        }
        console.error('Failed to load Disqus embed script from:', EMBED_URL);
      };

      (document.head || document.body).appendChild(s);
    }

    return () => {
      clearTimeout(checkTimer);
      observer.disconnect();
      window.removeEventListener('securitypolicyviolation', handleCspViolation);
    };
  }, [canonicalUrl, identifier]);

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

      {/*
        1. Exactly one persistent element with id="disqus_thread"
        12. Removed artificial height/position/pointer-event CSS overrides that distorted Disqus's layout.
        13. No fixed height applied to the container or iframe.
      */}
      <div id="disqus_thread" className="w-full" />
    </section>
  );
};
