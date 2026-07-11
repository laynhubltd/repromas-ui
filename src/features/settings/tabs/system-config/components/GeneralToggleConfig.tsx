import { useToken } from "@/shared/hooks/useToken";
import { Flex, Switch, Typography } from "antd";
import { useState } from "react";

const GeneralToggleConfig = () => {
  const token = useToken();
  const [isChecked, setIsChecked] = useState(false);

  const onToggle = () => {
    setIsChecked(!isChecked);
  };

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <div
        style={{
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          marginBottom: 12,
          overflow: "hidden",
          background: token.colorBgContainer,
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            gap: 12,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          {/* Name */}
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <Typography.Text
              strong
              style={{ fontSize: token.fontSize, display: "block" }}
              ellipsis
            >
              Overwrite Carryover Marks
            </Typography.Text>
          </div>

          <Switch checked={isChecked} onChange={() => onToggle()} />
        </div>
      </div>
    </Flex>
  );
};

export default GeneralToggleConfig;
