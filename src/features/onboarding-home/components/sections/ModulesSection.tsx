import type { UseTokenReturn } from '@/shared/hooks/useToken';
import type { Breakpoint } from 'antd';
import { Col, Row, Typography } from 'antd';
import React, { useState } from 'react';
import type { ModuleCard } from '../../hooks/use-landing-page';

type ModulesSectionProps = {
  modules: ModuleCard[];
  token: UseTokenReturn;
  breakpoints: Partial<Record<Breakpoint, boolean>>;
};

type ModuleCardItemProps = {
  module: ModuleCard;
  token: UseTokenReturn;
};

const ModuleCardItem: React.FC<ModuleCardItemProps> = ({ module, token }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      data-testid="module-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? token.boxShadow : 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        border: `1px solid ${isHovered ? token.colorPrimary : token.colorBorder}`,
        borderRadius: token.borderRadius,
        cursor: 'pointer',
        minHeight: 120,
        padding: token.paddingMD,
        background: token.colorBgContainer,
      }}
    >
      <div style={{ fontSize: 24, color: token.colorPrimary, marginBottom: token.marginSM }}>
        {module.icon}
      </div>
      <Typography.Text
        data-testid="module-title"
        strong
        style={{ display: 'block', marginBottom: token.marginXS, fontSize: token.fontSizeLG }}
      >
        {module.title}
      </Typography.Text>
      <Typography.Text
        data-testid="module-description"
        style={{ color: token.colorTextSecondary, fontSize: token.fontSize }}
      >
        {module.description}
      </Typography.Text>
    </div>
  );
};

export const ModulesSection: React.FC<ModulesSectionProps> = ({ modules, token, breakpoints }) => {
  const gutter = breakpoints.md ? ([24, 24] as [number, number]) : ([16, 16] as [number, number]);

  return (
    <section
      id="modules"
      style={{
        background: token.colorBgLayout,
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
        <div style={{ textAlign: 'center', marginBottom: breakpoints.md ? 48 : 32 }}>
          <Typography.Title level={2} style={{ marginBottom: token.marginSM }}>
            The Foundation of Excellence
          </Typography.Title>
          <Typography.Paragraph
            style={{ fontSize: token.fontSizeLG, color: token.colorTextSecondary, margin: 0 }}
          >
            Eight powerful engines orchestrating your institution
          </Typography.Paragraph>
        </div>

        <Row gutter={gutter}>
          {modules.map((module) => (
            <Col key={module.key} xs={24} md={12} lg={6}>
              <ModuleCardItem module={module} token={token} />
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};
