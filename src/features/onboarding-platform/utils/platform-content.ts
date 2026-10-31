import type { PlatformCategory } from "../types";

/** Every description states only what the product does today. Roadmap items carry `rollingOut`. */

export const PLATFORM_HERO = {
  pill: "31 Modules",
  title: "The Complete Academic Records Platform",
  text: "Everything your institution needs to run admissions, fees, registration, results and graduation on one governed record, built around NUC, NBTE and NCCE structures.",
};

export const PLATFORM_CATEGORIES: PlatformCategory[] = [
  {
    id: "pf-admissions",
    title: "Admissions",
    text: "Everything from the moment a candidate applies to the day they become a student, with no re-typing between offices.",
    features: [
      {
        title: "Admission Cycles",
        icon: "admission-cycles",
        text: "Run UTME, Direct Entry and Transfer admissions as separate cycles and batches, each with its own dates, forms and requirements.",
      },
      {
        title: "JAMB CAPS Import",
        icon: "invoices",
        text: "Load candidate lists straight from JAMB CAPS spreadsheets. Every row is checked before it is saved.",
      },
      {
        title: "Screening & Merit",
        icon: "grading-systems",
        text: "Record screening scores, rank candidates by aggregate and make merit or supplementary admission decisions in one list.",
      },
      {
        title: "Matric Numbers",
        icon: "matric-numbers",
        text: "Generate matric numbers in your institution's own format, one format per admission lane, issued once the registration fee is paid.",
      },
      {
        title: "Candidate Portal",
        icon: "student-portal",
        text: "Candidates apply, upload documents, pay application fees and track their admission status without visiting the admissions office.",
      },
    ],
  },
  {
    id: "pf-bursary",
    title: "Bursary",
    text: "Fees tied to academic events, invoices raised automatically, and every gateway payment matched to its invoice.",
    features: [
      {
        title: "Fee Events",
        icon: "fee-events",
        text: "Define acceptance, registration, tuition, ICT levy and document fees as events tied to your academic calendar.",
      },
      {
        title: "Fee Policies",
        icon: "invoices",
        text: "Set amounts by programme, level, entry mode and indigene status, published as versioned policies the Bursary controls.",
      },
      {
        title: "Invoices",
        icon: "invoices",
        text: "Invoices are raised automatically at acceptance, session start, course registration and document requests.",
      },
      {
        title: "Remita",
        icon: "online-payments",
        text: "Collect fees through Remita, generating the RRR and matching each payment to its invoice automatically.",
      },
      {
        title: "Flutterwave",
        icon: "online-payments",
        text: "Accept card and bank payments through Flutterwave, routed automatically at checkout.",
      },
      {
        title: "Payment Matching & Gating",
        icon: "audit-trail",
        text: "No manual reconciliation. Hold course registration or exam cards until the right fees are cleared.",
      },
    ],
  },
  {
    id: "pf-academics",
    title: "Academics",
    text: "The structure every other module reads from, plus registration and score entry that can't produce broken records.",
    features: [
      {
        title: "Faculties & Departments",
        icon: "senate-transitions",
        text: "Model your faculties or schools and their departments, the structure that programmes, courses and permissions all build on.",
      },
      {
        title: "Programmes",
        icon: "degree-classification",
        text: "Programmes with degree titles, duration, maximum residency and entry levels for ND, HND, NCE and degree courses.",
      },
      {
        title: "Curriculum Versions",
        icon: "curriculum-versions",
        text: "Keep CCMAS, NBTE and NCCE curriculum versions side by side, so existing cohorts finish under the version they were admitted on.",
      },
      {
        title: "Course Catalogue",
        icon: "curriculum-versions",
        text: "Course codes, titles, units and owning departments, uploaded in bulk from your handbook.",
      },
      {
        title: "Course Registration",
        icon: "course-registration",
        text: "Each student's course pool is built from their own curriculum version: core courses, electives and carry-overs.",
      },
      {
        title: "Credit Limits & Prerequisites",
        icon: "academic-standing",
        text: "Minimum and maximum units per semester, carry-over-first rules and prerequisite checks, enforced before anything is saved.",
      },
      {
        title: "Score Entry",
        icon: "score-entry",
        text: "Lecturers enter CA and exam scores in an auto-saving grid, or upload the department's Excel template.",
      },
      {
        title: "Grading Systems",
        icon: "grading-systems",
        text: "Grade boundaries and points on a 5.0, 4.0 or custom scale, applied the moment scores are typed.",
      },
    ],
  },
  {
    id: "pf-governance",
    title: "Results & Governance",
    text: "The approval chain, standing rules and degree classes your Academic Board decides, applied the same way to every cohort.",
    features: [
      {
        title: "Approval Workflows",
        icon: "approval-workflows",
        text: "Design the approval ladder for each document type. A sheet can only be sent back with a written reason.",
      },
      {
        title: "Result Broadsheet",
        icon: "result-broadsheet",
        text: "Broadsheets built from the curriculum, with a completeness check that holds a cohort back until every course sheet is final.",
      },
      {
        title: "Academic Standing",
        icon: "academic-standing",
        text: "CGPA bands for good standing, probation and withdrawal, evaluated for every student each semester.",
      },
      {
        title: "Escalation Ladders",
        icon: "approval-workflows",
        text: "Probation I, Probation II and advised-to-withdraw steps, with lifetime caps applied consistently across cohorts.",
      },
      {
        title: "Degree Classification",
        icon: "degree-classification",
        text: "First Class to Pass, or Distinction to Pass, applied the same way to every graduating list and broadsheet.",
      },
      {
        title: "Senate Transitions",
        icon: "senate-transitions",
        text: "Check the cohort's standing in a dry run, then commit it under the senate approval memo number.",
      },
      {
        title: "Audit Trail",
        icon: "audit-trail",
        text: "Every create, edit and approval is recorded with the person, the role they acted under and the time.",
      },
      {
        title: "Roles & Permissions",
        icon: "roles-permissions",
        text: "Limit access to a faculty, department or programme, or, for lecturers, to their allocated courses.",
      },
    ],
  },
  {
    id: "pf-people",
    title: "People & Portals",
    text: "Records and self-service for the people the system serves.",
    features: [
      {
        title: "Student Records",
        icon: "matric-numbers",
        text: "One record per student with matric number, programme, level, curriculum version and full semester-by-semester transcript history.",
      },
      {
        title: "Student Portal",
        icon: "student-portal",
        text: "Students check their results and CGPA, see their invoices and payment history, and download receipts from their phones.",
      },
      {
        title: "Staff & Course Allocation",
        icon: "roles-permissions",
        text: "Staff profiles and the courses each lecturer is allocated each session, which controls what they can see and score.",
      },
      {
        title: "Executive Dashboard",
        icon: "academic-standing",
        text: "Headcount, standing distribution and students at risk, scoped to the office of the person viewing it.",
      },
    ],
  },
  {
    id: "pf-connected",
    title: "Connected Systems",
    text: "Work with the tools your institution already uses.",
    features: [
      {
        title: "Excel Round-Trip",
        icon: "score-entry",
        text: "Download a score sheet as the department's Excel template, fill it in offline and upload it back, checked on upload.",
      },
      {
        title: "Bulk Import",
        icon: "invoices",
        text: "Import students, courses and curricula from spreadsheets during onboarding, with every row validated.",
      },
      {
        title: "Open-Format Export",
        icon: "result-broadsheet",
        text: "Export your institution's records in open formats at any time. Your data is never locked in.",
      },
    ],
  },
  {
    id: "pf-services",
    title: "Services & Support",
    text: "The people behind the software, from first configuration to the first published results.",
    features: [
      {
        title: "Implementation & Data Onboarding",
        icon: "course-registration",
        text: "Tenant set-up, branding and data import, done alongside your ICT team with a named onboarding engineer.",
      },
      {
        title: "Training & REPROMAS Academy",
        icon: "degree-classification",
        text: "Workshops for Registry, Bursary, Deans, HODs, lecturers and ICT staff, plus step-by-step Academy videos.",
      },
      {
        title: "Support & 99.5% SLA",
        icon: "audit-trail",
        text: "Security patches, continuous updates and 99.5% uptime, written into your contract.",
      },
      {
        title: "Verified Transcripts",
        icon: "result-broadsheet",
        text: "Public QR verification for employers and receiving universities, plus digitising historical paper archives onto the governed record.",
        rollingOut: "Rolling out 2026/27",
      },
    ],
  },
];

export const PLATFORM_FINAL_CTA = {
  title: "Ready to See Your Programmes Running on REPROMAS?",
  text: "Book a 30-minute demo on the demo institution, then test a full results cycle on your own curriculum before campus-wide rollout.",
};

export const PLATFORM_SEO = {
  title: "Platform: 31 Academic Records Modules",
  description:
    "Admissions, bursary, academics and results governance for Nigerian universities, polytechnics and colleges of education, on one governed record.",
};
