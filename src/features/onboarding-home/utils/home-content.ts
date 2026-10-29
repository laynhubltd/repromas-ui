import type {
  Guide,
  HomeModuleFoundation,
  HomeModuleLane,
  HomeStat,
  OfficeJourney,
  ProductArea,
  Testimonial,
  TrustedInstitution,
  VerifyCard,
  WhyCard,
} from "../types";

/**
 * Copy for the public home page. Proof sections (TRUSTED_INSTITUTIONS, TESTIMONIALS, published GUIDES)
 * stay hidden until real, permissioned content is added here — never add placeholders.
 */

export const HOME_HERO = {
  titleLead: "One System to Run Your Institution's",
  titleMark: "Academic Record",
  lead: "From candidate admission and fee payments to senate-approved results and graduation, REPROMAS replaces spreadsheets and disconnected portals with one governed record, so your registry can focus on students, not re-typing broadsheets.",
  fine: "Test a full results cycle on your own curriculum first, then roll out across your institution at your own pace.",
  badges: [
    { tone: "green", strong: "99.5%", text: "uptime in contract" },
    { tone: "violet", strong: "NDPA 2023", text: "aligned" },
    { tone: "gold", strong: "Remita", text: "& Flutterwave live" },
  ],
} as const;

/**
 * The hero diagram: one student record that every office reads and writes. Each step is something the product does
 * today (the same claims as the films), in the order a student meets the offices.
 */
export const HOME_JOURNEY: OfficeJourney = {
  title:
    "The REPROMAS dashboard at the centre, with every office around it reading and writing the same record, from admission to published results on the student portal",
  offices: [
    { id: "portal", name: "Student Portal", role: "The student", icon: "student-portal", angle: 90 },
    { id: "bursary", name: "Bursary", role: "Fees & payments", icon: "online-payments", angle: 141.43 },
    { id: "department", name: "Department", role: "Curriculum", icon: "course-registration", angle: 192.86 },
    { id: "lecturer", name: "Lecturer", role: "Score entry", icon: "score-entry", angle: 244.29 },
    { id: "exams", name: "Exams & Records", role: "Approval chain", icon: "approval-workflows", angle: 295.71 },
    { id: "senate", name: "Senate", role: "Final approval", icon: "senate-transitions", angle: 347.14 },
    { id: "admissions", name: "Admissions", role: "Matric numbers", icon: "admission-cycles", angle: 38.57 },
  ],
  steps: [
    {
      from: "admissions",
      to: "portal",
      route: "via",
      title: "Admissions",
      text: "Admissions issues a matric number. The student's record and portal open on the same day.",
    },
    {
      from: "portal",
      to: "bursary",
      route: "arc",
      title: "Bursary",
      text: "The student pays fees on the portal through Remita or Flutterwave, and Bursary sees the payment matched to its invoice.",
    },
    {
      from: "bursary",
      to: "department",
      route: "arc",
      title: "Department",
      text: "Course registration unlocks. The course list comes from the department's curriculum, carry-overs included.",
    },
    {
      from: "department",
      to: "lecturer",
      route: "arc",
      title: "Lecturer",
      text: "Lecturers enter scores for the courses allocated to them. A sheet locks once it is submitted.",
    },
    {
      from: "lecturer",
      to: "exams",
      route: "arc",
      title: "Exams & Records",
      text: "Each score sheet moves up the approval chain you designed, and can only be sent back with a written reason.",
    },
    {
      from: "exams",
      to: "senate",
      route: "arc",
      title: "Senate",
      text: "Senate approves the cohort's results under its memo number.",
    },
    {
      from: "senate",
      to: "portal",
      route: "via",
      title: "Student Portal",
      text: "Results are published to the record and appear on the student's portal.",
    },
  ],
};

export const TRUSTED_INSTITUTIONS: TrustedInstitution[] = [];

export const HOME_MODULES_HEADING = {
  titleLead: "Our Academic",
  titleMark: "Records",
  titleTail: "Modules",
  text: "31 modules on a single database. Switch on what each office needs this session and turn on more later, with no data migration and no extra infrastructure.",
  handoffLabel: "Hand-off",
  footNote: "17 of the 31 modules are shown here. Each one opens its section on the Platform page.",
  allLabel: "View all 31 modules",
};

