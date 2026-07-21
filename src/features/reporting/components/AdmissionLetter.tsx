import { ApplyTo } from "@/features/settings/tabs/system-config/types/signatories";
import { ADMISSION_LETTER_PAGE_STYLE } from "@/features/student-admission/constants/admissionLetterPrintStyles";
import { STUDENT_ADMISSION_UI_COPY } from "@/features/student-admission/constants/studentAdmissionOptions";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import { Button, Flex } from "antd";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useAdmissionLetterData } from "../hooks/useAdmissionLetterData";
import GeneralPageHeader from "./GeneralPageHeader";

dayjs.extend(advancedFormat);

// ─── Main export ─────────────────────────────────────────────────────────────

export function AdmissionLetter() {
    const token = useToken();
    const isMobile = useIsMobile();
    const batchRef = useRef<HTMLDivElement>(null);

    const {
        studentName,
        registrar,
        websiteUrl,
        registrarEmail,
        registrationStartDateStr,
        registrationEndDateStr,
        regNumber,
        sessionDisplay,
        firstGeneratedDate,
        lastGeneratedDate,
    } = useAdmissionLetterData();

    const handlePrintAll = useReactToPrint({
        contentRef: batchRef,
        documentTitle: "Admission Letter",
        pageStyle: ADMISSION_LETTER_PAGE_STYLE,
    });

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
                    {STUDENT_ADMISSION_UI_COPY.printLetter}
                </Button>
            </Flex>

            <div ref={batchRef}>
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

                    <GeneralPageHeader documentType={ApplyTo.AdmissionLetter} />

                    {/* Letter Content Wrapper */}
                    <div className="letter-content" style={{ position: "relative", zIndex: 2 }}>
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
                            <div>{dayjs().format("dddd Do MMMM, YYYY")}</div>
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
                            <strong>{sessionDisplay} Academic Session</strong>, with a programme
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
                                            {registrationStartDateStr}
                                        </strong>{" "}
                                        and will end on{" "}
                                        <strong>
                                            {registrationEndDateStr}
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
                                    {websiteUrl}
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
                                    {registrar?.signatureUrl ? (
                                        <img
                                            src={registrar.signatureUrl}
                                            alt={`${registrar.name || "Registrar"} signature`}
                                            style={{
                                                display: "block",
                                                height: "60px",
                                                width: "auto",
                                                margin: "0 auto 4px auto",
                                                objectFit: "contain",
                                            }}
                                        />
                                    ) : (
                                        <div style={{ height: "60px", width: "100%", margin: "0 auto 4px auto" }} />
                                    )}

                                    <div
                                        style={{
                                            fontWeight: "bold",
                                            lineHeight: 1.35,
                                            fontFamily: "Arial, sans-serif",
                                        }}
                                    >
                                        {registrar?.name || "-/-"}{" "}
                                        <span style={{ fontWeight: "normal", fontSize: "11.5px" }}>
                                            {registrar?.qualification}
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
                                        {registrar?.position || "Registrar"}
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
                                    First generated on {firstGeneratedDate}. Last generated on {lastGeneratedDate}.
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
                                        <span style={{ fontWeight: "normal" }}>{websiteUrl}</span>
                                    </div>
                                    <div>
                                        Email:{" "}
                                        {registrarEmail}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdmissionLetter;