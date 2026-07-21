import type { useBrandingConfig } from "../../hooks/useBrandingConfig";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Descriptions, Drawer, Spin, Typography } from "antd";
import dayjs from "dayjs";

type BrandingConfigController = ReturnType<typeof useBrandingConfig>;

export type SchoolInfoConfigDrawerProps = {
  open: boolean;
  onClose: () => void;
  state: BrandingConfigController["state"];
  actions: BrandingConfigController["actions"];
  flags: BrandingConfigController["flags"];
};

function displayValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed || "—";
}

function LinkValue({ url }: { url: string | null | undefined }) {
  const trimmed = url?.trim();
  if (!trimmed) {
    return <Typography.Text type="secondary">—</Typography.Text>;
  }

  return (
    <Typography.Link href={trimmed} target="_blank" rel="noopener noreferrer">
      {trimmed}
    </Typography.Link>
  );
}

export function SchoolInfoConfigDrawer({
  open,
  onClose,
  state,
  actions,
  flags,
}: SchoolInfoConfigDrawerProps) {
  const token = useToken();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={520}
      destroyOnHidden={false}
      title="School Information"
    >
      <ConditionalRenderer when={!!state.sectionError}>
        <ErrorAlert
          variant="section"
          error={state.sectionError}
          onRetry={actions.refetch}
        />
      </ConditionalRenderer>

      <Spin spinning={state.isLoading}>
        <ConditionalRenderer when={flags.isNotConfigured}>
          <Alert
            type="info"
            showIcon
            message="Branding is not configured yet."
            description="Use Edit to set up your school information and branding."
            style={{ marginBottom: 16 }}
          />
        </ConditionalRenderer>

        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="Institution Name">
            {displayValue(state.schoolName)}
          </Descriptions.Item>
          <Descriptions.Item label="Slug/Code">
            {displayValue(state.tenantName)}
          </Descriptions.Item>
          <Descriptions.Item label="Motto">
            {displayValue(state.motto)}
          </Descriptions.Item>
          <Descriptions.Item label="Tagline">
            {displayValue(state.tagline)}
          </Descriptions.Item>
          <Descriptions.Item label="Full Address">
            {displayValue(state.fullAddress)}
          </Descriptions.Item>
          <Descriptions.Item label="State">
            {state.resolvedState?.name ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Postal Code">
            {displayValue(state.postalCode)}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {displayValue(state.phone)}
          </Descriptions.Item>
          <Descriptions.Item label="Contact Email">
            {displayValue(state.email)}
          </Descriptions.Item>
          <Descriptions.Item label="Facebook">
            <LinkValue url={state.facebook} />
          </Descriptions.Item>
          <Descriptions.Item label="Twitter / X">
            <LinkValue url={state.twitter} />
          </Descriptions.Item>
          <Descriptions.Item label="LinkedIn">
            <LinkValue url={state.linkedin} />
          </Descriptions.Item>
          <Descriptions.Item label="YouTube">
            <LinkValue url={state.youtube} />
          </Descriptions.Item>
          <Descriptions.Item label="Primary Colour">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: `1px solid ${token.colorBorder}`,
                  background: state.primaryColor,
                  flexShrink: 0,
                }}
              />
              {displayValue(state.primaryColor)}
            </span>
          </Descriptions.Item>
          <ConditionalRenderer when={!!state.updatedAt}>
            <Descriptions.Item label="Last Updated">
              {dayjs(state.updatedAt).format("MMM D, YYYY h:mm A")}
            </Descriptions.Item>
          </ConditionalRenderer>
        </Descriptions>
      </Spin>
    </Drawer>
  );
}