/** Lanes run in the order a student moves through them. Feature counts must match the Platform page categories. */
export const HOME_MODULE_LANES: HomeModuleLane[] = [
  {
    title: "Admissions",
    owner: "Admissions office & Registry",
    href: "/platform#pf-admissions",
    featureCount: 5,
    modules: [
      { id: "admission-cycles", label: "Admission Cycles" },
      { id: "matric-numbers", label: "Matric Numbers" },
    ],
    handoff: "The new student's record goes straight to Bursary. Nobody re-types it.",
  },
  {
    title: "Bursary",
    owner: "Bursar's office",
    href: "/platform#pf-bursary",
    featureCount: 6,
    modules: [
      { id: "fee-events", label: "Fee Events" },
      { id: "invoices", label: "Invoices" },
      { id: "online-payments", label: "Online Payments" },
    ],
    handoff: "A confirmed payment unlocks course registration, when your institution bills through REPROMAS.",
  },
  {
    title: "Academics",
    owner: "Faculties, departments & lecturers",
    href: "/platform#pf-academics",
    featureCount: 8,
    modules: [
      { id: "curriculum-versions", label: "Curriculum Versions" },
      { id: "course-registration", label: "Course Registration" },
      { id: "grading-systems", label: "Grading Systems" },
      { id: "score-entry", label: "Score Entry" },
    ],
    handoff: "A submitted score sheet locks and moves up the approval chain you designed.",
  },
  {
    title: "Results & Governance",
    owner: "Exams & Records and Senate",
    href: "/platform#pf-governance",
    featureCount: 8,
    modules: [
      { id: "approval-workflows", label: "Approval Workflows" },
      { id: "result-broadsheet", label: "Result Broadsheet" },
      { id: "academic-standing", label: "Academic Standing" },
      { id: "senate-transitions", label: "Senate Transitions" },
      { id: "degree-classification", label: "Degree Classification" },
    ],
  },
];

export const HOME_MODULE_FOUNDATION: HomeModuleFoundation = {
  title: "Under every stage: one student record",
  text: "Every office reads and writes the same record, so nothing is entered twice. Roles decide who can see and change what, and the audit trail records who did it, under which role, and when.",
  linkLabel: "Security & audit features",
  href: "/platform#pf-governance",
  modules: [
    { id: "roles-permissions", label: "Roles & Permissions", href: "/platform#pf-governance" },
    { id: "audit-trail", label: "Audit Trail", href: "/platform#pf-governance" },
    { id: "student-portal", label: "Student Portal", href: "/platform#pf-people" },
  ],
};

export const HOME_STATS: HomeStat[] = [
  {
    value: "31",
    title: "Modules on One Database",
    text: "Admissions, bursary, academics and results all write to the same record, so nothing is entered twice.",
    icon: "modules",
  },
  {
    value: "9",
    title: "Stages, Candidate to Graduate",
    text: "Admission, matriculation, fees, registration, scores, results, approval, senate and graduation.",
    icon: "stages",
  },
  {
    value: "99.5%",
    title: "Uptime, Written into the Contract",
    text: "With daily automated backups and continuous updates included in every plan.",
    icon: "uptime",
  },
];

export const HOME_AREAS_HEADING = {
  titleLead: "Keeping Every Office",
  titleMark: "On One Record",
  text: "Replace the admissions portal, the fee spreadsheet, the departmental Excel files and the paper senate memo with one platform that shares the same data.",
};

export const HOME_PRODUCT_AREAS: ProductArea[] = [
  {
    label: "ADMISSIONS",
    title: "From Candidate Application to Student Record",
    text: "Screen candidates by cycle and batch, admit on merit, and create the student record automatically once fees are paid.",
    checks: ["Admission cycles and batches", "Screening and merit decisions", "Matric numbers in your format"],
    singleColumnChecks: true,
    snippet: {
      kind: "people",
      people: [
        { initials: "UT", name: "Usman Tugga", meta: "U25ASC0002 · B.Sc Animal Science" },
        { initials: "AM", name: "Amina Mustapha", meta: "U25ASC0003 · B.Sc Animal Science" },
      ],
    },
  },
  {
    label: "RESULTS & GOVERNANCE",
    title: "Results Your Senate Can Defend",
    text: "Every score sheet moves through your approval ladder. Scores lock on submission, and published results can't be edited.",
    checks: [
      "Approval workflows",
      "Result broadsheet",
      "Academic standing",
      "Degree classification",
      "Senate transitions",
      "Audit trail",
    ],
    snippet: {
      kind: "table",
      headers: ["Course", "Step", "Status"],
      rows: [
        { cells: ["APH 101", "4 Published"], tag: { label: "Locked", tone: "published" } },
        { cells: ["ANS 201", "3 Senate approved"], tag: { label: "RES/042", tone: "senate" } },
        { cells: ["ANS 207", "2 Submitted"], tag: { label: "With HOD", tone: "vetting" } },
      ],
    },
  },
  {
    label: "BURSARY",
    title: "No Payment, No Registration",
    text: "Fees are tied to academic events, invoices are raised automatically, and gateway payments are matched to them.",
    checks: ["Fee policies by programme", "Lifecycle invoices", "Remita and Flutterwave", "Registration gating"],
    snippet: {
      kind: "table",
      rows: [
        { cells: ["Registration fee", "₦25,000.00"] },
        { cells: ["ICT levy", "₦5,000.00"] },
        { cells: ["Paid via Remita"], tag: { label: "Matched", tone: "published" } },
      ],
    },
  },
  {
    label: "ACADEMICS",
    title: "Registration and Scores Without Errors",
    text: "Course lists come from each student's curriculum version. Grades are worked out as lecturers type.",
    checks: ["Curriculum versions", "Course registration", "Credit limits", "Score entry and grading"],
    snippet: {
      kind: "table",
      headers: ["Matric no.", "CA", "Exam", "Total", "Grade"],
      rows: [{ cells: ["U25ASC0001", "26", "58", "84", "A"] }, { cells: ["U25ASC0003", "24", "61", "85", "A"] }],
    },
  },
  {
    label: "STUDENT PORTAL",
    title: "Self-Service That Cuts Registry Queues",
    text: "Students see their results, invoices and payment history from their phones, without queuing at the Registry.",
    checks: ["Results and CGPA", "Invoices and receipts", "Payment history"],
    singleColumnChecks: true,
  },
  {
    label: "INTEGRATIONS",
    title: "Connected to the Tools You Already Use",
    text: "Payment gateways, spreadsheets and bulk imports, so nothing has to be replaced on day one.",
    checks: [],
    snippet: {
      kind: "chips",
      chips: [
        { label: "Remita", colour: "#2E1065" },
        { label: "Flutterwave", colour: "#4C1D95" },
        { label: "Excel round-trip", colour: "#6D28D9" },
        { label: "JAMB CAPS import", colour: "#8B5CF6" },
        { label: "Paystack (on request)", colour: "#A78BFA" },
      ],
    },
  },
];

