import React, { useEffect, useMemo } from 'react';

// Disqus configuration constants:
// Actual Disqus shortname and live production address for the project
export const DISQUS_SHORTNAME =
  import.meta.env.VITE_DISQUS_SHORTNAME || 'HumanAICollaboration';

export const LIVE_ADDRESS =
  import.meta.env.VITE_LIVE_ADDRESS || 'https://mgmt6110problemset3.vercel.app/';

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

  // If prompt template placeholder was present, replace with actual production address
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
  // Production URL with HTTPS and no query string
  const canonicalUrl = useMemo(() => getCanonicalLiveUrl(url), [url]);

  // Use the actual verified shortname
  const actualShortname = useMemo(() => {
    const trimmed = (shortname || '').trim();
    if (!trimmed || trimmed === '[PASTE YOUR SHORTNAME]' || trimmed.startsWith('[')) {
      return 'HumanAICollaboration';
    }
    return trimmed;
  }, [shortname]);

  useEffect(() => {
    // 8. Detect whether the application is currently running inside an iframe using:
    //    window.self !== window.top
    let isInsideIframe = false;
    try {
      isInsideIframe = window.self !== window.top;
    } catch {
      isInsideIframe = true;
    }

    if (isInsideIframe) {
      console.log(
        'This app is running inside an embedded preview. Disqus interaction may behave differently from the deployed production site.'
      );
    }

    // 7. Inspect whether the Disqus iframe itself is loading successfully.
    //    Log relevant errors from browser console:
    //    - Third-party cookie & storage access warnings
    if (typeof navigator !== 'undefined' && !navigator.cookieEnabled) {
      console.warn(
        'Disqus Warning: Browser cookies are disabled. Disqus comment box interaction requires cookies.'
      );
    }

    if (typeof document !== 'undefined' && 'hasStorageAccess' in document) {
      document
        .hasStorageAccess()
        .then((hasAccess) => {
          if (!hasAccess && isInsideIframe) {
            console.warn(
              'Disqus Warning: Third-party storage access is ungranted in this embedded iframe. Cross-site cookie partitioning may restrict typing/authenticating in Disqus.'
            );
          }
        })
        .catch(() => {});
    }

    //    - Content Security Policy errors
    const handleCspViolation = (e: SecurityPolicyViolationEvent) => {
      const blocked = e.blockedURI || '';
      if (blocked.includes('disqus') || blocked.includes('disquscdn')) {
        console.error('Content Security Policy blocked Disqus resource:', {
          blockedURI: e.blockedURI,
          violatedDirective: e.violatedDirective,
          originalPolicy: e.originalPolicy,
        });
      }
    };
    window.addEventListener('securitypolicyviolation', handleCspViolation);

    // 1. Inspect existing Disqus component and confirm Disqus Universal Embed script
    //    is loaded correctly and only once.
    const SCRIPT_ID = 'disqus-embed-script';

    // 3. Verify this.page.url is set to the exact deployed production URL of main page
    //    using HTTPS, with no query string.
    // 4. Verify this.page.identifier is set to exactly: home
    window.disqus_config = function (this: any) {
      if (this) {
        if (!this.page) {
          this.page = {};
        }
        this.page.url = canonicalUrl;
        this.page.identifier = identifier;
      }
    };

    console.log('Disqus Config Initialized:', {
      shortname: actualShortname,
      pageUrl: canonicalUrl,
      pageIdentifier: identifier,
    });

    // If Disqus is already loaded, reset the thread rather than loading another script
    if (typeof window.DISQUS !== 'undefined') {
      try {
        window.DISQUS.reset({
          reload: true,
          config: function (this: any) {
            if (this) {
              if (!this.page) {
                this.page = {};
              }
              this.page.url = canonicalUrl;
              this.page.identifier = identifier;
            }
          },
        });
        console.log('Disqus thread reset successfully for identifier:', identifier);
      } catch (err) {
        console.error('Disqus reset error:', err);
      }
      return () => {
        window.removeEventListener('securitypolicyviolation', handleCspViolation);
      };
    }

    // Monitor Disqus iframe loading inside the container
    const container = document.getElementById('disqus_thread');
    let observer: MutationObserver | null = null;
    if (container) {
      observer = new MutationObserver(() => {
        const iframe = container.querySelector('iframe');
        if (iframe) {
          console.log('Disqus iframe loaded successfully in #disqus_thread:', {
            name: iframe.name,
            src: iframe.src || 'disqus-embed',
            height: iframe.style.height || iframe.height,
          });
          iframe.addEventListener('error', (err) => {
            console.error('Disqus iframe error:', err);
          });
          if (observer) {
            observer.disconnect();
          }
        }
      });
      observer.observe(container, { childList: true, subtree: true });
    }

    // Load the Disqus Universal Code script ONLY ONCE
    if (!document.getElementById(SCRIPT_ID)) {
      const d = document;
      const s = d.createElement('script');
      s.id = SCRIPT_ID;
      // 2. Verify Disqus configuration uses actual Disqus shortname and not a placeholder
      s.src = `https://${actualShortname}.disqus.com/embed.js`;
      s.setAttribute('data-timestamp', String(+new Date()));
      s.async = true;

      // Log network failures and script loading errors
      s.onerror = (e) => {
        if (typeof (e as any)?.stopPropagation === 'function') {
          (e as any).stopPropagation();
        }
        if (typeof (e as any)?.preventDefault === 'function') {
          (e as any).preventDefault();
        }
        console.warn('Disqus script loading notice (network or third-party block):', {
          src: s.src,
        });
      };

      (d.head || d.body).appendChild(s);
    }

    return () => {
      window.removeEventListener('securitypolicyviolation', handleCspViolation);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [actualShortname, canonicalUrl, identifier]);

  return (
    <section
      id="disqus-feedback-section"
      className="mt-12 pt-8 border-t border-slate-800 relative z-10"
      style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
      aria-label="Product feedback comments"
    >
      {/* Component-level scoped style guaranteeing no overlay or pointer-events interference */}
      <style>{`
        #disqus-feedback-section,
        #disqus_thread,
        #disqus_thread iframe {
          pointer-events: auto !important;
          position: relative !important;
          z-index: 10 !important;
        }
      `}</style>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Visitor Feedback
        </h3>
        <p className="text-sm text-slate-300 mt-1">
          Please let us know what worked for you and what did not.
        </p>
      </div>

      {/* 
        Container for Disqus thread:
        Notice: No internal padding or overflow:hidden is applied directly to #disqus_thread
        so that Disqus iframe sizing and pointer-event coordinate translation are not distorted.
      */}
      <div
        id="disqus_thread"
        className="w-full min-h-[360px] relative z-10"
        style={{ minHeight: '360px', position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
      />
    </section>
  );
};
