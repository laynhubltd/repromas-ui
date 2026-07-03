import {
  MATRIC_TOKEN_DEFINITIONS,
  MATRIC_TOKEN_GROUP_LABELS,
  SEQUENCE_WIDTH_PRESETS,
  type MatricTokenGroupKey,
} from "@/shared/constants/matricNumberFormatOptions";
import { useToken } from "@/shared/hooks/useToken";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Collapse, Flex, Input, Tooltip, Typography } from "antd";
import type { CSSProperties } from "react";
import { useState } from "react";

type TemplateTokenPaletteProps = {
  onInsertToken: (token: string) => void;
  onInsertLiteral: (literal: string) => void;
  disabled?: boolean;
};

const GROUP_ORDER: MatricTokenGroupKey[] = [
  "institution",
  "hierarchy",
  "session",
  "sequence",
];

type TokenChipProps = {
  label: string;
  tooltip: string;
  disabled?: boolean;
  onClick: () => void;
};

function TokenChip({ label, tooltip, disabled = false, onClick }: TokenChipProps) {
  const antToken = useToken();
  const [hovered, setHovered] = useState(false);

  const chipStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "8px 12px",
    margin: 0,
    border: `1px solid ${hovered && !disabled ? antToken.colorPrimaryBorder : antToken.colorBorder}`,
    borderRadius: antToken.borderRadius,
    background: hovered && !disabled ? antToken.colorBgContainer : antToken.colorBgLayout,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    transition: "border-color 0.15s ease, background 0.15s ease",
    textAlign: "left",
  };

  return (
    <Tooltip title={tooltip}>
      <div style={{ width: "100%" }}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onClick()}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={chipStyle}
        >
          <Typography.Text
            style={{
              fontSize: antToken.fontSizeSM,
              fontWeight: 500,
              color: antToken.colorText,
              lineHeight: 1.3,
            }}
          >
            {label}
          </Typography.Text>
        </button>
      </div>
    </Tooltip>
  );
}

export function TemplateTokenPalette({
  onInsertToken,
  onInsertLiteral,
  disabled = false,
}: TemplateTokenPaletteProps) {
  const token = useToken();
  const [literalInput, setLiteralInput] = useState("");

  const handleAddLiteral = () => {
    if (!literalInput.trim()) return;
    onInsertLiteral(literalInput);
    setLiteralInput("");
  };

  const collapseItems = GROUP_ORDER.map((groupKey) => ({
    key: groupKey,
    label: (
      <Typography.Text
        strong
        style={{
          fontSize: token.fontSizeSM,
          color: token.colorTextSecondary,
          letterSpacing: "0.02em",
        }}
      >
        {MATRIC_TOKEN_GROUP_LABELS[groupKey]}
      </Typography.Text>
    ),
    children: (
      <Flex vertical gap={8} style={{ width: "100%" }}>
        {MATRIC_TOKEN_DEFINITIONS.filter((d) => d.group === groupKey).map((def) => (
          <TokenChip
            key={def.token}
            label={def.label}
            tooltip={`${def.tooltip} (inserts ${def.token})`}
            disabled={disabled}
            onClick={() => onInsertToken(def.token)}
          />
        ))}
        {groupKey === "sequence" &&
          SEQUENCE_WIDTH_PRESETS.map((preset) => (
            <TokenChip
              key={preset.token}
              label={preset.label}
              tooltip={`Sequence with fixed width (inserts ${preset.token})`}
              disabled={disabled}
              onClick={() => onInsertToken(preset.token)}
            />
          ))}
      </Flex>
    ),
  }));

  const separatorPresets = [
    { key: "slash", label: "/", value: "/" },
    { key: "dash", label: "-", value: "-" },
    { key: "reg", label: "REG", value: "REG" },
    { key: "reg-slash", label: "/REG/", value: "/REG/" },
  ];

  return (
    <Flex
      vertical
      gap={12}
      style={{
        padding: token.paddingSM,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
      }}
    >
      <div>
        <Typography.Text strong style={{ display: "block", fontSize: token.fontSizeSM }}>
          Token palette
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          Click a token to append it to the template.
        </Typography.Text>
      </div>

      <Collapse
        items={collapseItems}
        defaultActiveKey={GROUP_ORDER}
        size="small"
        bordered={false}
        style={{
          background: "transparent",
        }}
        styles={{
          header: {
            padding: `${token.paddingSM}px 0`,
            background: "transparent",
          },
          body: {
            padding: `0 0 ${token.paddingSM}px`,
            background: "transparent",
          },
        }}
      />

      <Flex
        vertical
        gap={8}
        style={{
          paddingTop: token.paddingSM,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
          Separators
        </Typography.Text>
        <Flex vertical gap={8} style={{ width: "100%" }}>
          {separatorPresets.map((preset) => (
            <Button
              key={preset.key}
              size="small"
              type="default"
              block
              disabled={disabled}
              onClick={() => onInsertLiteral(preset.value)}
              style={{
                fontFamily: "monospace",
                color: token.colorTextSecondary,
                borderColor: token.colorBorder,
                background: token.colorBgLayout,
                height: 36,
              }}
            >
              {preset.label}
            </Button>
          ))}
        </Flex>
        <Flex vertical gap={8} style={{ width: "100%" }}>
          <Input
            placeholder="Custom separator"
            value={literalInput}
            disabled={disabled}
            onChange={(e) => setLiteralInput(e.target.value)}
            onPressEnter={handleAddLiteral}
            style={{ width: "100%", fontFamily: "monospace" }}
          />
          <Button
            icon={<PlusOutlined />}
            block
            disabled={disabled || !literalInput.trim()}
            onClick={handleAddLiteral}
          >
            Add
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
