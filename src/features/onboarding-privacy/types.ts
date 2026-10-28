/** A run of text, optionally a link. Paragraphs and list items are arrays of these, so links stay in the copy. */
export type PrivacyText = string | { text: string; href: string };

export type PrivacyBlock =
  | { kind: "paragraph"; text: PrivacyText[] }
  | { kind: "list"; items: PrivacyText[][] }
  | { kind: "table"; caption: string; headers: string[]; rows: string[][] };

export type PrivacySection = {
  id: string;
  title: string;
  blocks: PrivacyBlock[];
};

export type PrivacyNoticeStatus = "draft" | "approved";
