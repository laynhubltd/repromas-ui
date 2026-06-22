/** A4 printable height: 297mm page − 20mm total @page margins */
const A4_PRINTABLE_HEIGHT = "277mm";

/** Print stylesheet injected by react-to-print — each letter fills one A4 page. */
export const ADMISSION_LETTER_PAGE_STYLE = `
  @page {
    size: A4 portrait;
    /* Zero out all page margins to remove browser header (URL) and footer (date/page) */
    margin: 0;
  }

  @page :first {
    margin: 0;
  }

  @media print {
    html,
    body {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Wrapper around all 500 copies */
    .letter-batch-wrapper {
      margin: 0 !important;
      padding: 0 !important;
    }

    /* Each copy starts on a fresh page */
    .letter-page-break {
      page-break-after: always !important;
      break-after: page !important;
    }

    /* Last copy must NOT add a blank trailing page */
    .letter-page-break:last-child {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }

    .letter-container {
      box-shadow: none !important;
      border: none !important;
      margin: 0 !important;
      padding: 10mm !important;
      max-width: 100% !important;
      width: 100% !important;
      min-height: ${A4_PRINTABLE_HEIGHT} !important;
      height: ${A4_PRINTABLE_HEIGHT} !important;
      display: flex !important;
      flex-direction: column !important;
      box-sizing: border-box !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      overflow: hidden !important;
    }

    .letter-content {
      position: relative !important;
      z-index: 2 !important;
      flex: 1 !important;
      display: flex !important;
      flex-direction: column !important;
      min-height: 100% !important;
      height: 100% !important;
    }

    .letter-body-section {
      flex: 1 !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-evenly !important;
      min-height: 0 !important;
    }

    .letter-page-bottom {
      margin-top: auto !important;
      flex-shrink: 0 !important;
    }

    .letter-container h1 {
      font-size: 16pt !important;
      margin: 0 0 1.5mm !important;
      line-height: 1.2 !important;
    }

    .letter-container h2 {
      font-size: 13pt !important;
      margin: 0 0 2mm !important;
      line-height: 1.2 !important;
    }

    .letter-container h3 {
      font-size: 10.5pt !important;
      margin: 0 !important;
      line-height: 1.2 !important;
    }

    .letter-container p {
      font-size: 11pt !important;
      line-height: 1.38 !important;
      margin: 0 0 3mm 0 !important;
    }

    .letter-watermark {
      font-size: 52px !important;
      top: 52% !important;
    }

    .letter-header-logo svg {
      width: 72px !important;
      height: 72px !important;
    }

    .letter-admin-bar {
      font-size: 8pt !important;
      padding-bottom: 2.5mm !important;
      margin-bottom: 4mm !important;
    }

    .letter-ref-date {
      font-size: 11pt !important;
      margin-bottom: 5mm !important;
    }

    .letter-student-block {
      margin-bottom: 5mm !important;
      font-size: 11.5pt !important;
    }

    .letter-profile-photo svg {
      width: 60px !important;
      height: 60px !important;
    }

    .letter-subject-title {
      margin-bottom: 5mm !important;
    }

    .letter-subject-title h2 {
      font-size: 12pt !important;
    }

    .letter-body-intro {
      text-indent: 10mm !important;
      margin-bottom: 4mm !important;
    }

    .letter-terms-list {
      font-size: 11pt !important;
      line-height: 1.35 !important;
      margin-bottom: 0 !important;
    }

    .letter-terms-item {
      margin-bottom: 2.5mm !important;
    }

    .letter-notice {
      margin: 3mm 0 !important;
      font-size: 9.5pt !important;
      line-height: 1.3 !important;
    }

    .letter-closing {
      margin-bottom: 0 !important;
    }

    .letter-signature-block {
      margin-top: 4mm !important;
      margin-bottom: 3mm !important;
    }

    .letter-signature-greeting {
      margin-bottom: 4mm !important;
    }

    .letter-qr-code svg {
      width: 80px !important;
      height: 80px !important;
    }

    .letter-footer {
      margin-top: 4mm !important;
      padding-top: 2mm !important;
      font-size: 8pt !important;
    }

    .letter-footer-meta {
      font-size: 7.5pt !important;
      margin-bottom: 1.5mm !important;
    }
  }
`;
