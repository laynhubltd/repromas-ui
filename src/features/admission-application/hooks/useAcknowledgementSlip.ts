import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ACKNOWLEDGEMENT_SLIP_PAGE_STYLE } from "../constants/acknowledgementSlipPrintStyles";
import { ACKNOWLEDGEMENT_SLIP_UI_COPY } from "../constants/acknowledgementSlipOptions";

export function useAcknowledgementSlip() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: ACKNOWLEDGEMENT_SLIP_UI_COPY.documentTitle,
    pageStyle: ACKNOWLEDGEMENT_SLIP_PAGE_STYLE,
  });

  return {
    state: {
      contentRef,
    },
    actions: {
      handlePrint,
    },
  };
}
