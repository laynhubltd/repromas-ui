import type { UseTokenReturn } from '@/shared/hooks/useToken';
import type { Breakpoint } from 'antd';
import { Button, Typography } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import type { HeroContent } from '../../hooks/use-landing-page';

const PRIMARY = '#6B21A8';

type HeroSectionProps = {
  hero: HeroContent;
  token: UseTokenReturn;
  breakpoints: Partial<Record<Breakpoint, boolean>>;
};

export const HeroSection: React.FC<HeroSectionProps> = ({ hero, breakpoints }) => {
  const isMobile = !breakpoints.sm;

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      {/* ── Academic pitch pattern background ─────────────────────────── */}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1.8" fill={PRIMARY} />
          </pattern>
          <pattern id="academic-tile" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
            <polygon points="80,22 108,38 80,54 52,38" fill="none" stroke={PRIMARY} strokeWidth="2" />
            <rect x="74" y="54" width="12" height="16" fill="none" stroke={PRIMARY} strokeWidth="2" />
            <line x1="108" y1="38" x2="108" y2="56" stroke={PRIMARY} strokeWidth="2" />
            <circle cx="108" cy="59" r="3" fill={PRIMARY} />
            <path d="M36,100 Q50,92 64,100 L64,124 Q50,116 36,124 Z" fill="none" stroke={PRIMARY} strokeWidth="2" />
            <path d="M64,100 Q78,92 92,100 L92,124 Q78,116 64,124 Z" fill="none" stroke={PRIMARY} strokeWidth="2" />
            <line x1="64" y1="100" x2="64" y2="124" stroke={PRIMARY} strokeWidth="1.5" />
            <line x1="42" y1="108" x2="60" y2="106" stroke={PRIMARY} strokeWidth="1" opacity="0.6" />
            <line x1="42" y1="114" x2="60" y2="112" stroke={PRIMARY} strokeWidth="1" opacity="0.6" />
            <line x1="68" y1="106" x2="86" y2="108" stroke={PRIMARY} strokeWidth="1" opacity="0.6" />
            <line x1="68" y1="112" x2="86" y2="114" stroke={PRIMARY} strokeWidth="1" opacity="0.6" />
            <path d="M118,88 A22,22 0 0,1 154,88" fill="none" stroke={PRIMARY} strokeWidth="2" strokeDasharray="4 3" />
            <line x1="136" y1="66" x2="118" y2="88" stroke={PRIMARY} strokeWidth="1.8" />
            <line x1="136" y1="66" x2="154" y2="88" stroke={PRIMARY} strokeWidth="1.8" />
            <circle cx="136" cy="66" r="3" fill={PRIMARY} />
            <circle cx="118" cy="88" r="2" fill={PRIMARY} />
            <circle cx="154" cy="88" r="2" fill={PRIMARY} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
        <rect width="100%" height="100%" fill="url(#academic-tile)" />
      </svg>

      {/* Gradient overlay removed — SVG pattern shows through directly */}

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 1, width: '100%',
        maxWidth: 860,
        margin: '0 auto',
        padding: isMobile ? '80px 20px 60px' : '120px 32px 80px',
        textAlign: 'center',
      }}>

        {/* Headline with gradient */}
        <Typography.Title
          level={1}
          style={{
            fontSize: isMobile ? 'clamp(2.2rem, 10vw, 3rem)' : 'clamp(3rem, 6vw, 4.75rem)',
            lineHeight: 1.08,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: 24,
            color: '#000000',
          }}
        >
          {hero.headline}
        </Typography.Title>

        {/* Subtext */}
        <Typography.Paragraph
          style={{
            fontSize: isMobile ? 16 : 19,
            color: '#4B5563',
            lineHeight: 1.7,
            maxWidth: 620,
            margin: '0 auto 40px',
          }}
        >
          {hero.subtext}
        </Typography.Paragraph>

        {/* CTA buttons */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Link to={hero.primaryCta.to}>
            <Button
              type="primary"
              size="large"
              style={{
                height: 52,
                paddingInline: 32,
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 10,
                width: isMobile ? '100%' : 'auto',
                boxShadow: `0 4px 24px ${PRIMARY}55`,
              }}
            >
              {hero.primaryCta.label} →
            </Button>
          </Link>
          <Link to={hero.secondaryCta.to}>
            <Button
              size="large"
              style={{
                height: 52,
                paddingInline: 28,
                fontSize: 16,
                fontWeight: 500,
                borderRadius: 10,
                width: isMobile ? '100%' : 'auto',
                border: `1.5px solid ${PRIMARY}44`,
                color: PRIMARY,
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {hero.secondaryCta.label}
            </Button>
          </Link>
        </div>

        {/* Social proof strip */}
        <div style={{
          marginTop: 56,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? 12 : 32,
          color: '#6B7280',
          fontSize: 13,
          fontWeight: 500,
        }}>
          {[
            { value: '500+', label: 'Institutions' },
            { value: '2M+', label: 'Students managed' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map(({ value, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: PRIMARY }}>{value}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
