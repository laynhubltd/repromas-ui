/** Print stylesheet injected by react-to-print — application summary document. */
export const APPLICATION_PRINT_PAGE_STYLE = `
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

    .app-print-batch-wrapper {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
    }

    .app-print-section-break {
      page-break-after: always !important;
      break-after: page !important;
    }

    .app-print-section-break:last-child {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }

    .app-print-container {
      box-shadow: none !important;
      border: none !important;
      margin: 0 !important;
      padding: 10mm !important;
      max-width: 100% !important;
      width: 100% !important;
      box-sizing: border-box !important;
      background: #ffffff !important;
      color: #111111 !important;
    }

    .app-print-container h1 {
      font-size: 16pt !important;
      margin: 0 0 2mm !important;
    }

    .app-print-container h2 {
      font-size: 12pt !important;
      margin: 0 0 3mm !important;
    }

    .app-print-container p,
    .app-print-container td,
    .app-print-container th {
      font-size: 10pt !important;
      line-height: 1.35 !important;
    }

    .app-print-header-logo img {
      width: 64px !important;
      height: 64px !important;
    }

    .app-print-profile-photo img {
      width: 60px !important;
      height: 80px !important;
      object-fit: cover !important;
    }

    .app-print-table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin-bottom: 4mm !important;
    }

    .app-print-table th,
    .app-print-table td {
      border: 1px solid #ccc !important;
      padding: 2mm !important;
      text-align: left !important;
    }

    .app-print-footer {
      margin-top: 6mm !important;
      font-size: 8pt !important;
    }
  }
`;
