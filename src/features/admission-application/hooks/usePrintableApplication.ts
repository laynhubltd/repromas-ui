import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { APPLICATION_PRINT_PAGE_STYLE } from "../constants/applicationPrintStyles";
import { ME_APPLICATION_UI_COPY } from "../constants/meAdmissionApplicationOptions";

export function usePrintableApplication() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: ME_APPLICATION_UI_COPY.pageTitle,
    pageStyle: APPLICATION_PRINT_PAGE_STYLE,
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
