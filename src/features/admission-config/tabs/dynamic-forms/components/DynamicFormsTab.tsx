import { DashCard, ExplainerCallout, Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import type { FormTemplate } from "@/features/dynamic-form/types";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer, centeredBox } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  BuildOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, Col, Flex, Popconfirm, Row, Segmented, Space, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AssignmentPanel } from "./AssignmentPanel";
import { FormBuilderDrawer } from "./FormBuilderDrawer";
import { TemplateFormModal } from "./modals/TemplateFormModal";
import { useDynamicFormsTab } from "../hooks/useDynamicFormsTab";

function statusColor(status: FormTemplate["status"]): string {
  switch (status) {
    case "DRAFT":
      return "blue";
    case "PUBLISHED":
      return "green";
    case "ARCHIVED":
      return "default";
  }
}

export function DynamicFormsTab() {
  const token = useToken();
  const { state, actions, flags } = useDynamicFormsTab();
  const {
    view,
    templates,
    totalItems,
    isLoading,
    isError,
    sectionError,
    templateTarget,
    templateModalOpen,
    builderFormId,
  } = state;

  const cardState = isLoading ? "loading" : "default";
  const draftCount = templates.filter((t) => t.status === "DRAFT").length;
  const publishedCount = templates.filter((t) => t.status === "PUBLISHED").length;

  const columns: ColumnsType<FormTemplate> = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Code", dataIndex: "code", key: "code" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: FormTemplate["status"]) => (
        <Tag color={statusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Version",
      dataIndex: "version",
      key: "version",
      render: (v: number) => `v${v}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <PermissionGuard permission={Permission.DynamicFormsUpdate}>
            <Button
              type="link"
              size="small"
              icon={<BuildOutlined />}
              onClick={() => actions.handleOpenBuilder(record.id)}
            >
              Builder
            </Button>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => actions.handleOpenEdit(record)}
            >
              Edit
            </Button>
            {record.status === "DRAFT" && (
              <Popconfirm
                title="Publish this form?"
                description="Structure will be locked after publish."
                onConfirm={() => actions.handlePublish(record.id)}
              >
                <Button type="link" size="small" icon={<SendOutlined />}>
                  Publish
                </Button>
              </Popconfirm>
            )}
            {record.status !== "ARCHIVED" && (
              <Popconfirm
                title="Archive this form?"
                onConfirm={() => actions.handleArchive(record.id)}
              >
                <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                  Archive
                </Button>
              </Popconfirm>
            )}
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        title="Dynamic Forms"
        body="Build admission application forms with sections, fields, and cycle assignments. Published templates are used by candidates in the application wizard."
        dismissible
        collapsible
      />

      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <Segmented
          value={view}
          onChange={(v) => actions.setView(v as "templates" | "assignments")}
          options={[
            { label: "Templates", value: "templates" },
            { label: "Assignments", value: "assignments" },
          ]}
        />
        {view === "templates" && (
          <PermissionGuard permission={Permission.DynamicFormsCreate}>
            <Button type="primary" icon={<PlusOutlined />} onClick={actions.handleOpenCreate}>
              New template
            </Button>
          </PermissionGuard>
        )}
      </Flex>

      {view === "assignments" ? (
        <AssignmentPanel />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <DashCard title="Total templates" value={totalItems} state={cardState} />
            </Col>
            <Col xs={24} sm={8}>
              <DashCard title="Draft" value={draftCount} state={cardState} />
            </Col>
            <Col xs={24} sm={8}>
              <DashCard title="Published" value={publishedCount} state={cardState} />
            </Col>
          </Row>

          <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
            <ConditionalRenderer when={isError}>
              <ErrorAlert
                variant="section"
                error={sectionError ?? "Failed to load form templates"}
                onRetry={actions.refetch}
              />
            </ConditionalRenderer>

            <ConditionalRenderer
              when={!isError && !flags.hasData}
              wrapper={centeredBox({
                border: `1px dashed ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                background: token.colorBgContainer,
              })}
            >
              <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                No form templates yet. Create a draft template to get started.
              </Typography.Text>
              <PermissionGuard permission={Permission.DynamicFormsCreate}>
                <Button type="primary" icon={<PlusOutlined />} onClick={actions.handleOpenCreate}>
                  New template
                </Button>
              </PermissionGuard>
            </ConditionalRenderer>

            <ConditionalRenderer when={!isError && flags.hasData}>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={templates}
                pagination={false}
                size="md"
                density="comfortable"
              />
            </ConditionalRenderer>
          </DataLoader>
        </>
      )}

      <TemplateFormModal
        open={templateModalOpen}
        target={templateTarget}
        onClose={actions.handleCloseTemplateModal}
      />

      {builderFormId !== null && (
        <FormBuilderDrawer
          formId={builderFormId}
          onClose={actions.handleCloseBuilder}
        />
      )}
    </Flex>
  );
}
