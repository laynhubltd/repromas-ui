import { useToken } from "@/shared/hooks/useToken";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Alert } from "antd";
import { ACKNOWLEDGEMENT_SLIP_UI_COPY } from "../../constants/acknowledgementSlipOptions";

export function AcknowledgementConfirmationBanner() {
  const token = useToken();

  return (
    <Alert
      type="success"
      showIcon
      icon={<CheckCircleOutlined />}
      message={ACKNOWLEDGEMENT_SLIP_UI_COPY.confirmationTitle}
      description={ACKNOWLEDGEMENT_SLIP_UI_COPY.confirmationBody}
      style={{
        borderRadius: token.borderRadius,
        marginBottom: token.marginMD,
      }}
    />
  );
}
