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

export const DisqusComments: React.FC = () => {
  useEffect(() => {
    const PAGE_URL = 'https://mgmt6110problemset3.vercel.app/';
    const PAGE_IDENTIFIER = 'home';

    // 2. Define the Disqus configuration equivalent to official Universal Code
    window.disqus_config = function (this: any) {
      this.page = this.page || {};
      this.page.url = PAGE_URL;
      this.page.identifier = PAGE_IDENTIFIER;
    };

    // If DISQUS is already loaded, reset the thread rather than injecting another script
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

    // 3 & 4. Load the official Disqus embed script only once
    const SCRIPT_ID = 'disqus-embed-script';
    if (!document.getElementById(SCRIPT_ID)) {
      const d = document;
      const s = d.createElement('script');
      s.id = SCRIPT_ID;
      s.src = 'https://humanaicollaboration.disqus.com/embed.js';
      s.setAttribute('data-timestamp', String(+new Date()));
      (d.head || d.body).appendChild(s);
    }
  }, []);

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

      {/* Exactly one persistent official Disqus container */}
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
