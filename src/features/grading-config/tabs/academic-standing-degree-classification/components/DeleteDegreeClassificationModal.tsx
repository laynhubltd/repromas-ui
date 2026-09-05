import { Modal, Typography, notification } from "antd";
import { useDeleteAcademicStandingDegreeClassificationMutation } from "../api/academicStandingDegreeClassificationApi";
import type { DegreeClassificationBand } from "../types/academic-standing-degree-classification";

export interface DeleteDegreeClassificationModalProps {
  open: boolean;
  target: DegreeClassificationBand | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteDegreeClassificationModal({
  open,
  target,
  onClose,
  onSuccess,
}: DeleteDegreeClassificationModalProps) {
  const [deleteClassification, { isLoading: isDeleting }] =
    useDeleteAcademicStandingDegreeClassificationMutation();

  const handleDelete = async () => {
    if (!target) return;
    try {
      await deleteClassification(target.id).unwrap();
      notification.success({
        message: "Degree Classification Deleted",
        description: `Successfully removed band "${target.name}".`,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      let message = "Failed to delete degree classification.";
      if (typeof err === "object" && err !== null && "data" in err) {
        const data = (err as { data?: { description?: string; message?: string } }).data;
        message = data?.description ?? data?.message ?? message;
      }
      notification.error({
        message: "Delete Failed",
        description: message,
      });
    }
  };

  return (
    <Modal
      open={open}
      title="Delete Degree Classification Band"
      okText="Delete Band"
      okButtonProps={{ danger: true }}
      confirmLoading={isDeleting}
      onCancel={onClose}
      onOk={handleDelete}
      destroyOnHidden
    >
      <Typography.Paragraph>
        Are you sure you want to delete the degree classification band{" "}
        <strong>"{target?.name}"</strong> ({target?.code})?
      </Typography.Paragraph>
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        Graduating students with CGPAs in this range will no longer be classified under this band during broadsheet evaluation.
      </Typography.Text>
    </Modal>
  );
}
