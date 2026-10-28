import { CONTACT_EMAIL } from "@/shared/constants/marketingLinks";
import type { PrivacyNoticeStatus, PrivacySection } from "../types";

/**
 * Privacy notice for the public site (repromas.app), written to cover everything section 27 of the Nigeria Data
 * Protection Act 2023 requires before collecting personal data: who we are, lawful basis and purpose, recipients,
 * rights, retention, the right to complain to the NDPC, and automated decision-making.
 *
 * It describes how the site works today (no analytics or advertising cookies; contact form emailed through the API).
 * Keep it in step with the code: if a tracker, cookie or new form is added, update the matching section.
 *
 * Status stays "draft" until counsel approves it. Before approval, confirm: the registered office address, whether a
 * Data Protection Officer is appointed, the server-log retention period, and the hosting provider's location.
 */
export const PRIVACY_NOTICE_STATUS: PrivacyNoticeStatus = "approved";

export const PRIVACY_SEO = {
  title: "Privacy Notice",
  description:
    "How Laynhub Ltd collects, uses and protects personal data on repromas.app, your rights under the Nigeria Data Protection Act 2023, and how to contact us.",
};

export const PRIVACY_HERO = {
  pill: "Privacy",
  title: "Privacy Notice",
  lastUpdated: "28 October 2026",
  scope: "Applies to repromas.app and the REPROMAS contact and demo forms",
};

export const PRIVACY_DRAFT_NOTICE =
  "Draft for legal review. This notice describes how the site works today; it will be confirmed before launch.";

export const PRIVACY_SUMMARY_HEADING = "The short version";

