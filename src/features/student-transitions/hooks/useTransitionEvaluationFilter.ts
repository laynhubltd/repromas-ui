import {
  useGetAcademicSessionsQuery,
  useGetSemesterTypesQuery,
} from "@/features/settings/tabs/academic-calendar/api/academicCalendarApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetSemestersQuery } from "@/features/settings/tabs/system-timeframes/api/systemTimeFramesApi";
import { useCallback, useMemo, useState } from "react";

export function useTransitionEvaluationFilter() {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedSemesterTypeId, setSelectedSemesterTypeId] = useState<number | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [isTerminal, setIsTerminal] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  // Queries for dropdown options
  const { data: sessionsData, isLoading: sessionsLoading } = useGetAcademicSessionsQuery({
    sort: "rankOrder:desc",
    itemsPerPage: 100,
  });

  const { data: semesterTypesData, isLoading: semesterTypesLoading } = useGetSemesterTypesQuery({
    sort: "sortOrder:asc",
    itemsPerPage: 100,
  });

  const { data: semestersData } = useGetSemestersQuery({
    sort: "createdAt:asc",
    itemsPerPage: 100,
  });

  const { data: programsData, isLoading: programsLoading } = useGetProgramsQuery({
    sort: "name:asc",
    itemsPerPage: 100,
  });

  const { data: levelsData, isLoading: levelsLoading } = useGetLevelsQuery({
    sort: "name:asc",
    itemsPerPage: 100,
  });

  const sessionOptions = sessionsData?.member ?? [];
  const semesterTypeOptions = semesterTypesData?.member ?? [];
  const programOptions = programsData?.member ?? [];
  const levelOptions = levelsData?.member ?? [];

  // Match corresponding specific semester entity for (sessionId, semesterTypeId)
  const matchedSemester = useMemo(() => {
    if (!selectedSessionId || !selectedSemesterTypeId) return null;
    return (
      (semestersData?.member ?? []).find(
        (s) =>
          s.sessionId === selectedSessionId &&
          s.semesterTypeId === selectedSemesterTypeId,
      ) ?? null
    );
  }, [semestersData, selectedSessionId, selectedSemesterTypeId]);

  // Unique cohort identity key
  const cohortKey = useMemo(() => {
    if (!selectedProgramId || !selectedLevelId || !selectedSessionId || !selectedSemesterTypeId) {
      return null;
    }
    return `${selectedProgramId}:${selectedLevelId}:${selectedSessionId}:${selectedSemesterTypeId}`;
  }, [selectedProgramId, selectedLevelId, selectedSessionId, selectedSemesterTypeId]);

  const isFilterComplete = cohortKey !== null;

  const handleSessionChange = useCallback((id: number | null) => {
    setSelectedSessionId(id);
    setPage(1);
  }, []);

  const handleSemesterTypeChange = useCallback((id: number | null) => {
    setSelectedSemesterTypeId(id);
    setPage(1);
  }, []);

  const handleProgramChange = useCallback((id: number | null) => {
    setSelectedProgramId(id);
    setPage(1);
  }, []);

  const handleLevelChange = useCallback((id: number | null) => {
    setSelectedLevelId(id);
    setPage(1);
  }, []);

  const handleTerminalToggle = useCallback((checked: boolean) => {
    setIsTerminal(checked);
    setPage(1);
  }, []);

  return {
    state: {
      selectedSessionId,
      selectedSemesterTypeId,
      selectedProgramId,
      selectedLevelId,
      matchedSemesterId: matchedSemester?.id ?? null,
      isTerminal,
      page,
      itemsPerPage,
      cohortKey,
      isFilterComplete,
      sessionOptions,
      semesterTypeOptions,
      programOptions,
      levelOptions,
      isLoadingOptions:
        sessionsLoading || semesterTypesLoading || programsLoading || levelsLoading,
    },
    actions: {
      handleSessionChange,
      handleSemesterTypeChange,
      handleProgramChange,
      handleLevelChange,
      handleTerminalToggle,
      setPage,
      setItemsPerPage,
    },
  };
}
