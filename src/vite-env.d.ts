/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISQUS_SHORTNAME?: string;
  readonly VITE_LIVE_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
