import type { UseTokenReturn } from '@/shared/hooks/useToken';
import type { Breakpoint } from 'antd';
import { Button, Col, Row, Typography } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import type { HeroContent } from '../../hooks/use-landing-page';

type HeroSectionProps = {
  hero: HeroContent;
  token: UseTokenReturn;
  breakpoints: Partial<Record<Breakpoint, boolean>>;
};

export const HeroSection: React.FC<HeroSectionProps> = ({ hero, token, breakpoints }) => {
  const btnWidth = breakpoints.sm ? 'auto' : '100%';

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Background image */}
      <img
        src={hero.backgroundImageUrl}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: 0.2,
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0.8))',
        }}
      />

      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: breakpoints.md ? '96px 24px' : '48px 16px',
          }}
        >
          <Row>
            <Col xs={24} md={16} lg={12}>
              <Typography.Title
                style={{
                  fontSize: 'clamp(2rem, 8vw, 4.5rem)',
                  lineHeight: 1.1,
                  marginBottom: token.marginMD,
                  color: token.colorTextHeading,
                }}
              >
                {hero.headline}
              </Typography.Title>

              <Typography.Paragraph
                style={{
                  fontSize: token.fontSizeLG,
                  color: token.colorTextSecondary,
                  marginBottom: token.marginLG,
                  maxWidth: 560,
                }}
              >
                {hero.subtext}
              </Typography.Paragraph>

              <div style={{ display: 'flex', gap: token.marginSM, flexWrap: 'wrap' }}>
                <Link to={hero.primaryCta.to}>
                  <Button type="primary" size="large" style={{ width: btnWidth }}>
                    {hero.primaryCta.label}
                  </Button>
                </Link>
                <Link to={hero.secondaryCta.to}>
                  <Button size="large" style={{ width: btnWidth }}>
                    {hero.secondaryCta.label}
                  </Button>
                </Link>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </section>
  );
};
