interface ImportMetaEnv {
  VITE_GOOGLE_CLIENT_ID?: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
