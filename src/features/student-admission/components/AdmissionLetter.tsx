import futbLogo from "@/assets/futb_logo.png";
import futbRegistrarSignature from "@/assets/futb_registrat_signature.jpeg";
import { useAppSelector } from "@/app/hooks";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import useAuthState from "@/features/auth/use-auth-state";
import { Button, Flex } from "antd";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ADMISSION_LETTER_PAGE_STYLE } from "../constants/admissionLetterPrintStyles";
import { STUDENT_ADMISSION_UI_COPY } from "../constants/studentAdmissionOptions";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Formats a sequence number as a zero-padded 4-digit reg number string.
 *  e.g. 1  → "FUTB/REM/26/0001"
 *       42 → "FUTB/REM/26/0042"
 *       500 → "FUTB/REM/26/0500"
 */
function buildRegNumber(n: number): string {
  return `FUTB/REM/25/${String(n).padStart(4, "0")}`;
}

const TOTAL_COPIES = 1;

// ─── Single letter card ──────────────────────────────────────────────────────

type SingleAdmissionLetterProps = {
  regNumber: string;
  logoUrl: string | undefined;
  schoolName: string | undefined;
  studentName: string | undefined;
};

function SingleAdmissionLetter({
  regNumber,
  logoUrl,
  schoolName,
  studentName,
}: SingleAdmissionLetterProps) {
  // Resolved logo — fall back to bundled FUTB asset when Redux has no tenant logo
  const resolvedLogo = logoUrl ?? futbLogo;
  return (
    <div
      className="letter-container"
      style={{
        backgroundColor: "#ffffff",
        maxWidth: "820px",
        margin: "0 auto",
        padding: "50px 60px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #e2e8f0",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Diagonal Watermark Background */}
      <div
        className="letter-watermark"
        style={{
          position: "absolute",
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-30deg)",
          fontSize: "76px",
          color: "rgba(220, 53, 69, 0.11)",
          fontFamily: "Arial, sans-serif",
          fontWeight: 900,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 1,
          textTransform: "capitalize",
          letterSpacing: "2px",
        }}
      >
        Provisional Admission Letter
      </div>

      {/* Letter Content Wrapper */}
      <div className="letter-content" style={{ position: "relative", zIndex: 2 }}>
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "5px",
          }}
        >
          {/* University Logo */}
          <div className="letter-header-logo" style={{ flex: "0 0 90px" }}>
            <img
              src={resolvedLogo}
              alt={schoolName ?? "University Logo"}
              width={90}
              height={90}
              style={{ display: "block", objectFit: "contain" }}
            />
          </div>

          {/* Central University Title */}
          <div
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: "Arial, sans-serif",
              padding: "0 10px",
            }}
          >
            <h1
              style={{
                fontSize: "21px",
                margin: "0 0 3px 0",
                fontWeight: 900,
                color: "#0c3c7c",
                letterSpacing: "0.3px",
              }}
            >
              {schoolName?.toUpperCase() ?? "FEDERAL UNIVERSITY OF TECHNOLOGY"}
            </h1>
            <h2
              style={{
                fontSize: "18px",
                margin: "0 0 8px 0",
                fontWeight: "bold",
                color: "#0c3c7c",
                letterSpacing: "0.3px",
              }}
            >
              BABURA, JIGAWA STATE, NIGERIA
            </h2>
            <h3
              style={{
                fontSize: "13.5px",
                margin: 0,
                fontWeight: "bold",
                color: "#111",
                letterSpacing: "0.5px",
              }}
            >
              OFFICE OF THE REGISTRAR
            </h3>
          </div>

          {/* Address/P.M.B Box */}
          <div
            style={{
              flex: "0 0 140px",
              textAlign: "right",
              fontFamily: "Arial, sans-serif",
              fontSize: "11px",
              fontWeight: "bold",
              lineHeight: 1.3,
              color: "#111",
            }}
          >
            P. M. B. 2022,
            <br />
            Babura,
            <br />
            Jigawa State, Nigeria
          </div>
        </div>

        {/* Administration Officers Info */}
        <div
          className="letter-admin-bar"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            borderBottom: "2.5px solid #000000",
            paddingBottom: "5px",
            marginBottom: "20px",
            lineHeight: 1.4,
            color: "#111",
          }}
        >
          <span style={{ fontWeight: "bold" }}>VICE-CHANCELLOR:</span> Prof.
          Sabo Ibrahim B/Kudu,{" "}
          <span style={{ fontSize: "8px" }}>
            B.Eng. (BUK), M.Eng. (UNIBEN), PhD (BUK), PCAP (France, MNSE,
            MNIEEE, RE (COREN)
          </span>
          <br />
          <span style={{ fontWeight: "bold" }}>REGISTRAR:</span> Fatima Binta
          Mohammed,{" "}
          <span style={{ fontSize: "8px" }}>
            mni, MFIICAN, MINIM, BA,(Ed), MPPA (BUK)
          </span>
        </div>

        {/* Reference Details & Date */}
        <div
          className="letter-ref-date"
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
            fontSize: "14px",
            marginBottom: "25px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div>FUTB/R/AS/1/VOL.1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
          <div>Monday 8th June, 2026</div>
        </div>

        {/* Student Info & Reg Number */}
        <div
          className="letter-student-block"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              fontFamily: '"Times New Roman", Times, serif',
            }}
          >
            {/* Name field — shows student name from auth, falls back to underline */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
                marginTop: "20px",
              }}
            >
              {studentName ? (
                <div
                  style={{
                    fontWeight: "bold",
                    fontStyle: "italic",
                    textTransform: "uppercase",
                    fontSize: "15px",
                    fontFamily: '"Times New Roman", Times, serif',
                    minWidth: "250px",
                  }}
                >
                  {studentName}
                </div>
              ) : (
                <div
                  style={{
                    flex: 1,
                    borderBottom: "1.5px solid #111",
                    minWidth: "250px",
                  }}
                />
              )}
            </div>

            <div style={{ fontWeight: "bold", fontStyle: "italic" }}>
              ({regNumber}),
            </div>
          </div>

          {/* Profile Photo Placeholder — invisible, space reserved for physical photo */}
          <div className="letter-profile-photo" style={{ marginTop: "-10px", visibility: "hidden" }}>
            <svg width="72" height="72" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="#e3f2fd"
                stroke="#29b6f6"
                strokeWidth="2"
              />
              <path d="M 50,15 L 75,25 L 50,35 L 25,25 Z" fill="#0288d1" />
              <path
                d="M 37,29.5 L 37,42 Q 50,48 63,42 L 63,29.5"
                fill="#0288d1"
              />
              <path
                d="M 50,25 L 70,33 L 70,45"
                fill="none"
                stroke="#fbc02d"
                strokeWidth="1.5"
              />
              <circle cx="70" cy="46" r="1.5" fill="#fbc02d" />
              <circle cx="50" cy="56" r="11" fill="#0288d1" />
              <path d="M 28,82 Q 28,68 50,68 Q 72,68 72,82" fill="#0288d1" />
            </svg>
          </div>
        </div>

        {/* Subject / Title */}
        <div
          className="letter-subject-title"
          style={{ textAlign: "center", marginBottom: "25px" }}
        >
          <h2
            style={{
              fontSize: "16.5px",
              fontWeight: "bold",
              textTransform: "uppercase",
              margin: 0,
              fontFamily: "Arial, sans-serif",
              letterSpacing: "0.3px",
            }}
          >
            OFFER OF PROVISIONAL ADMISSION INTO REMEDIAL PROGRAMME
          </h2>
        </div>

        {/* Letter Body Paragraph 1 */}
        <p
          className="letter-body-intro"
          style={{
            textIndent: "40px",
            textAlign: "justify",
            margin: "0 0 15px 0",
            fontSize: "14.5px",
            fontFamily: '"Times New Roman", Georgia, serif',
            lineHeight: 1.5,
          }}
        >
          I am pleased to inform you that the University has offered you
          provisional admission into the <strong>Remedial Programme</strong>{" "}
          in the <strong>School of Remedial Studies</strong> for the{" "}
          <strong>2025/2026 Academic Session</strong>, with a programme
          duration of <strong>one year</strong>.
        </p>

        {/* Key Terms List */}
        <div className="letter-body-section">
          <div
            className="letter-terms-list"
            style={{
              fontSize: "14.5px",
              fontFamily: '"Times New Roman", Georgia, serif',
              lineHeight: 1.5,
              textAlign: "justify",
              marginBottom: "20px",
            }}
          >
            {[
              <>
                The confirmation of this letter is subject to obtaining the{" "}
                <strong>minimum entry qualification</strong> for the programme
                to which you have been offered admission
              </>,
              <>
                You are expected to submit a <strong>Medical Report</strong>{" "}
                from the University Clinic at the point of registration
              </>,
              <>
                At the time of registration, you will be required to present
                the original copies of your certificates or other acceptable
                evidence of the qualifications on which this offer of admission
                was based
              </>,
              <>
                If it is discovered at any time that you do not possess any of
                the qualifications which you claimed to have obtained, you will
                be required to withdraw from the University
              </>,
              <>The schedule of registration fees is attached for your guidance</>,
              <>
                Registration starts on{" "}
                <strong>
                  Monday 15<sup>th</sup> June, 2026
                </strong>{" "}
                and will end on{" "}
                <strong>
                  Friday 31<sup>st</sup> July, 2026
                </strong>
              </>,
            ].map((text, i) => (
              <div
                key={i}
                className="letter-terms-item"
                style={{
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ flex: "0 0 25px", fontWeight: "normal" }}>
                  {i + 2}.
                </span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <p
            style={{
              textAlign: "justify",
              margin: "0 0 15px 0",
              fontSize: "14.5px",
            }}
          >
            Please visit our website{" "}
            <span
              style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}
            >
              futb.edu.ng
            </span>{" "}
            for registration details
          </p>

          <p
            className="letter-notice"
            style={{
              textAlign: "left",
              margin: "22px 0",
              fontSize: "14px",
              fontWeight: "bold",
              textTransform: "uppercase",
              fontFamily: "Arial, sans-serif",
              letterSpacing: "0.3px",
            }}
          >
            REQUEST FOR CHANGE OF NAME WILL NOT BE ENTERTAINED AFTER COMPLETION
            OF REGISTRATION
          </p>

          <p
            className="letter-closing"
            style={{
              textAlign: "justify",
              margin: "0 0 35px 0",
              fontSize: "14.5px",
            }}
          >
            Accept my congratulations on your admission.
          </p>
        </div>

        <div className="letter-page-bottom">
          {/* Signature & QR Section */}
          <div
            className="letter-signature-block"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: "25px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: "14.5px",
                maxWidth: "460px",
                marginLeft: "auto",
                marginRight: "20px",
              }}
            >
              <div
                className="letter-signature-greeting"
                style={{ marginBottom: "8px" }}
              >
                Yours faithfully
              </div>

              {/* Registrar signature */}
              <img
                src={futbRegistrarSignature}
                alt="Registrar signature"
                style={{
                  display: "block",
                  height: "60px",
                  width: "auto",
                  margin: "0 auto 4px auto",
                  objectFit: "contain",
                }}
              />
              <div
                style={{
                  fontWeight: "bold",
                  lineHeight: 1.35,
                  fontFamily: "Arial, sans-serif",
                }}
              >
                Fatima Binta Mohammed{" "}
                <span style={{ fontWeight: "normal", fontSize: "11.5px" }}>
                  mni, MFIICAN, MINIM, BA,(Ed), MPPA(BUK)
                </span>
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  fontFamily: "Arial, sans-serif",
                  marginTop: "4px",
                  fontSize: "15px",
                }}
              >
                Registrar
              </div>
            </div>

            {/* QR Code — encodes the admission number for scanning */}
            <div className="letter-qr-code" style={{ flex: "0 0 105px" }}>
              <QRCodeSVG
                value={regNumber}
                size={105}
                level="M"
                includeMargin={false}
                style={{ display: "block" }}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className="letter-footer"
            style={{
              borderTop: "1px solid #111111",
              marginTop: "45px",
              paddingTop: "6px",
              fontFamily: "Arial, sans-serif",
              fontSize: "10px",
              color: "#111111",
            }}
          >
            <div
              className="letter-footer-meta"
              style={{
                textAlign: "center",
                fontStyle: "italic",
                marginBottom: "6px",
                fontSize: "9.5px",
              }}
            >
              First generated on Monday, 08 June 2026 @ 02:40:37. Last
              generated on Monday, 08 June 2026 @ 02:49:24. Generated 7
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
              }}
            >
              <div>
                Website:{" "}
                <span style={{ fontWeight: "normal" }}>futb.edu.ng</span>
              </div>
              <div>
                Email:{" "}
                <span style={{ fontWeight: "normal" }}>
                  registrar@futb.edu.ng
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function AdmissionLetter() {
  const token = useToken();
  const isMobile = useIsMobile();
  const batchRef = useRef<HTMLDivElement>(null);

  // ─── Tenant branding from Redux ────────────────────────────────────────────
  const logoUrl = useAppSelector((state) => state.theme.logoUrl);
  const schoolName = useAppSelector((state) => state.theme.schoolName);

  // ─── Student name from auth entity ─────────────────────────────────────────
  const { entity } = useAuthState();
  // entity is a discriminated union — narrow to shapes that have firstName/lastName
  const studentName =
    entity != null && "firstName" in entity && "lastName" in entity
      ? `${entity.firstName} ${entity.lastName}`.trim()
      : undefined;

  const handlePrintAll = useReactToPrint({
    contentRef: batchRef,
    documentTitle: "Admission Letters — FUTB/REM/26 (500 copies)",
    pageStyle: ADMISSION_LETTER_PAGE_STYLE,
  });

  // Generate reg numbers 1–500
  const regNumbers = Array.from({ length: TOTAL_COPIES }, (_, i) =>
    buildRegNumber(i + 1),
  );

  return (
    <div
      style={{
        backgroundColor: token.colorBgLayout,
        padding: `${token.paddingLG}px ${token.paddingSM}px`,
        boxSizing: "border-box",
      }}
    >
      {/* Toolbar */}
      <Flex
        justify="flex-end"
        style={{
          maxWidth: 820,
          margin: `0 auto ${token.marginMD}px auto`,
          width: "100%",
        }}
      >
        <Button type="primary" onClick={handlePrintAll} block={isMobile}>
          {STUDENT_ADMISSION_UI_COPY.printLetter} ({TOTAL_COPIES} copies)
        </Button>
      </Flex>

      {/* Batch wrapper — all 500 letters, each separated by a page break */}
      <div ref={batchRef} className="letter-batch-wrapper">
        {regNumbers.map((regNumber, idx) => (
          <div
            key={regNumber}
            className={
              idx < TOTAL_COPIES - 1 ? "letter-page-break" : undefined
            }
            style={{ marginBottom: idx < TOTAL_COPIES - 1 ? "40px" : 0 }}
          >
            <SingleAdmissionLetter
                regNumber={regNumber}
                logoUrl={logoUrl}
                schoolName={schoolName}
                studentName={studentName}
              />
          </div>
        ))}
      </div>
    </div>
  );
}
