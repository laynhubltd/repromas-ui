// Feature: academic-calendar
import { ExplainerCallout } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import { Col, Flex, Grid, Row } from "antd";
import { useAcademicCalendarTab } from "../hooks/useAcademicCalendarTab";
import { DeleteSemesterModal } from "./modals/DeleteSemesterModal";
import { DeleteSemesterTypeModal } from "./modals/DeleteSemesterTypeModal";
import { DeleteSessionModal } from "./modals/DeleteSessionModal";
import { SemesterFormModal } from "./modals/SemesterFormModal";
import { SemesterTypeFormModal } from "./modals/SemesterTypeFormModal";
import { SessionFormModal } from "./modals/SessionFormModal";
import { SemesterTypePanel } from "./SemesterTypePanel";
import { SessionPanel } from "./SessionPanel";

const { useBreakpoint } = Grid;

export function AcademicCalendarTab() {
    const token = useToken();
    const screens = useBreakpoint();
    const isDesktop = !!screens.md;

    const { state, actions } = useAcademicCalendarTab();

    const {
        semesterTypes,
        semesterTypesLoading,
        semesterTypesError,
        semesterTypeFormTarget,
        semesterTypeFormOpen,
        deleteTypeTarget,
        sessions,
        sessionsLoading,
        sessionsError,
        sessionFormTarget,
        sessionFormOpen,
        deleteSessionTarget,
        semesterFormTarget,
        semesterFormOpen,
        semesterFormSessionId,
        deleteSemesterTarget,
    } = state;

    const {
        handleOpenCreateSemesterType,
        handleOpenEditSemesterType,
        handleOpenDeleteSemesterType,
        handleCloseSemesterTypeForm,
        handleCloseDeleteSemesterType,
        refetchSemesterTypes,
        handleOpenCreateSession,
        handleOpenEditSession,
        handleOpenDeleteSession,
        handleCloseSessionForm,
        handleCloseDeleteSession,
        handleSetCurrentSession,
        refetchSessions,
        handleOpenCreateSemester,
        handleOpenEditSemester,
        handleOpenDeleteSemester,
        handleCloseSemesterForm,
        handleCloseDeleteSemester,
        handleAdvanceSemesterStatus,
        handleSetCurrentSemester,
    } = actions;

    return (
        <>
            <Flex vertical gap={30}>
                <ExplainerCallout
                    intent="new"
                    title="Academic Calendar"
                    body="Manage semester types, academic sessions, and their semesters — each semester follows a strict Pending → Open → Grading → Closed lifecycle."
                    dismissible
                    collapsible
                />
                <Row gutter={isDesktop ? [token.marginXL * 2, 0] : [0, 24]}>
                    {/* Left panel — SemesterType */}
                    <Col
                        xs={24}
                        md={9}
                        style={
                            isDesktop
                                ? {
                                    borderRight: `1px solid ${token.colorBorderSecondary}`,
                                    paddingRight: token.marginXL,
                                }
                                : undefined
                        }
                    >
                        <SemesterTypePanel
                            semesterTypes={semesterTypes}
                            semesterTypesLoading={semesterTypesLoading}
                            semesterTypesError={semesterTypesError}
                            refetchSemesterTypes={refetchSemesterTypes}
                            onOpenCreate={handleOpenCreateSemesterType}
                            onOpenEdit={handleOpenEditSemesterType}
                            onOpenDelete={handleOpenDeleteSemesterType}
                        />
                    </Col>

                    {/* Right panel — Sessions */}
                    <Col xs={24} md={15}>
                        <SessionPanel
                            sessions={sessions}
                            sessionsLoading={sessionsLoading}
                            sessionsError={sessionsError}
                            semesterTypes={semesterTypes}
                            refetchSessions={refetchSessions}
                            onOpenCreateSession={handleOpenCreateSession}
                            onOpenEditSession={handleOpenEditSession}
                            onOpenDeleteSession={handleOpenDeleteSession}
                            onSetCurrentSession={handleSetCurrentSession}
                            onOpenCreateSemester={handleOpenCreateSemester}
                            onOpenEditSemester={handleOpenEditSemester}
                            onOpenDeleteSemester={handleOpenDeleteSemester}
                            onAdvanceSemesterStatus={handleAdvanceSemesterStatus}
                            onSetCurrentSemester={handleSetCurrentSemester}
                        />
                    </Col>
                </Row>
            </Flex>

            {/* ── Modals ─────────────────────────────────────────────────────────── */}
            <SemesterTypeFormModal
                open={semesterTypeFormOpen}
                target={semesterTypeFormTarget}
                onClose={handleCloseSemesterTypeForm}
            />

            <DeleteSemesterTypeModal
                open={deleteTypeTarget !== null}
                target={deleteTypeTarget}
                onClose={handleCloseDeleteSemesterType}
            />

            <SessionFormModal
                open={sessionFormOpen}
                target={sessionFormTarget}
                onClose={handleCloseSessionForm}
            />

            <DeleteSessionModal
                open={deleteSessionTarget !== null}
                target={deleteSessionTarget}
                onClose={handleCloseDeleteSession}
            />

            <SemesterFormModal
                open={semesterFormOpen}
                target={semesterFormTarget}
                sessionId={semesterFormSessionId}
                semesterTypes={semesterTypes}
                onClose={handleCloseSemesterForm}
            />

            <DeleteSemesterModal
                open={deleteSemesterTarget !== null}
                target={deleteSemesterTarget}
                onClose={handleCloseDeleteSemester}
            />
        </>
    );
}
