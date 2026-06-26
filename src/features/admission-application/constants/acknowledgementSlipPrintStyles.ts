/** A4 printable height: 297mm page − 20mm total @page margins */
const A4_PRINTABLE_HEIGHT = "277mm";

/** Print stylesheet injected by react-to-print — acknowledgement slip fills one A4 page. */
export const ACKNOWLEDGEMENT_SLIP_PAGE_STYLE = `
  @page {
    size: A4 portrait;
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
      background: #ffffff !important;
      color: #111111 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .application-print-source {
      position: static !important;
      width: auto !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      clip: auto !important;
      white-space: normal !important;
      border: 0 !important;
    }

    .slip-batch-wrapper {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
    }

    .slip-container {
      box-shadow: none !important;
      border: none !important;
      margin: 0 !important;
      padding: 10mm !important;
      max-width: 100% !important;
      width: 100% !important;
      min-height: ${A4_PRINTABLE_HEIGHT} !important;
      height: auto !important;
      display: flex !important;
      flex-direction: column !important;
      box-sizing: border-box !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      overflow: visible !important;
      background: #ffffff !important;
      color: #111111 !important;
    }

    .slip-content {
      position: relative !important;
      z-index: 2 !important;
      flex: 1 !important;
      display: flex !important;
      flex-direction: column !important;
      min-height: 100% !important;
      height: 100% !important;
    }

    .slip-body-section {
      flex: 1 !important;
      display: flex !important;
      flex-direction: column !important;
      min-height: 0 !important;
    }

    .slip-page-bottom {
      margin-top: auto !important;
      flex-shrink: 0 !important;
    }

    .slip-container h1 {
      font-size: 16pt !important;
      margin: 0 0 1.5mm !important;
      line-height: 1.2 !important;
    }

    .slip-container h2 {
      font-size: 13pt !important;
      margin: 0 0 2mm !important;
      line-height: 1.2 !important;
    }

    .slip-container p {
      font-size: 11pt !important;
      line-height: 1.38 !important;
      margin: 0 0 3mm 0 !important;
    }

    .slip-watermark {
      font-size: 42px !important;
      top: 52% !important;
    }

    .slip-header-logo img {
      width: 72px !important;
      height: 72px !important;
    }

    .slip-reference {
      font-size: 11pt !important;
      margin-bottom: 5mm !important;
    }

    .slip-applicant-block {
      margin-bottom: 5mm !important;
      font-size: 11.5pt !important;
    }

    .slip-profile-photo img {
      width: 60px !important;
      height: 80px !important;
      object-fit: cover !important;
    }

    .slip-details-list {
      font-size: 10.5pt !important;
      line-height: 1.4 !important;
      margin-bottom: 4mm !important;
    }

    .slip-next-steps {
      font-size: 10.5pt !important;
      line-height: 1.35 !important;
      margin-bottom: 4mm !important;
    }

    .slip-next-steps li {
      margin-bottom: 2mm !important;
    }

    .slip-qr-code svg {
      width: 80px !important;
      height: 80px !important;
    }

    .slip-footer {
      margin-top: 4mm !important;
      padding-top: 2mm !important;
      font-size: 8pt !important;
    }
  }
`;
