/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MEN_DBA_API_URL: string;
  readonly VITE_COLOMBIA_APRENDE_DBA_URL: string;
  readonly VITE_MEN_ESTANDARES_PDF_URL: string;
  readonly VITE_EDUTEKA_ESTANDARES_PDF_URL: string;
  readonly VITE_AI_API_URL: string;
  readonly VITE_AI_API_KEY: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_ENABLE_LOCAL_FALLBACK: string;
  readonly VITE_ANALYTICS_ENDPOINT: string;
  readonly VITE_ANALYTICS_ENABLED: string;
  readonly VITE_REPORT_WEB_VITALS: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
