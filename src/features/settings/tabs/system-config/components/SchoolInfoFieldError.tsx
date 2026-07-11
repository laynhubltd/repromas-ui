import { Typography } from "antd";

export function SchoolInfoFieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <Typography.Text
      type="danger"
      style={{ display: "block", marginTop: 4, fontSize: 12 }}
    >
      {message}
    </Typography.Text>
  );
}
