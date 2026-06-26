import { useIsMobile } from "@/hooks/useBreakpoint";
import { ME_APPLICATION_UI_COPY } from "../../constants/meAdmissionApplicationOptions";
import { Button, Flex } from "antd";

type ApplicationDocumentActionsProps = {
  onPrintAcknowledgementSlip: () => void;
  onPrintApplication: () => void;
};

export function ApplicationDocumentActions({
  onPrintAcknowledgementSlip,
  onPrintApplication,
}: ApplicationDocumentActionsProps) {
  const isMobile = useIsMobile();

  return (
    <Flex justify="flex-end" gap={8} wrap="wrap">
      <Button onClick={onPrintAcknowledgementSlip} block={isMobile}>
        {ME_APPLICATION_UI_COPY.printAcknowledgementSlip}
      </Button>
      <Button type="primary" onClick={onPrintApplication} block={isMobile}>
        {ME_APPLICATION_UI_COPY.printApplication}
      </Button>
    </Flex>
  );
}
