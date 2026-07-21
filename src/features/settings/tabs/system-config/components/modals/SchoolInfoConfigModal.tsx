import type { useBrandingConfig } from "../../hooks/useBrandingConfig";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SchoolInfoFieldError } from "../SchoolInfoFieldError";
import {
  Alert,
  Button,
  ColorPicker,
  Flex,
  Input,
  Modal,
  Select,
  Spin,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useCallback } from "react";

type BrandingConfigController = ReturnType<typeof useBrandingConfig>;

export type SchoolInfoConfigModalProps = {
  open: boolean;
  onClose: () => void;
  state: BrandingConfigController["state"];
  actions: BrandingConfigController["actions"];
  flags: BrandingConfigController["flags"];
};

export function SchoolInfoConfigModal({
  open,
  onClose,
  state,
  actions,
  flags,
}: SchoolInfoConfigModalProps) {
  const token = useToken();

  const handleSave = useCallback(async () => {
    const saved = await actions.handleSave();
    if (saved) {
      onClose();
    }
  }, [actions, onClose]);

  return (
    <Modal
      title="Edit School Information"
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      closable
      destroyOnHidden
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: 24 }}>
        <ConditionalRenderer when={!!state.sectionError}>
          <ErrorAlert
            variant="section"
            error={state.sectionError}
            onRetry={actions.refetch}
          />
        </ConditionalRenderer>

        <Spin spinning={state.isLoading}>
          <Flex vertical gap={16}>
            <ConditionalRenderer when={flags.isNotConfigured}>
              <Alert
                type="info"
                showIcon
                message="Branding is not configured yet."
                description="Complete the form below and save to create your brand config."
              />
            </ConditionalRenderer>

            <Flex vertical gap={12}>
              <div>
                <Typography.Text style={{ display: "block", marginBottom: 4 }}>
                  Institution Name
                </Typography.Text>
                <Input
                  value={state.schoolName ?? ""}
                  readOnly
                  placeholder="Available after brand config is saved"
                />
                <Typography.Text
                  type="secondary"
                  style={{
                    display: "block",
                    marginTop: 4,
                    fontSize: token.fontSizeSM,
                  }}
                >
                  Resolved from your tenant profile.
                </Typography.Text>
              </div>

              <div>
                <Typography.Text style={{ display: "block", marginBottom: 4 }}>
                  Tenant
                </Typography.Text>
                <Input
                  value={state.tenantName ?? ""}
                  readOnly
                  placeholder="Available after brand config is saved"
                />
              </div>

              <div>
                <Typography.Text style={{ display: "block", marginBottom: 4 }}>
                  Motto
                </Typography.Text>
                <Input
                  value={state.motto}
                  placeholder="e.g. Knowledge, Service, Integrity"
                  autoComplete="off"
                  onChange={(event) =>
                    actions.handleMottoChange(event.target.value)
                  }
                />
              </div>

              <div>
                <Typography.Text style={{ display: "block", marginBottom: 4 }}>
                  Tagline
                </Typography.Text>
                <Input
                  value={state.tagline}
                  placeholder="e.g. Excellence in Education"
                  autoComplete="off"
                  onChange={(event) =>
                    actions.handleTaglineChange(event.target.value)
                  }
                />
              </div>

              <div>
                <Typography.Text style={{ display: "block", marginBottom: 4 }}>
                  Full Address
                </Typography.Text>
                <Input.TextArea
                  value={state.fullAddress}
                  placeholder="e.g. PMB 0248, Babura, Jigawa State"
                  autoComplete="off"
                  rows={3}
                  onChange={(event) =>
                    actions.handleFullAddressChange(event.target.value)
                  }
                />
              </div>

              <Flex gap={12} wrap="wrap">
                <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                  <Typography.Text
                    style={{ display: "block", marginBottom: 4 }}
                  >
                    State
                  </Typography.Text>
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select state"
                    loading={state.isStatesLoading}
                    style={{ width: "100%" }}
                    value={state.stateId}
                    options={state.stateOptions}
                    onChange={(value) =>
                      actions.handleStateIdChange(value ?? null)
                    }
                  />
                  <SchoolInfoFieldError message={state.fieldErrors.stateId} />
                </div>

                <div style={{ flex: "1 1 140px", minWidth: 0 }}>
                  <Typography.Text
                    style={{ display: "block", marginBottom: 4 }}
                  >
                    Postal Code
                  </Typography.Text>
                  <Input
                    value={state.postalCode}
                    placeholder="e.g. 730101"
                    autoComplete="off"
                    onChange={(event) =>
                      actions.handlePostalCodeChange(event.target.value)
                    }
                  />
                </div>
              </Flex>

              <Flex gap={12} wrap="wrap">
                <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                  <Typography.Text
                    style={{ display: "block", marginBottom: 4 }}
                  >
                    Phone
                  </Typography.Text>
                  <Input
                    type="tel"
                    value={state.phone}
                    placeholder="e.g. +2348012345678"
                    autoComplete="off"
                    onChange={(event) =>
                      actions.handlePhoneChange(event.target.value)
                    }
                  />
                </div>

                <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                  <Typography.Text
                    style={{ display: "block", marginBottom: 4 }}
                  >
                    Contact Email
                  </Typography.Text>
                  <Input
                    type="email"
                    value={state.email}
                    placeholder="e.g. info@university.edu.ng"
                    autoComplete="off"
                    status={state.fieldErrors.email ? "error" : undefined}
                    onChange={(event) =>
                      actions.handleEmailChange(event.target.value)
                    }
                  />
                  <SchoolInfoFieldError message={state.fieldErrors.email} />
                </div>
              </Flex>

              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                Social links (full URLs required)
              </Typography.Text>

              <div>
                <Typography.Text style={{ display: "block", marginBottom: 4 }}>
                  Facebook
                </Typography.Text>
                <Input
                  value={state.facebook}
                  placeholder="https://facebook.com/..."
                  autoComplete="off"
                  status={state.fieldErrors.facebook ? "error" : undefined}
                  onChange={(event) =>
                    actions.handleFacebookChange(event.target.value)
                  }
                />
                <SchoolInfoFieldError message={state.fieldErrors.facebook} />
              </div>

              <div>
                <Typography.Text style={{ display: "block", marginBottom: 4 }}>
                  Twitter / X
                </Typography.Text>
                <Input
                  value={state.twitter}
                  placeholder="https://twitter.com/..."
                  autoComplete="off"
                  status={state.fieldErrors.twitter ? "error" : undefined}
                  onChange={(event) =>
                    actions.handleTwitterChange(event.target.value)
                  }
                />
                <SchoolInfoFieldError message={state.fieldErrors.twitter} />
              </div>

              <div>
                <Typography.Text style={{ display: "block", marginBottom: 4 }}>
                  LinkedIn
                </Typography.Text>
                <Input
                  value={state.linkedin}
                  placeholder="https://linkedin.com/..."
                  autoComplete="off"
                  status={state.fieldErrors.linkedin ? "error" : undefined}
                  onChange={(event) =>
                    actions.handleLinkedinChange(event.target.value)
                  }
                />
                <SchoolInfoFieldError message={state.fieldErrors.linkedin} />
              </div>

              <div>
                <Typography.Text style={{ display: "block", marginBottom: 4 }}>
                  YouTube
                </Typography.Text>
                <Input
                  value={state.youtube}
                  placeholder="https://youtube.com/..."
                  autoComplete="off"
                  status={state.fieldErrors.youtube ? "error" : undefined}
                  onChange={(event) =>
                    actions.handleYoutubeChange(event.target.value)
                  }
                />
                <SchoolInfoFieldError message={state.fieldErrors.youtube} />
              </div>

              <div>
                <Typography.Text style={{ display: "block", marginBottom: 4 }}>
                  Primary Colour
                </Typography.Text>
                <ColorPicker
                  format="hex"
                  value={state.primaryColor}
                  onChange={(color) =>
                    actions.handlePrimaryColorChange(color.toHexString())
                  }
                />
                <SchoolInfoFieldError
                  message={
                    state.fieldErrors.primaryColor ??
                    (flags.primaryColorRequired
                      ? "Primary colour is required."
                      : undefined)
                  }
                />
              </div>

              <ConditionalRenderer when={!!state.updatedAt}>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: token.fontSizeSM }}
                >
                  Last updated:{" "}
                  {dayjs(state.updatedAt).format("MMM D, YYYY h:mm A")}
                </Typography.Text>
              </ConditionalRenderer>
            </Flex>
          </Flex>
        </Spin>

        <Flex justify="flex-end" gap={8} style={{ marginTop: 24 }}>
          <Button onClick={onClose} disabled={state.isSaving}>
            Cancel
          </Button>
          <Button
            type="primary"
            loading={state.isSaving}
            disabled={state.isLoading}
            onClick={() => void handleSave()}
          >
            Save
          </Button>
        </Flex>
      </div>
    </Modal>
  );
}