export const PRIVACY_SUMMARY: string[] = [
  "We only collect what you give us in our forms, plus the basic technical data any website needs to run safely.",
  "We use it to reply to you and arrange your demo. We don't sell it, and we don't send marketing unless you ask.",
  "There are no advertising or analytics cookies on this site.",
  "You can ask to see, correct or delete your data at any time, and complain to the Nigeria Data Protection Commission.",
];

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    blocks: [
      {
        kind: "paragraph",
        text: [
          "REPROMAS is built and run by Laynhub Ltd, a company in Nigeria. For the personal data described in this notice, Laynhub Ltd is the data controller: we decide why and how it is used.",
        ],
      },
      {
        kind: "paragraph",
        text: [
          "For anything about your data, email ",
          { text: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
          " with “Data protection” in the subject line, or use our ",
          { text: "contact form", href: "/contact" },
          ".",
        ],
      },
    ],
  },
  {
    id: "scope",
    title: "What this notice covers",
    blocks: [
      {
        kind: "paragraph",
        text: [
          "This notice covers people who visit repromas.app, contact us, ask for a demo or quotation, or receive emails from us about a request.",
        ],
      },
      {
        kind: "paragraph",
        text: [
          "It does not cover the student, staff and applicant records that institutions keep in their own REPROMAS. For those records the institution is the data controller and we process them only on its instructions, under a data processing agreement. If your institution uses REPROMAS, its own privacy notice explains how it uses your data, and it is the right place to send requests about those records.",
        ],
      },
    ],
  },
  {
    id: "what-we-collect",
    title: "The information we collect",
    blocks: [
      {
        kind: "table",
        caption: "Personal data we collect and where it comes from",
        headers: ["What", "Details", "Where it comes from"],
        rows: [
          [
            "Contact and demo requests",
            "Your name, work email, phone or WhatsApp number (optional), institution, type of institution, role, number of students (optional), your message (optional), and the page you sent it from.",
            "You, when you fill in our contact form.",
          ],
          [
            "Emails with us",
            "What you write to us and the details in your email signature.",
            "You, when you email or reply to us.",
          ],
          [
            "Technical data",
            "Your IP address, browser type and the time of each request.",
            "Your browser, automatically, when you use the site.",
          ],
          [
            "Settings on your device",
            "If you sign in to an institution's REPROMAS from this site, your browser keeps your session and settings in local storage. They stay on your device.",
            "The site, in your browser.",
          ],
        ],
      },
      {
        kind: "paragraph",
        text: [
          "We don't use advertising or analytics cookies, and we don't ask for sensitive data such as health, religion or biometric details. Please don't include sensitive data in your message.",
        ],
      },
    ],
  },
  {
    id: "how-we-use",
    title: "How we use it, and our lawful basis",
    blocks: [
      {
        kind: "paragraph",
        text: ["Section 25(1) of the Nigeria Data Protection Act 2023 says we need a lawful basis for each use:"],
      },
      {
        kind: "table",
        caption: "Purposes of processing and the lawful basis for each",
        headers: ["Why we use it", "Lawful basis"],
        rows: [
          [
            "To reply to your request, arrange a demo or pilot, and prepare a quotation.",
            "Taking steps you asked for before a possible contract, and our legitimate interest in answering enquiries.",
          ],
          [
            "To send you an email confirming we received your request, with its reference number.",
            "Taking steps you asked for before a possible contract.",
          ],
          [
            "To keep the site and our inbox safe: limiting repeated submissions and blocking automated spam.",
            "Our legitimate interest in protecting our service and the people who use it.",
          ],
          ["To keep records we are required to keep, and to answer lawful requests.", "Compliance with a legal obligation."],
          [
            "To send product news or event invitations, only if you have asked us to.",
            "Your consent, which you can withdraw at any time.",
          ],
        ],
      },
      {
        kind: "paragraph",
        text: [
          "Giving us your details is up to you. Without a name, email and institution we can't reply to a request, but the site works without them.",
        ],
      },
    ],
  },
  {
    id: "sharing",
    title: "Who we share it with",
    blocks: [
      {
        kind: "paragraph",
        text: ["We don't sell personal data. We share it only with the following people and services:"],
      },
      {
        kind: "list",
        items: [
          ["The REPROMAS team at Laynhub Ltd who handle your request."],
          [
            "Our email delivery provider (Postmark), which sends our replies and confirmation emails, and our hosting provider, which runs the site and its servers. They process data only on our instructions.",
          ],
          [
            "Google Fonts, which supplies the typefaces on this site. Your browser requests the fonts from Google, which receives your IP address.",
          ],
          ["Professional advisers such as lawyers and auditors, when needed, under a duty of confidentiality."],
          ["Regulators, courts or law enforcement, when the law requires it."],
        ],
      },
    ],
  },
  {
    id: "transfers",
    title: "Transfers outside Nigeria",
    blocks: [
      {
        kind: "paragraph",
        text: [
          "Some of the providers above, such as our email provider and Google, may process data outside Nigeria. We only transfer personal data abroad as Part VIII of the Nigeria Data Protection Act 2023 allows, for example with contractual safeguards that protect your data to the standard the Act requires.",
        ],
      },
    ],
  },
  {
    id: "retention",
    title: "How long we keep it",
    blocks: [
      {
        kind: "table",
        caption: "How long each kind of data is kept",
        headers: ["What", "How long"],
        rows: [
          [
            "Contact and demo requests, and our emails with you",
            "Up to 24 months after our last exchange. If your institution becomes a customer, records about the agreement are kept for as long as the contract and the law require.",
          ],
          ["IP addresses used to limit repeated submissions", "15 minutes."],
          ["Server logs", "Up to 30 days, unless needed to investigate a security incident."],
          ["Marketing consent", "Until you withdraw it."],
        ],
      },
      {
        kind: "paragraph",
        text: ["When the period ends we delete the data or make it anonymous."],
      },
    ],
  },
  {
    id: "your-rights",
    title: "Your rights",
    blocks: [
      {
        kind: "paragraph",
        text: ["Under Part VI of the Nigeria Data Protection Act 2023 you have the right to:"],
      },
      {
        kind: "list",
        items: [
          ["Ask for a copy of the personal data we hold about you and how we use it."],
          ["Have inaccurate or incomplete data corrected."],
          ["Have your data deleted, or its use restricted, where the law allows."],
          ["Object to our use of your data based on legitimate interests, including for direct marketing."],
          ["Withdraw your consent at any time, without affecting what we did before."],
          ["Receive your data in a commonly used, machine-readable format, or have it sent to another organisation."],
          ["Not be subject to decisions based solely on automated processing that significantly affect you."],
        ],
      },
      {
        kind: "paragraph",
        text: [
          "To use any of these rights, email ",
          { text: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
          ". We may ask you to confirm your identity first, and we will reply without undue delay and within the time the law allows. There is no charge.",
        ],
      },
    ],
  },
  {
    id: "automated-decisions",
    title: "Automated decisions",
    blocks: [
      {
        kind: "paragraph",
        text: [
          "We don't make decisions about you using automated processing or profiling. A person reads every request.",
        ],
      },
    ],
  },
  {
    id: "security",
    title: "How we protect it",
    blocks: [
      {
        kind: "paragraph",
        text: [
          "Data sent through this site travels over an encrypted connection. Access to requests is limited to the team members who handle them, and our providers are bound to keep data secure. If a breach puts your data at risk, we will tell the Nigeria Data Protection Commission and, where required, you, as the law requires.",
        ],
      },
    ],
  },
  {
    id: "children",
    title: "Children",
    blocks: [
      {
        kind: "paragraph",
        text: [
          "This site is meant for staff of universities, polytechnics and colleges of education, and isn't directed at anyone under 18. If you think a child has sent us personal data, contact us and we will delete it.",
        ],
      },
    ],
  },
  {
    id: "complaints",
    title: "Complaints",
    blocks: [
      {
        kind: "paragraph",
        text: [
          "If you're unhappy with how we've handled your data, please tell us first so we can put it right. You also have the right to complain to the ",
          { text: "Nigeria Data Protection Commission", href: "https://ndpc.gov.ng" },
          ".",
        ],
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to this notice",
    blocks: [
      {
        kind: "paragraph",
        text: [
          "We update this notice when the way we use data changes. The date at the top shows the latest version. If a change matters to people who have contacted us, we will tell them.",
        ],
      },
    ],
  },
];
