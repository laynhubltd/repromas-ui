/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_APEX_DOMAIN?: string;
  readonly VITE_USE_MOCK_AUTH?: string;
  /** Where the marketing site's "Book a Demo" buttons go (calendar link or form). Defaults to /contact. */
  readonly VITE_DEMO_BOOKING_URL?: string;
  /** Sales WhatsApp number in international format without "+", e.g. 2348000000000. Hides the chat button when unset. */
  readonly VITE_SALES_WHATSAPP?: string;
  /** "true" publishes the Pricing page; anything else keeps it hidden and redirects /pricing to the contact form. */
  readonly VITE_SHOW_PRICING?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.svg?react" {
  import type { FunctionComponent, SVGProps } from "react";

  const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
