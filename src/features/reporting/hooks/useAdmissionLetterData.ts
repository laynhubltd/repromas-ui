import useAuthState from "@/features/auth/use-auth-state";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useBrandingConfig } from "@/features/settings/tabs/system-config/hooks/useBrandingConfig";
import { useSignatoriesRender } from "@/features/settings/tabs/system-config/hooks/useSignatoriesRender";
import { ApplyTo, type SignatoryRenderItem } from "@/features/settings/tabs/system-config/types/signatories";
import { useGetSystemTimeFramesQuery } from "@/features/settings/tabs/system-timeframes/api/systemTimeFramesApi";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormat);

function buildRegNumber(
    slug: string,
    programCode: string,
    session: string,
    serial: string
): string {
    return `${slug}/APP/${programCode}/${session}/${serial.padStart(4, "0")}`;
}

export type AdmissionLetterData = {
    studentName: string | undefined;
    registrar: SignatoryRenderItem | undefined;
    slug: string;
    websiteUrl: string;
    registrarEmail: string;
    registrationStartDateStr: string;
    registrationEndDateStr: string;
    regNumber: string;
    sessionDisplay: string;
    firstGeneratedDate: string;
    lastGeneratedDate: string;
};

export function useAdmissionLetterData(): AdmissionLetterData {
    const { entity } = useAuthState();
    const studentName =
        entity != null && "firstName" in entity && "lastName" in entity
            ? `${entity.firstName} ${entity.lastName}`.trim()
            : undefined;

    const { state: signatoriesState } = useSignatoriesRender(ApplyTo.AdmissionLetter);
    const registrar = signatoriesState.signatories.find((s) => s.order === 2);

    const { state: brandingState } = useBrandingConfig();
    const slug = brandingState.tenantName || "FUTB";

    const { data: programsData } = useGetProgramsQuery({ itemsPerPage: 1000 });
    const { data: timeFramesData } = useGetSystemTimeFramesQuery({
        "exact[eventType]": "COURSE_REGISTRATION",
        "boolean[isActive]": true,
    });

    const courseRegistrationTimeFrame = timeFramesData?.member?.[0];
    const registrationStartDateStr = courseRegistrationTimeFrame?.startAt
        ? dayjs(courseRegistrationTimeFrame.startAt).format("dddd Do MMMM, YYYY")
        : "Monday 15th June, 2026";
    const registrationEndDateStr = courseRegistrationTimeFrame?.endAt
        ? dayjs(courseRegistrationTimeFrame.endAt).format("dddd Do MMMM, YYYY")
        : "Friday 31st July, 2026";

    let regNumber = buildRegNumber("FUTB", "REM", "25", "1");
    let sessionDisplay = "2025/2026";

    if (entity && "cycleId" in entity) {
        sessionDisplay = entity.cycle?.name || "2025/2026";
        const sessionShort = entity.cycle?.name?.split("/")?.[0]?.slice(-2) || "25";
        const serial = String(entity.application?.id || 1);
        const programId = entity.application?.offeredProgramId || entity.application?.appliedProgramId;
        const program = programsData?.member.find((p) => p.id === programId);
        const programCode = program?.code || "REM";
        
        regNumber = buildRegNumber(slug, programCode, sessionShort, serial);
    } else if (entity && "matricNumber" in entity) {
        regNumber = entity.matricNumber || buildRegNumber("FUTB", "REM", "25", "1");
        sessionDisplay = entity.currentEnrollmentTransition?.session?.name || "2025/2026";
    }

    const firstGeneratedDate = dayjs(entity && "createdAt" in entity ? entity.createdAt : new Date()).format("dddd, DD MMMM YYYY @ HH:mm:ss");
    const lastGeneratedDate = dayjs().format("dddd, DD MMMM YYYY @ HH:mm:ss");
    const websiteUrl = brandingState.email ? brandingState.email.split('@')[1] : "futb.edu.ng";
    const registrarEmail = `registrar@${websiteUrl}`;

    return {
        studentName,
        registrar,
        slug,
        websiteUrl,
        registrarEmail,
        registrationStartDateStr,
        registrationEndDateStr,
        regNumber,
        sessionDisplay,
        firstGeneratedDate,
        lastGeneratedDate,
    };
}
