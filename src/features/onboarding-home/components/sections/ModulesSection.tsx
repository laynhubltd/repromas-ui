import type { UseTokenReturn } from '@/shared/hooks/useToken';
import { ThunderboltOutlined } from '@ant-design/icons';
import type { Breakpoint } from 'antd';
import { Col, Row, Typography } from 'antd';
import React, { useState } from 'react';
import type { ModuleCard } from '../../hooks/use-landing-page';

const PRIMARY = '#6B21A8';
const PRIMARY_PALE = '#F3E8FF';

type ModulesSectionProps = {
  modules: ModuleCard[];
  token: UseTokenReturn;
  breakpoints: Partial<Record<Breakpoint, boolean>>;
};

type ModuleCardItemProps = {
  module: ModuleCard;
};

const ModuleCardItem: React.FC<ModuleCardItemProps> = ({ module }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      data-testid="module-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        height: '100%',
        padding: '28px 24px',
        borderRadius: 12,
        background: isHovered ? '#f9f5ff' : '#ffffff',
        border: `1.5px solid ${isHovered ? PRIMARY : '#e9d5ff'}`,
        boxShadow: isHovered
          ? `0 8px 32px ${PRIMARY}22, 0 2px 8px ${PRIMARY}11`
          : '0 1px 4px rgba(0,0,0,0.04)',
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.22s ease',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Icon bubble */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: isHovered ? PRIMARY : PRIMARY_PALE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        color: isHovered ? '#ffffff' : PRIMARY,
        transition: 'all 0.22s ease',
        flexShrink: 0,
      }}>
        {module.icon}
      </div>

      <div>
        <Typography.Text
          data-testid="module-title"
          strong
          style={{
            display: 'block',
            fontSize: 16,
            fontWeight: 700,
            color: '#111827',
            marginBottom: 8,
            letterSpacing: '-0.01em',
          }}
        >
          {module.title}
        </Typography.Text>
        <Typography.Text
          data-testid="module-description"
          style={{
            color: '#6B7280',
            fontSize: 14,
            lineHeight: 1.65,
            display: 'block',
          }}
        >
          {module.description}
        </Typography.Text>
      </div>
    </div>
  );
};

export const ModulesSection: React.FC<ModulesSectionProps> = ({ modules, breakpoints }) => {
  const gutter = breakpoints.md ? ([24, 24] as [number, number]) : ([16, 16] as [number, number]);

  return (
    <section
      id="modules"
      style={{
        background: '#ffffff',
        padding: breakpoints.lg ? '96px 0' : '56px 0',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: breakpoints.md ? '0 32px' : '0 16px',
        }}
      >
        {/* Admission Engine pitch card */}
        <div style={{ marginBottom: breakpoints.md ? 56 : 36 }}>
          <div style={{
            borderRadius: 20,
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #9333EA 60%, #C084FC 100%)`,
            padding: breakpoints.md ? '52px 56px' : '36px 24px',
            display: 'flex',
            flexDirection: breakpoints.lg ? 'row' : 'column',
            alignItems: breakpoints.lg ? 'center' : 'flex-start',
            gap: breakpoints.lg ? 48 : 28,
          }}>
            {/* Icon */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.15)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              color: '#ffffff',
              flexShrink: 0,
            }}>
              <ThunderboltOutlined />
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: 999,
                marginBottom: 14,
              }}>
                New · Intelligent Admission Engine
              </div>
              <Typography.Title
                level={3}
                style={{
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: breakpoints.md ? 26 : 20,
                  letterSpacing: '-0.02em',
                  marginBottom: 12,
                  marginTop: 0,
                }}
              >
                Stop Drowning in Spreadsheets. Let the Engine Decide.
              </Typography.Title>
              <Typography.Paragraph
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 15,
                  lineHeight: 1.75,
                  margin: 0,
                  maxWidth: 680,
                }}
              >
                Sorting thousands of applications, cross-checking subject combinations, balancing cut-off marks, and managing quotas — all manually. Where there are spreadsheets, there are errors, delays, and bias. Our <strong style={{ color: '#ffffff' }}>Intelligent Automated Admission Engine</strong> evaluates thousands of prospective students in the time it takes to pour your morning coffee.
              </Typography.Paragraph>
            </div>
          </div>
        </div>

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: breakpoints.md ? 56 : 36 }}>
          <div style={{
            display: 'inline-block',
            background: PRIMARY_PALE,
            color: PRIMARY,
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '5px 14px',
            borderRadius: 999,
            marginBottom: 16,
          }}>
            Core Modules
          </div>
          <Typography.Title
            level={2}
            style={{
              fontSize: breakpoints.md ? 36 : 26,
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.02em',
              marginBottom: 12,
            }}
          >
            The Foundation of Excellence
          </Typography.Title>
          <Typography.Paragraph
            style={{
              fontSize: 17,
              color: '#6B7280',
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Eight powerful engines orchestrating every aspect of your institution — from security to graduation.
          </Typography.Paragraph>
        </div>

        <Row gutter={gutter}>
          {modules.map((module) => (
            <Col key={module.key} xs={24} sm={12} lg={6} style={{ marginBottom: 0 }}>
              <ModuleCardItem module={module} />
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};
