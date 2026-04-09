import type { UseTokenReturn } from '@/shared/hooks/useToken';
import type { Breakpoint } from 'antd';
import { Button, Typography } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import type { CtaContent } from '../../hooks/use-landing-page';

type CtaSectionProps = {
  cta: CtaContent;
  token: UseTokenReturn;
  breakpoints: Partial<Record<Breakpoint, boolean>>;
};

export const CtaSection: React.FC<CtaSectionProps> = ({ cta, token, breakpoints }) => {
  const btnWidth = breakpoints.sm ? 'auto' : '100%';
  const btnFlexDirection = breakpoints.sm ? 'row' : 'column';

  return (
    <section
      style={{
        background: `linear-gradient(to bottom, ${token.colorPrimaryBg}, ${token.colorBgContainer})`,
        padding: breakpoints.lg ? '96px 0' : '48px 0',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: breakpoints.md ? '0 24px' : '0 16px',
          textAlign: 'center',
        }}
      >
        <Typography.Title
          style={{
            fontSize: 'clamp(1.75rem, 6vw, 3.5rem)',
            marginBottom: token.marginMD,
          }}
        >
          {cta.headline}
        </Typography.Title>

        <Typography.Paragraph
          style={{
            fontSize: token.fontSizeLG,
            color: token.colorTextSecondary,
            marginBottom: token.marginLG,
            maxWidth: 640,
            margin: `0 auto ${token.marginLG}px`,
          }}
        >
          {cta.subtext}
        </Typography.Paragraph>

        <div
          style={{
            display: 'flex',
            flexDirection: btnFlexDirection,
            gap: token.marginSM,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Link to={cta.primaryCta.to}>
            <Button type="primary" size="large" style={{ width: btnWidth }}>
              {cta.primaryCta.label}
            </Button>
          </Link>
          <Link to={cta.secondaryCta.to}>
            <Button size="large" style={{ width: btnWidth }}>
              {cta.secondaryCta.label}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
