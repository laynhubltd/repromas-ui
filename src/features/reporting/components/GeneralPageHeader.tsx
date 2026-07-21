import { useBrandingConfig } from "@/features/settings/tabs/system-config/hooks/useBrandingConfig";
import { useSignatoriesRender } from "@/features/settings/tabs/system-config/hooks/useSignatoriesRender";
import { ApplyTo, type ApplyToValue } from "@/features/settings/tabs/system-config/types/signatories";
import { useToken } from "@/shared/hooks/useToken";

interface GeneralPageHeaderProps {
  documentType?: ApplyToValue;
}

function GeneralPageHeader({ documentType = ApplyTo.AdmissionLetter }: GeneralPageHeaderProps = {}) {
  const token = useToken();
  const { state: brandingState } = useBrandingConfig();
  const { state: signatoriesState } = useSignatoriesRender(documentType);

  const { schoolName, logoUrl, primaryColor, motto, fullAddress } = brandingState;
  const { signatories } = signatoriesState;

  const vc = signatories.find((s) => s.order === 1);
  const registrar = signatories.find((s) => s.order === 2);

  const addressLines = fullAddress ? fullAddress.split(",").map((line) => line.trim()) : [];

  return (
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
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={schoolName ?? "University Logo"}
              width={90}
              height={90}
              style={{ display: "block", objectFit: "contain" }}
            />
          ) : (
            <div style={{ width: 90, height: 90, backgroundColor: token.colorBgLayout }} />
          )}
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
              color: primaryColor || token.colorPrimary,
              letterSpacing: "0.3px",
            }}
          >
            {schoolName?.toUpperCase() || "UNIVERSITY NAME"}
          </h1>
          <h2
            style={{
              fontSize: "18px",
              margin: "0 0 8px 0",
              fontWeight: "bold",
              color: primaryColor || token.colorPrimary,
              letterSpacing: "0.3px",
            }}
          >
            {motto || "University Motto"}
          </h2>
          <h3
            style={{
              fontSize: "13.5px",
              margin: 0,
              fontWeight: "bold",
              color: token.colorText,
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
            color: token.colorText,
          }}
        >
          {addressLines.length > 0 ? (
            addressLines.map((line, index) => (
              <span key={index}>
                {line}
                {index < addressLines.length - 1 && <br />}
              </span>
            ))
          ) : (
            <>
              -/-,
              <br />
              -/-,
              <br />
              -/-
            </>
          )}
        </div>
      </div>

      {/* Administration Officers Info */}
      <div
        className="letter-admin-bar"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "9px",
          borderBottom: `2.5px solid ${token.colorTextHeading || "#000000"}`,
          paddingBottom: "5px",
          marginBottom: "20px",
          lineHeight: 1.4,
          color: token.colorText,
        }}
      >
        <span style={{ fontWeight: "bold" }}>
          {vc?.position?.toUpperCase() || "VICE-CHANCELLOR"}:
        </span>{" "}
        {vc?.name || "-/-"},{" "}
        <span style={{ fontSize: "8px" }}>
          {vc?.qualification || "-/-"}
        </span>
        <br />
        <span style={{ fontWeight: "bold" }}>
          {registrar?.position?.toUpperCase() || "REGISTRAR"}:
        </span>{" "}
        {registrar?.name || "-/-"},{" "}
        <span style={{ fontSize: "8px" }}>
          {registrar?.qualification || "-/-"}
        </span>
      </div>
    </div>
  );
}

export default GeneralPageHeader;
