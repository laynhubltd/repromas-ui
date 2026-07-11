import type { useBrandingConfig } from "../hooks/useBrandingConfig";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { EditOutlined, EyeOutlined, MoreOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Dropdown, Typography } from "antd";
import { useCallback, useState } from "react";
import { SchoolInfoConfigDrawer } from "./drawers/SchoolInfoConfigDrawer";
import { SchoolInfoConfigModal } from "./modals/SchoolInfoConfigModal";
import { UploadSchoolLogoModal } from "./modals/UploadSchoolLogoModal";

type SchoolInformationConfigProps = ReturnType<typeof useBrandingConfig>;

const SchoolInformationConfig = ({
  state,
  actions,
  flags,
}: SchoolInformationConfigProps) => {
  const token = useToken();
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [uploadLogoOpen, setUploadLogoOpen] = useState(false);

  const handleOpenEdit = useCallback(() => {
    setEditOpen(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditOpen(false);
  }, []);

  const handleOpenView = useCallback(() => {
    setViewOpen(true);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewOpen(false);
  }, []);

  const handleOpenUploadLogo = useCallback(() => {
    setUploadLogoOpen(true);
  }, []);

  const handleCloseUploadLogo = useCallback(() => {
    setUploadLogoOpen(false);
  }, []);

  const menuItems = [
    {
      key: "edit",
      label: "Edit",
      icon: <EditOutlined />,
      onClick: handleOpenEdit,
    },
    {
      key: "view",
      label: "View",
      icon: <EyeOutlined />,
      onClick: handleOpenView,
    },
    {
      key: "upload-logo",
      label: "Upload Logo",
      icon: <UploadOutlined />,
      onClick: handleOpenUploadLogo,
    },
  ];

  const summaryLabel = state.schoolName ?? state.tenantName ?? null;

  return (
    <>
      <div
        style={{
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          marginBottom: 12,
          overflow: "hidden",
          background: token.colorBgContainer,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            gap: 12,
          }}
        >
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <Typography.Text
              strong
              style={{ fontSize: token.fontSize, display: "block" }}
              ellipsis
            >
              School Information
            </Typography.Text>
            <ConditionalRenderer when={!!summaryLabel}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM, display: "block" }}
                ellipsis
              >
                {summaryLabel}
              </Typography.Text>
            </ConditionalRenderer>
            <ConditionalRenderer when={flags.isNotConfigured && !summaryLabel}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM, display: "block" }}
              >
                Not configured
              </Typography.Text>
            </ConditionalRenderer>
          </div>

          <div style={{ flex: "0 0 auto" }}>
            <Dropdown
              menu={{ items: menuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined style={{ fontSize: 16 }} />}
                style={{ color: token.colorTextTertiary }}
              />
            </Dropdown>
          </div>
        </div>
      </div>

      <SchoolInfoConfigModal
        open={editOpen}
        onClose={handleCloseEdit}
        state={state}
        actions={actions}
        flags={flags}
      />

      <SchoolInfoConfigDrawer
        open={viewOpen}
        onClose={handleCloseView}
        state={state}
        actions={actions}
        flags={flags}
      />

      <UploadSchoolLogoModal
        open={uploadLogoOpen}
        onClose={handleCloseUploadLogo}
        flags={flags}
        actions={actions}
      />
    </>
  );
};

export default SchoolInformationConfig;
