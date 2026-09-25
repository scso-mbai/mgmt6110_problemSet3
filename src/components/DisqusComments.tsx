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

// Fixed values so every comment lands in one thread for the main page.
const DISQUS_SHORTNAME = 'humanaicollaboration';
const PAGE_URL = 'https://mgmt6110problemset3.vercel.app/'; // https, no query string
const PAGE_IDENTIFIER = 'home';
const SCRIPT_ID = 'disqus-embed-script';

const disqusConfig = function (this: any) {
  this.page = this.page || {};
  this.page.url = PAGE_URL;
  this.page.identifier = PAGE_IDENTIFIER;
};

export const DisqusComments: React.FC = () => {
  useEffect(() => {
    window.disqus_config = disqusConfig;

    // Disqus already loaded (e.g. returning to the main page): re-attach the same thread.
    if (typeof window.DISQUS !== 'undefined') {
      window.DISQUS.reset({ reload: true, config: disqusConfig });
      return;
    }

    // Load the Disqus Universal Code only once, even across re-renders and re-mounts.
    if (!document.getElementById(SCRIPT_ID)) {
      const d = document;
      const s = d.createElement('script');
      s.id = SCRIPT_ID;
      s.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
      s.setAttribute('data-timestamp', String(+new Date()));
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