export const HOME_WHY = {
  titleLead: "Why Nigerian Institutions",
  titleMark: "Choose REPROMAS",
  text: "Registrars and ICT directors need a system that matches how Nigerian institutions actually work: senate approvals, carry-overs, Remita payments and NUC, NBTE and NCCE structures. REPROMAS is built around them, at a price your budget office can plan for.",
};

export const HOME_WHY_CARDS: WhyCard[] = [
  {
    icon: "control",
    title: "Your Data, Your Control",
    text: "Your institution owns its data and can export it in open formats at any time. Each institution is isolated on its own subdomain.",
  },
  {
    icon: "ndpa",
    title: "NDPA-Ready From Day One",
    text: "Audit trail on every score, scoped access by faculty or course, and a data processing agreement for your DPO.",
  },
  {
    icon: "gateways",
    title: "Connects to Remita & Flutterwave",
    text: "Payments are matched to invoices automatically, so the Bursary stops hearing \"I paid but it's not showing.\"",
  },
  {
    icon: "naira",
    title: "Pricing Agreed With You",
    text: "Every institution is different, so we agree pricing after a demo, based on your size, offices and timeline.",
  },
];

export const HOME_VERIFY_HEADING = {
  title: "Claims You Can Check, Not Just a Promise",
  text: "Before you trust a platform with student records, check what it says. Your ICT team can verify all of this.",
};

export const HOME_VERIFY_CARDS: VerifyCard[] = [
  {
    title: "Try the Demo Institution",
    text: "Get a login to the demo institution and run a score sheet all the way to a senate-approved broadsheet.",
    linkLabel: "Request access →",
  },
  {
    title: "Ask for Any Score's History",
    text: "Pick any score and see who entered it, who changed it, and which approval it passed.",
    linkLabel: "See it in a demo →",
  },
  {
    title: "Export Your Data",
    text: "Download your institution's records in open formats at any time. There's no lock-in.",
    linkLabel: "Ask for a sample →",
  },
  {
    title: "Read the Contracts First",
    text: "The service level agreement and the data processing agreement come with the quotation, before you commit.",
    linkLabel: "Request a copy →",
  },
];

export const TESTIMONIALS: Testimonial[] = [];

export const GUIDES: Guide[] = [
  {
    category: "Results",
    title: "Degree Classification on the 5-Point Scale, Explained",
    excerpt:
      "The bands, how CGPA is worked out, and the edge cases senates argue about: spill-overs, carry-overs and rounding.",
    readMinutes: 8,
    status: "planned",
    thumbLabel: "5.0 → First Class",
    thumbGradient: ["#2E1065", "#6D28D9"],
  },
  {
    category: "Curriculum",
    title: "Changing to a New CCMAS Curriculum Without Breaking Old Cohorts",
    excerpt:
      "How curriculum versions let a department adopt a new handbook while older students finish under the one they were admitted on.",
    readMinutes: 10,
    status: "planned",
    thumbLabel: "CCMAS",
    thumbGradient: ["#4C1D95", "#8B5CF6"],
  },
  {
    category: "Compliance",
    title: "What the NDPA 2023 Means for an Exams & Records Office",
    excerpt: "Controllers and processors, reporting a breach within 72 hours, and the annual compliance audit return.",
    readMinutes: 9,
    status: "planned",
    thumbLabel: "NDPA 2023",
    thumbGradient: ["#6D28D9", "#A78BFA"],
  },
];

export const HOME_FINAL_CTA = {
  title: "Ready to Run Your Next Results Cycle on REPROMAS?",
  text: "See a full cycle on your own course names in 30 minutes, then pilot on your own curriculum before campus-wide rollout.",
};

export const HOME_SEO = {
  title: "Academic Records Software for Nigerian Institutions",
  description:
    "REPROMAS runs admission, fees, course registration, results, senate approval and graduation on one governed record for Nigerian universities, polytechnics and colleges of education.",
};
