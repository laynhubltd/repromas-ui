import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import { Button, Flex } from "antd";
import type { RefObject } from "react";
import { ACKNOWLEDGEMENT_SLIP_UI_COPY } from "../../constants/acknowledgementSlipOptions";
import type { AcknowledgementSlipModel } from "../../types/acknowledgement-slip";
import { SingleAcknowledgementSlip } from "./SingleAcknowledgementSlip";

type AcknowledgementSlipProps = {
  model: AcknowledgementSlipModel;
  contentRef?: RefObject<HTMLDivElement | null>;
  showToolbar?: boolean;
  onPrint?: () => void;
};

export function AcknowledgementSlip({
  model,
  contentRef,
  showToolbar = true,
  onPrint,
}: AcknowledgementSlipProps) {
  const token = useToken();
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        backgroundColor: showToolbar ? token.colorBgLayout : "transparent",
        padding: showToolbar
          ? `${token.paddingLG}px ${token.paddingSM}px`
          : 0,
        boxSizing: "border-box",
      }}
      className={showToolbar ? undefined : "application-print-source"}
    >
      {showToolbar && onPrint ? (
        <Flex
          justify="flex-end"
          style={{
            maxWidth: 820,
            margin: `0 auto ${token.marginMD}px auto`,
            width: "100%",
          }}
        >
          <Button type="primary" onClick={onPrint} block={isMobile}>
            {ACKNOWLEDGEMENT_SLIP_UI_COPY.printSlip}
          </Button>
        </Flex>
      ) : null}

      <div
        ref={contentRef}
        className="slip-batch-wrapper"
        style={showToolbar ? undefined : { width: "820px" }}
      >
        <SingleAcknowledgementSlip model={model} />
      </div>
    </div>
  );
}
