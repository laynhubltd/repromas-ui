import type { MarketingIconId } from "@/assets/illustrations/MarketingModuleIcons";

export type PlatformFeature = {
  title: string;
  icon: MarketingIconId;
  text: string;
  /** Shown with a "Rolling out" tag: committed, but not shipped yet */
  rollingOut?: string;
};

export type PlatformCategory = {
  id: string;
  title: string;
  text: string;
  features: PlatformFeature[];
};
