import { useToken } from "@/shared/hooks/useToken";
import { Collapse, Modal, Statistic, Typography } from "antd";
import type { ImportDefaultsResult } from "../../types/prior-qualification-type";

type ImportDefaultsSummaryModalProps = {
  open: boolean;
  result: ImportDefaultsResult | null;
  onClose: () => void;
};

export function ImportDefaultsSummaryModal({
  open,
  result,
  onClose,
}: ImportDefaultsSummaryModalProps) {
  const token = useToken();

  if (!result) return null;

  return (
    <Modal
      open={open}
      title="Import defaults summary"
      onCancel={onClose}
      onOk={onClose}
      okText="Done"
      cancelButtonProps={{ style: { display: "none" } }}
      destroyOnHidden
    >
      <div style={{ display: "flex", gap: token.marginLG, marginBottom: token.marginMD }}>
        <Statistic title="Created" value={result.created.length} />
        <Statistic title="Skipped" value={result.skipped.length} />
        <Statistic title="Failed" value={result.failed.length} />
      </div>

      {result.created.length > 0 && (
        <Typography.Paragraph type="secondary">
          Created: {result.created.join(", ")}
        </Typography.Paragraph>
      )}

      {result.skipped.length > 0 && (
        <Typography.Paragraph type="secondary">
          Skipped (already exist): {result.skipped.join(", ")}
        </Typography.Paragraph>
      )}

      {result.failed.length > 0 && (
        <Collapse
          items={[
            {
              key: "failed",
              label: `${result.failed.length} failed import(s)`,
              children: (
                <ul style={{ margin: 0, paddingLeft: token.paddingLG }}>
                  {result.failed.map((row) => (
                    <li key={row.code}>
                      <Typography.Text code>{row.code}</Typography.Text>: {row.message}
                    </li>
                  ))}
                </ul>
              ),
            },
          ]}
        />
      )}
    </Modal>
  );
}
