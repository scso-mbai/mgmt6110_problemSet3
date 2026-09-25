import React, { useEffect } from 'react';

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

// Ensure window.disqus_config is set with real values before embed.js executes
if (typeof window !== 'undefined') {
  window.disqus_config = function (this: any) {
    this.page = this.page || {};
    this.page.url = 'https://mgmt6110problemset3.vercel.app/';
    this.page.identifier = 'home';
  };
}

export const DisqusComments: React.FC = () => {
  useEffect(() => {
    // Configure with real values:
    window.disqus_config = function (this: any) {
      this.page = this.page || {};
      this.page.url = 'https://mgmt6110problemset3.vercel.app/';
      this.page.identifier = 'home';
    };

    // Reload existing Disqus instance if already present
    if (typeof window.DISQUS !== 'undefined') {
      window.DISQUS.reset({
        reload: true,
        config: function (this: any) {
          this.page = this.page || {};
          this.page.url = 'https://mgmt6110problemset3.vercel.app/';
          this.page.identifier = 'home';
        },
      });
      return;
    }

    // 5 & 6. Load official Disqus script only once
    const SCRIPT_ID = 'disqus-embed-script';
    if (!document.getElementById(SCRIPT_ID)) {
      const d = document;
      const s = d.createElement('script');
      s.id = SCRIPT_ID;
      s.src = 'https://humanaicollaboration.disqus.com/embed.js';
      s.setAttribute('data-timestamp', String(+new Date()));
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

  return (
    <section
      id="disqus-feedback-section"
      className="mt-12 pt-8 border-t border-slate-800"
      aria-label="Visitor Feedback"
    >
      {/* 2. Keep only the existing heading and text */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white tracking-tight">
          Visitor Feedback
        </h3>
        <p className="text-sm text-slate-300 mt-1">
          Please let us know what worked for you and what did not.
        </p>
      </div>

      {/* 3. Immediately below that heading, render exactly one persistent: <div id="disqus_thread"></div> */}
      <div id="disqus_thread"></div>

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
