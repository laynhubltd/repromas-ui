import type { UseTokenReturn } from '@/shared/hooks/useToken';
import type { Breakpoint } from 'antd';
import { Col, Row, Typography } from 'antd';
import React from 'react';
import type { FeatureHighlight } from '../../hooks/use-landing-page';

type FeaturesSectionProps = {
  features: FeatureHighlight[];
  token: UseTokenReturn;
  breakpoints: Partial<Record<Breakpoint, boolean>>;
};

type FeatureRowProps = {
  feature: FeatureHighlight;
  index: number;
  token: UseTokenReturn;
};

const FeatureRow: React.FC<FeatureRowProps> = ({ feature, index, token }) => {
  const isOdd = index % 2 !== 0;

  // Cycle through 4 distinct image shapes
  const imageShapes = [
    // 0 — rounded rectangle (standard)
    { borderRadius: 20, aspectRatio: '4/3' },
    // 1 — ellipse (wide oval)
    { borderRadius: '50%', aspectRatio: '4/3' },
    // 2 — balloon (tall, rounded top, flat-ish bottom)
    { borderRadius: '50% 50% 20px 20px / 60% 60% 20px 20px', aspectRatio: '3/4' },
    // 3 — squircle (very high radius)
    { borderRadius: '38% 62% 46% 54% / 42% 38% 62% 58%', aspectRatio: '4/3' },
  ];

  const shape = imageShapes[index % imageShapes.length];

  return (
    <div data-testid="feature-row">
      <Row gutter={[48, 32]} align="middle">
        {/* Text column */}
        <Col xs={24} lg={12} order={isOdd ? 2 : 1}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: token.marginXS,
              background: `${token.colorPrimary}1A`,
              color: token.colorPrimary,
              borderRadius: 9999,
              padding: `${token.paddingXS}px ${token.paddingMD}px`,
              marginBottom: token.marginMD,
              fontSize: token.fontSize,
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>{feature.badgeIcon}</span>
            <span>{feature.badgeLabel}</span>
          </div>

          {/* Headline */}
          <Typography.Title
            level={3}
            data-testid="feature-headline"
            style={{ marginBottom: token.marginMD, marginTop: 0 }}
          >
            {feature.headline}
          </Typography.Title>

          {/* Bullets */}
          <ul style={{ paddingLeft: token.paddingMD, margin: 0 }}>
            {feature.bullets.map((bullet, i) => (
              <li
                key={i}
                style={{
                  color: token.colorTextSecondary,
                  fontSize: token.fontSizeLG,
                  marginBottom: token.marginSM,
                  lineHeight: 1.6,
                }}
              >
                {bullet}
              </li>
            ))}
          </ul>
        </Col>

        {/* Image column — hidden on xs/md, visible on lg */}
        <Col xs={0} md={0} lg={12} order={isOdd ? 1 : 2}>
          {/* Outer positioning context for decorative elements */}
          <div style={{ position: 'relative', padding: '24px', width: '75%', margin: '0 auto' }}>

            {/* Main image frame */}
            <div style={{
              position: 'relative',
              zIndex: 1,
              borderRadius: shape.borderRadius,
              overflow: 'hidden',
              border: '3px solid #e9d5ff',
              aspectRatio: shape.aspectRatio,
            }}>
              <img
                src={feature.imageUrl}
                alt={feature.imageAlt}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                }}
              />
              {/* Subtle gradient overlay on image */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom right, transparent 60%, rgba(107,33,168,0.12) 100%)',
                pointerEvents: 'none',
              }} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  features,
  token,
  breakpoints,
}) => {
  return (
    <section
      id="features"
      style={{
        background: token.colorBgContainer,
        padding: breakpoints.lg ? '96px 0' : '48px 0',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: breakpoints.md ? '0 24px' : '0 16px',
        }}
      >
        {/* Section heading */}
        <div style={{ textAlign: 'center', marginBottom: breakpoints.md ? 64 : 40 }}>
          <Typography.Title level={2} style={{ marginBottom: token.marginSM }}>
            Designed for Real-World Impact
          </Typography.Title>
          <Typography.Paragraph
            style={{ fontSize: token.fontSizeLG, color: token.colorTextSecondary, margin: 0 }}
          >
            Features that deliver efficiency, security, and seamless control
          </Typography.Paragraph>
        </div>

        {/* Feature rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: breakpoints.lg ? 80 : 48 }}>
          {features.map((feature, index) => (
            <FeatureRow key={feature.key} feature={feature} index={index} token={token} />
          ))}
        </div>
      </div>
    </section>
  );
};
