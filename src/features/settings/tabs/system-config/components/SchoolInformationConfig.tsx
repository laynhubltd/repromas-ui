import { EditOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";
import { useCallback, useMemo, useState } from "react";
import type { useBrandingConfig } from "../hooks/useBrandingConfig";
import type { ConfigItemAction } from "../types/config-item";
import { ConfigItem } from "./ConfigItem";
import { SchoolInfoConfigDrawer } from "./drawers/SchoolInfoConfigDrawer";
import { SchoolInfoConfigModal } from "./modals/SchoolInfoConfigModal";
import { UploadSchoolLogoModal } from "./modals/UploadSchoolLogoModal";

type SchoolInformationConfigProps = ReturnType<typeof useBrandingConfig>;

function useSchoolInformationConfig({
  state,
  actions,
  flags,
}: SchoolInformationConfigProps) {
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

  const summaryLabel = state.schoolName ?? state.tenantName ?? null;

  const menuItems = useMemo<ConfigItemAction[]>(
    () => [
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
    ],
    [handleOpenEdit, handleOpenView, handleOpenUploadLogo],
  );

  return {
    state: {
      summaryLabel,
      editOpen,
      viewOpen,
      uploadLogoOpen,
    },
    actions: {
      handleOpenEdit,
      handleCloseEdit,
      handleOpenView,
      handleCloseView,
      handleOpenUploadLogo,
      handleCloseUploadLogo,
    },
    flags: {
      isNotConfigured: flags.isNotConfigured,
    },
    menuItems,
    branding: {
      state,
      actions,
      flags,
    },
  };
}

const SchoolInformationConfig = (props: SchoolInformationConfigProps) => {
  const { state, actions, flags, menuItems, branding } =
    useSchoolInformationConfig(props);

  return (
    <>
      <ConfigItem
        type="JSON_OBJECT"
        label="School Information"
        summary={state.summaryLabel}
        isNotConfigured={flags.isNotConfigured}
        actions={menuItems}
      />

      <SchoolInfoConfigModal
        open={state.editOpen}
        onClose={actions.handleCloseEdit}
        state={branding.state}
        actions={branding.actions}
        flags={branding.flags}
      />

      <SchoolInfoConfigDrawer
        open={state.viewOpen}
        onClose={actions.handleCloseView}
        state={branding.state}
        actions={branding.actions}
        flags={branding.flags}
      />

      <UploadSchoolLogoModal
        open={state.uploadLogoOpen}
        onClose={actions.handleCloseUploadLogo}
        flags={branding.flags}
        actions={branding.actions}
      />
    </>
  );
};

export default SchoolInformationConfig;
