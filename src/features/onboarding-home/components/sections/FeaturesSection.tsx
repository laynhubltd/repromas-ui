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
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '75%', // 4:3 aspect ratio
              borderRadius: token.borderRadius,
              border: `1px solid ${token.colorBorder}`,
              overflow: 'hidden',
            }}
          >
            <img
              src={feature.imageUrl}
              alt={feature.imageAlt}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
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
