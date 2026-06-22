import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ADMISSION_LETTER_PAGE_STYLE } from "../constants/admissionLetterPrintStyles";

export function useAdmissionLetter() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Admission Letter",
    pageStyle: ADMISSION_LETTER_PAGE_STYLE,
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
