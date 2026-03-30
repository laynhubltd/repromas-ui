export type BrandConfig = {
  primaryColor: string;
  logoUrl?: string | null;
  tenantName?: string | null;
  systemName?: string | null;
  schoolName?: string | null;
  tagline?: string | null;
};

/** JSON-LD envelope returned by GET /api/brand-config */
export type BrandConfigResponse = {
  "@context": string;
  "@id": string;
  "@type": string;
  id: number;
  configValue: BrandConfig;
  description?: string;
  updatedAt?: string;
};
