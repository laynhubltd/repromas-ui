import { useToken } from "@/shared/hooks/useToken";
import type { SemesterType } from "@/shared/types/settings-types";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { AddSemesterTypeModal } from "../modals";

export interface SemesterTypesTabProps {
  data: SemesterType[];
  loading?: boolean;
  onAdd?: (values: { name: string }) => void | Promise<void>;
  onEdit?: (item: SemesterType) => void;
  onDelete?: (item: SemesterType) => void;
}

export function SemesterTypesTab({
  data,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
}: SemesterTypesTabProps) {
  const token = useToken();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async (values: { name: string }) => {
    if (!onAdd) return;
    setSubmitLoading(true);
    try {
      await onAdd(values);
      setModalOpen(false);
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns: ColumnsType<SemesterType> = [
    {
      title: "Semester type name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <Typography.Text
          strong={false}
          style={{
            color: token.colorText,
            fontSize: token.fontSize,
            fontWeight: 500,
          }}
        >
          {name}
        </Typography.Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space size={16}>
          {onEdit && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              style={{
                padding: 0,
                height: "auto",
                fontSize: token.fontSizeSM,
                fontWeight: 600,
                color: token.colorPrimary,
              }}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record)}
              style={{
                padding: 0,
                height: "auto",
                fontSize: token.fontSizeSM,
                fontWeight: 600,
              }}
            >
              Delete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={token.sizeLG} style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: token.sizeMD,
        }}
      >
        <div>
          <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
            Semester Types
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{
              fontSize: token.fontSizeSM,
              display: "block",
              marginTop: 2,
            }}
          >
            Definitions for valid academic term classifications
          </Typography.Text>
        </div>
        {onAdd && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Add Semester Type
          </Button>
        )}
      </div>

      <div
        style={{
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          overflow: "hidden",
        }}
      >
        <Table
          dataSource={data}
          columns={columns.map((col) => ({
            ...col,
            title:
              typeof col.title === "string" ? (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: token.colorTextSecondary,
                  }}
                >
                  {col.title}
                </span>
              ) : (
                col.title
              ),
          }))}
          rowKey="id"
          loading={loading}
          pagination={{
            position: ["bottomRight"],
            showTotal: (total) => (
              <span
                style={{
                  fontSize: token.fontSizeSM,
                  color: token.colorTextSecondary,
                }}
              >
                Showing {total} semester type{total !== 1 ? "s" : ""}
              </span>
            ),
            size: "small",
            showSizeChanger: false,
          }}
          locale={{ emptyText: "No semester types. Add one to get started." }}
          style={{ marginBottom: 0 }}
          styles={{
            header: {},
            body: {
              cell: { padding: `${token.paddingSM}px` },
            },
          }}
        />
      </div>

      <AddSemesterTypeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={submitLoading}
      />
    </Space>
  );
}
