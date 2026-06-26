import futbLogo from "@/assets/futb_logo.png";
import type { AcknowledgementSlipModel } from "../../types/acknowledgement-slip";
import {
  ACKNOWLEDGEMENT_NEXT_STEPS,
  ACKNOWLEDGEMENT_SLIP_UI_COPY,
} from "../../constants/acknowledgementSlipOptions";
import { formatApplicationDate } from "../../utils/applicationDossierDisplay";
import { QRCodeSVG } from "qrcode.react";

type SingleAcknowledgementSlipProps = {
  model: AcknowledgementSlipModel;
};

function formatDisplayValue(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

export function SingleAcknowledgementSlip({ model }: SingleAcknowledgementSlipProps) {
  const resolvedLogo = model.logoUrl ?? futbLogo;

  return (
    <div
      className="slip-container"
      style={{
        backgroundColor: "#ffffff",
        maxWidth: "820px",
        margin: "0 auto",
        padding: "40px 50px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #e2e8f0",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        className="slip-watermark"
        style={{
          position: "absolute",
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-30deg)",
          fontSize: "52px",
          color: "rgba(12, 60, 124, 0.08)",
          fontWeight: 900,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 1,
          letterSpacing: "2px",
        }}
      >
        {ACKNOWLEDGEMENT_SLIP_UI_COPY.headline}
      </div>

      <div className="slip-content">
        <div className="slip-body-section">
          <div
            className="slip-header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div className="slip-header-logo" style={{ flex: "0 0 80px" }}>
              <img
                src={resolvedLogo}
                alt={model.schoolName ?? "Institution logo"}
                width={80}
                height={80}
                style={{ display: "block", objectFit: "contain" }}
              />
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "0 12px" }}>
              <h1
                style={{
                  fontSize: "20px",
                  margin: "0 0 4px 0",
                  fontWeight: 900,
                  color: "#0c3c7c",
                }}
              >
                {model.schoolName?.toUpperCase() ?? "INSTITUTION NAME"}
              </h1>
              <h2
                style={{
                  fontSize: "14px",
                  margin: 0,
                  fontWeight: "bold",
                  color: "#111",
                }}
              >
                {ACKNOWLEDGEMENT_SLIP_UI_COPY.headline}
              </h2>
            </div>
            <div style={{ flex: "0 0 80px" }} />
          </div>

          <div
            className="slip-reference"
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              marginBottom: "20px",
              fontSize: "13px",
            }}
          >
            <span>
              {ACKNOWLEDGEMENT_SLIP_UI_COPY.acknowledgementNo}:{" "}
              {model.acknowledgementNumber}
            </span>
            <span>
              {ACKNOWLEDGEMENT_SLIP_UI_COPY.dateSubmitted}:{" "}
              {formatApplicationDate(model.submittedAt)}
            </span>
          </div>

          <div
            className="slip-applicant-block"
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
              marginBottom: "20px",
            }}
          >
            <div className="slip-profile-photo" style={{ flexShrink: 0 }}>
              {model.profilePictureUrl ? (
                <img
                  src={model.profilePictureUrl}
                  alt={model.applicantName}
                  width={90}
                  height={120}
                  style={{
                    display: "block",
                    objectFit: "cover",
                    border: "2px solid #0c3c7c",
                    borderRadius: "4px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 90,
                    height: 120,
                    border: "2px solid #ccc",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    color: "#888",
                    textAlign: "center",
                    padding: "4px",
                  }}
                >
                  No photo
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 6px 0", fontWeight: "bold", fontSize: "15px" }}>
                {model.applicantName}
              </p>
              <p style={{ margin: "0 0 4px 0" }}>
                <strong>{ACKNOWLEDGEMENT_SLIP_UI_COPY.jambRegNo}:</strong>{" "}
                {formatDisplayValue(model.jambRegNo)}
              </p>
              <p style={{ margin: "0 0 4px 0" }}>
                <strong>{ACKNOWLEDGEMENT_SLIP_UI_COPY.programmeApplied}:</strong>{" "}
                {formatDisplayValue(model.programmeName)}
              </p>
              <p style={{ margin: 0 }}>
                <strong>{ACKNOWLEDGEMENT_SLIP_UI_COPY.admissionCycle}:</strong>{" "}
                {formatDisplayValue(model.cycleName)}
              </p>
            </div>
          </div>

          <div className="slip-details-list" style={{ marginBottom: "16px" }}>
            <p style={{ margin: "0 0 4px 0" }}>
              <strong>{ACKNOWLEDGEMENT_SLIP_UI_COPY.candidateId}:</strong>{" "}
              {model.candidateId}
            </p>
            <p style={{ margin: "0 0 4px 0" }}>
              <strong>{ACKNOWLEDGEMENT_SLIP_UI_COPY.applicationId}:</strong>{" "}
              {model.applicationId}
            </p>
            <p style={{ margin: 0 }}>
              <strong>{ACKNOWLEDGEMENT_SLIP_UI_COPY.entryMode}:</strong>{" "}
              {formatDisplayValue(model.entryMode)}
            </p>
          </div>

          <p
            style={{
              fontStyle: "italic",
              marginBottom: "16px",
              fontSize: "12px",
              color: "#333",
            }}
          >
            {ACKNOWLEDGEMENT_SLIP_UI_COPY.statusLine}
          </p>

          <div className="slip-next-steps">
            <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
              {ACKNOWLEDGEMENT_SLIP_UI_COPY.nextStepsTitle}
            </p>
            <ol style={{ margin: 0, paddingLeft: "20px" }}>
              {ACKNOWLEDGEMENT_NEXT_STEPS.map((step) => (
                <li key={step} style={{ marginBottom: "6px" }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div
          className="slip-page-bottom"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "24px",
            paddingTop: "12px",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <div className="slip-footer" style={{ fontSize: "10px", color: "#555" }}>
            <p style={{ margin: 0 }}>{ACKNOWLEDGEMENT_SLIP_UI_COPY.footerNote}</p>
            <p style={{ margin: "4px 0 0 0" }}>
              {model.schoolName ?? "Institution"}
            </p>
          </div>
          <div className="slip-qr-code">
            <QRCodeSVG value={model.verifyUrl} size={90} level="M" />
          </div>
        </div>
      </div>
    </div>
  );
}
