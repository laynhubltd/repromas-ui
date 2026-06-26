import futbLogo from "@/assets/futb_logo.png";
import type { PrintableApplicationDocumentModel } from "../../types/acknowledgement-slip";
import { ME_APPLICATION_UI_COPY } from "../../constants/meAdmissionApplicationOptions";
import { formatApplicationDate } from "../../utils/applicationDossierDisplay";

type PrintableApplicationDossierProps = {
  model: PrintableApplicationDocumentModel;
};

function formatDisplayValue(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

export function PrintableApplicationDossier({
  model,
}: PrintableApplicationDossierProps) {
  const resolvedLogo = model.logoUrl ?? futbLogo;

  return (
    <div
      className="app-print-container"
      style={{
        backgroundColor: "#ffffff",
        maxWidth: "820px",
        margin: "0 auto",
        padding: "40px 50px",
        fontFamily: "Arial, sans-serif",
        color: "#111",
      }}
    >
      <div
        className="app-print-section-break"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="app-print-header-logo">
          <img
            src={resolvedLogo}
            alt={model.schoolName ?? "Institution logo"}
            width={64}
            height={64}
            style={{ display: "block", objectFit: "contain" }}
          />
        </div>
        <div>
          <h1 style={{ margin: "0 0 4px 0", fontSize: "20px", color: "#0c3c7c" }}>
            {model.schoolName?.toUpperCase() ?? "INSTITUTION NAME"}
          </h1>
          <h2 style={{ margin: 0, fontSize: "14px" }}>
            {ME_APPLICATION_UI_COPY.pageTitle}
          </h2>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <p style={{ margin: "0 0 4px 0" }}>
          <strong>Reference:</strong> {model.acknowledgementNumber}
        </p>
        <p style={{ margin: "0 0 4px 0" }}>
          <strong>Status:</strong> {model.applicationStatus}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Submitted:</strong> {formatApplicationDate(model.submittedAt)}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          alignItems: "flex-start",
        }}
      >
        <div className="app-print-profile-photo">
          {model.profilePictureUrl ? (
            <img
              src={model.profilePictureUrl}
              alt={model.applicantName}
              width={90}
              height={120}
              style={{ objectFit: "cover", border: "1px solid #ccc" }}
            />
          ) : null}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: "0 0 8px 0" }}>{model.applicantName}</h2>
          <p style={{ margin: "0 0 4px 0" }}>
            <strong>{ME_APPLICATION_UI_COPY.jambRegNo}:</strong>{" "}
            {formatDisplayValue(model.jambRegNo)}
          </p>
          <p style={{ margin: "0 0 4px 0" }}>
            <strong>Date of birth:</strong>{" "}
            {formatApplicationDate(model.dateOfBirth)}
          </p>
          <p style={{ margin: "0 0 4px 0" }}>
            <strong>Gender:</strong> {formatDisplayValue(model.gender)}
          </p>
          <p style={{ margin: "0 0 4px 0" }}>
            <strong>{ME_APPLICATION_UI_COPY.stateOfOrigin}:</strong>{" "}
            {formatDisplayValue(model.stateName)}
          </p>
          <p style={{ margin: "0 0 4px 0" }}>
            <strong>{ME_APPLICATION_UI_COPY.lga}:</strong>{" "}
            {formatDisplayValue(model.lgaName)}
          </p>
          <p style={{ margin: "0 0 4px 0" }}>
            <strong>Email:</strong> {formatDisplayValue(model.email)}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Phone:</strong> {formatDisplayValue(model.phone)}
          </p>
        </div>
      </div>

      <div className="app-print-section-break" style={{ marginBottom: "24px" }}>
        <h2>{ME_APPLICATION_UI_COPY.sectionProgram}</h2>
        <p style={{ margin: "0 0 4px 0" }}>
          <strong>{ME_APPLICATION_UI_COPY.appliedProgram}:</strong>{" "}
          {formatDisplayValue(model.programmeName)}
        </p>
        <p style={{ margin: "0 0 4px 0" }}>
          <strong>{ME_APPLICATION_UI_COPY.cycle}:</strong>{" "}
          {formatDisplayValue(model.cycleName)}
        </p>
        <p style={{ margin: 0 }}>
          <strong>{ME_APPLICATION_UI_COPY.entryMode}:</strong>{" "}
          {formatDisplayValue(model.entryMode)}
        </p>
      </div>

      {model.jambScores.length > 0 ? (
        <div className="app-print-section-break" style={{ marginBottom: "24px" }}>
          <h2>{ME_APPLICATION_UI_COPY.sectionJamb}</h2>
          <table className="app-print-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {model.jambScores.map((row) => (
                <tr key={`${row.subject}-${row.score}`}>
                  <td>{row.subject}</td>
                  <td>{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {model.olevelSittings.length > 0 ? (
        <div className="app-print-section-break" style={{ marginBottom: "24px" }}>
          <h2>{ME_APPLICATION_UI_COPY.sectionOlevel}</h2>
          {model.olevelSittings.map((sitting) => (
            <div key={`${sitting.examType}-${sitting.examYear}`} style={{ marginBottom: "16px" }}>
              <p style={{ fontWeight: "bold", margin: "0 0 8px 0" }}>
                {sitting.examType} ({sitting.examYear})
                {sitting.examRegNo ? ` — ${sitting.examRegNo}` : ""}
              </p>
              <table className="app-print-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {sitting.grades.map((grade) => (
                    <tr key={`${grade.subject}-${grade.grade}`}>
                      <td>{grade.subject}</td>
                      <td>{grade.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : null}

      {model.documents.length > 0 ? (
        <div style={{ marginBottom: "24px" }}>
          <h2>{ME_APPLICATION_UI_COPY.sectionDocuments}</h2>
          <table className="app-print-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {model.documents.map((doc) => (
                <tr key={`${doc.filename}-${doc.documentType}`}>
                  <td>{doc.filename}</td>
                  <td>{doc.documentType}</td>
                  <td>{doc.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="app-print-footer">
        <p style={{ margin: 0 }}>
          Candidate ID: {model.candidateId} · Application ID: {model.applicationId}
        </p>
        <p style={{ margin: "4px 0 0 0" }}>
          Generated electronically — {model.schoolName ?? "Institution"}
        </p>
      </div>
    </div>
  );
}
