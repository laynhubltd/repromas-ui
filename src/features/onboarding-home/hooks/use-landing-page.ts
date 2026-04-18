import type { UseTokenReturn } from '@/shared/hooks/useToken';
import { useToken } from '@/shared/hooks/useToken';
import {
    ApartmentOutlined,
    BankOutlined,
    BarChartOutlined,
    BgColorsOutlined,
    BookOutlined,
    LockOutlined,
    ReadOutlined,
    SafetyOutlined,
    SettingOutlined,
    SolutionOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import type { Breakpoint } from 'antd';
import { Grid } from 'antd';
import React, { useEffect, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ModuleCard = {
  key: string;
  icon: React.ReactNode;
  title: string;
  description: string;
};

export type FeatureHighlight = {
  key: string;
  badgeIcon: React.ReactNode;
  badgeLabel: string;
  headline: string;
  bullets: string[];
  imageUrl: string;
  imageAlt: string;
};

export type HeroContent = {
  headline: string;
  subtext: string;
  primaryCta: { label: string; to: string };
  secondaryCta: { label: string; to: string };
  backgroundImageUrl: string;
};

export type CtaContent = {
  headline: string;
  subtext: string;
  primaryCta: { label: string; to: string };
  secondaryCta: { label: string; to: string };
};

export type UseLandingPageReturn = {
  hero: HeroContent;
  modules: ModuleCard[];
  features: FeatureHighlight[];
  cta: CtaContent;
  token: UseTokenReturn;
  breakpoints: Partial<Record<Breakpoint, boolean>>;
};

// ─── Font constant ────────────────────────────────────────────────────────────

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLandingPage(): UseLandingPageReturn {
  const token = useToken();
  const breakpoints = Grid.useBreakpoint();

  // Inject Inter font once on mount with dedup guard
  useEffect(() => {
    const existing = document.head.querySelector(`link[href="${FONT_HREF}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  const hero = useMemo<HeroContent>(
    () => ({
      headline: 'Transform Your Institution',
      subtext:
        'A unified, intelligent platform that orchestrates every aspect of academic management from enrollment to graduation.',
      primaryCta: { label: 'Get Started', to: '/tenant-signup' },
      secondaryCta: { label: 'Watch Demo', to: '/about' },
      backgroundImageUrl:
        'https://images.unsplash.com/photo-1612277107663-a65c0f67be64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000',
    }),
    [],
  );

  const modules = useMemo<ModuleCard[]>(
    () => [
      {
        key: 'authentication',
        icon: React.createElement(SafetyOutlined),
        title: 'Authentication',
        description:
          'Your institution\'s secure front door. Effortless logins, rapid registrations, and self-service password resets — powered by intelligent tokens that instantly know who is knocking and what they are allowed to do.',
      },
      {
        key: 'authorization',
        icon: React.createElement(TeamOutlined),
        title: 'Authorization',
        description:
          'Put the right power in the right hands. Define precise permissions, group them into custom roles, and assign with confidence. The system enforces your rules deep within the database — perfect data privacy, zero manual effort.',
      },
      {
        key: 'academic',
        icon: React.createElement(BookOutlined),
        title: 'Academic',
        description:
          'Bring your organizational chart to life. Manage faculties, departments, programs, and courses. Architect sessions, semesters, and evolving curriculums in a fully isolated, pristine environment.',
      },
      {
        key: 'student',
        icon: React.createElement(SolutionOutlined),
        title: 'Student',
        description:
          'From first day on campus to graduation day. Track enrollments, course registrations, academic standing, and transitions — the complete student lifecycle unified in one cohesive module.',
      },
      {
        key: 'grading',
        icon: React.createElement(BarChartOutlined),
        title: 'Grading',
        description:
          'Scores that command trust. Input raw marks and our engine instantly applies your institution\'s unique grading schema — producing structured, auditable, and mathematically perfect grade results every time.',
      },
      {
        key: 'system',
        icon: React.createElement(SettingOutlined),
        title: 'System',
        description:
          'Total command at your fingertips. Manage platform-wide configurations, define bespoke grading schemas, and inject your institution\'s brand identity into every corner of the system.',
      },
      {
        key: 'tenant',
        icon: React.createElement(BankOutlined),
        title: 'Tenant',
        description:
          'One powerful platform, infinite institutions. Launch a new campus in seconds — fully provisioned with active permissions, a System Administrator role, and a ready-to-use dashboard from Day One.',
      },
      {
        key: 'shared',
        icon: React.createElement(ApartmentOutlined),
        title: 'Shared',
        description:
          'The brilliant architecture behind the magic. A centralized hub of contracts, tools, and utilities that keeps every module communicating with blazing speed and zero friction.',
      },
    ],
    [],
  );

  const features = useMemo<FeatureHighlight[]>(
    () => [
      {
        key: 'authentication-feature',
        badgeIcon: React.createElement(LockOutlined),
        badgeLabel: 'Authentication',
        headline: 'Enterprise-Grade Security From Day One',
        bullets: [
          'Multi-factor authentication with TOTP and SMS support',
          'Single sign-on via SAML 2.0 and OAuth 2.0',
          'Session management with configurable expiry policies',
          'Audit trail for every login and permission change',
        ],
        imageUrl:
          'https://images.unsplash.com/photo-1769209435699-9cc1fd8e7f57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
        imageAlt: 'Authentication security dashboard',
      },
      {
        key: 'academic-administration-feature',
        badgeIcon: React.createElement(ReadOutlined),
        badgeLabel: 'Academic Administration',
        headline: 'Streamline Every Academic Process',
        bullets: [
          'Drag-and-drop curriculum builder with version control',
          'Automated conflict detection for course scheduling',
          'Academic calendar management with holiday support',
          'Faculty workload tracking and department analytics',
        ],
        imageUrl:
          'https://images.unsplash.com/photo-1625640776489-4186592c6f00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
        imageAlt: 'Academic administration interface',
      },
      {
        key: 'student-experience-feature',
        badgeIcon: React.createElement(UserOutlined),
        badgeLabel: 'Student Experience',
        headline: 'Empower Students at Every Step',
        bullets: [
          'Self-service enrollment with real-time seat availability',
          'Personalized dashboards with progress tracking',
          'Integrated grade book with instant notifications',
          'Mobile-first design for on-the-go access',
        ],
        imageUrl:
          'https://images.unsplash.com/photo-1759299615947-bc798076b479?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
        imageAlt: 'Student experience portal',
      },
      {
        key: 'brand-customization-feature',
        badgeIcon: React.createElement(BgColorsOutlined),
        badgeLabel: 'Brand Customization',
        headline: 'Your Institution, Your Identity',
        bullets: [
          'White-label branding with custom logos and color themes',
          'Configurable email templates and notification styles',
          'Custom domain support for each tenant',
          'Theme editor with live preview across all modules',
        ],
        imageUrl:
          'https://images.unsplash.com/photo-1591351659190-6258bbec984d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
        imageAlt: 'Brand customization theme editor',
      },
    ],
    [],
  );

  const cta = useMemo<CtaContent>(
    () => ({
      headline: 'Ready to Transform Your Institution?',
      subtext:
        'Experience the competitive advantage your administration has been waiting for. Bring order, speed, and elegance to every process.',
      primaryCta: { label: 'Get Started', to: '/tenant-signup' },
      secondaryCta: { label: 'Watch Demo', to: '/about' },
    }),
    [],
  );

  return { hero, modules, features, cta, token, breakpoints };
}
