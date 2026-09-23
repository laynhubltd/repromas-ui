import React, { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { useGetCourseConfigurationsGroupedQuery } from "@/features/courses";
import type { CourseConfigurationGroupOption } from "@/features/courses";
import { useGetAcademicSessionsQuery } from "@/features/settings";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useBatchAllocateCoursesMutation } from "../api/courseAllocationsApi";
import type { Staff } from "../types/staff";
import type {
  AllocationRole,
  BatchAllocateCoursesPayload,
  TableCourseLeafRow,
  TableVersionRow,
} from "../types/courseAllocation";
import { parseAllocationConflictError } from "../utils/allocationRoleUtils";

export type UseAllocateCoursesModalProps = {
  open: boolean;
  staff: Staff | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export function useAllocateCoursesModal({
  open,
  staff,
  onClose,
  onSuccess,
}: UseAllocateCoursesModalProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<number | undefined>(undefined);
  const [programId, setProgramId] = useState<number | undefined>(undefined);
  const [levelId, setLevelId] = useState<number | undefined>(undefined);
  const [semesterTypeId, setSemesterTypeId] = useState<number | undefined>(undefined);

  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const [selectedCourseConfigIds, setSelectedCourseConfigIds] = useState<number[]>([]);
  const [roleOverrides, setRoleOverrides] = useState<Record<number, AllocationRole>>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const [conflictCourseConfigId, setConflictCourseConfigId] = useState<number | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  // 1. Fetch Sessions & initialize default active session
  const { data: sessionsData, isLoading: isSessionsLoading } = useGetAcademicSessionsQuery({
    itemsPerPage: 100,
  });
  const sessions = useMemo(() => sessionsData?.member ?? [], [sessionsData?.member]);

  useEffect(() => {
    if (open && sessions.length > 0 && selectedSessionId === undefined) {
      const currentSession = sessions.find((s) => s.isCurrent) ?? sessions[0];
      if (currentSession) {
        setSelectedSessionId(currentSession.id);
      }
    }
  }, [open, sessions, selectedSessionId]);

  // 2. Fetch Programs & auto-default to staff department's first program
  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsQuery(
    { itemsPerPage: 100 },
    { skip: !open }
  );
  const programs = useMemo(() => programsData?.member ?? [], [programsData?.member]);

  useEffect(() => {
    if (open && programs.length > 0 && programId === undefined) {
      if (staff?.departmentId) {
        const matchingProgram = programs.find((p) => p.departmentId === staff.departmentId);
        if (matchingProgram) {
          setProgramId(matchingProgram.id);
          return;
        }
      }
      setProgramId(programs[0].id);
    }
  }, [open, programs, programId, staff?.departmentId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedCourseConfigIds([]);
      setRoleOverrides({});
      setConflictCourseConfigId(null);
      setConflictMessage(null);
      setSearch("");
      setProgramId(undefined);
      setLevelId(undefined);
      setSemesterTypeId(undefined);
      setExpandedRowKeys([]);
    }
  }, [open]);

  // 3. Fetch Grouped Course Configurations
  const {
    data: groupedData,
    isLoading: isConfigsLoading,
    isFetching: isConfigsFetching,
  } = useGetCourseConfigurationsGroupedQuery(
    {
      programId: programId!,
      ...(levelId ? { levelId } : {}),
      ...(semesterTypeId ? { semesterTypeId } : {}),
      ...(debouncedSearch?.trim() ? { search: debouncedSearch.trim() } : {}),
    },
    { skip: !open || !programId }
  );

  const courseConfigGroups = useMemo<CourseConfigurationGroupOption[]>(() => {
    if (Array.isArray(groupedData)) return groupedData;
    return (groupedData as any)?.member ?? [];
  }, [groupedData]);

  // 4. Transform into Tree Table Rows
  const tableRows = useMemo<TableVersionRow[]>(() => {
    return courseConfigGroups.map((group: CourseConfigurationGroupOption) => {
      const leafChildren: TableCourseLeafRow[] = (group.options ?? []).map((opt) => ({
        key: opt.value,
        isGroup: false,
        id: opt.value,
        code: opt.code,
        title: opt.title,
        creditUnit: opt.creditUnit,
        courseStatus: opt.courseStatus,
        levelId: opt.levelId,
        levelName: opt.levelName,
        semesterTypeId: opt.semesterTypeId,
        semesterName: opt.semesterName ?? opt.semesterTypeName,
        versionLabel: group.label,
      }));

      return {
        key: `version-${group.versionId}`,
        isGroup: true,
        versionId: group.versionId,
        label: group.label,
        scope: group.scope,
        isActiveForAdmission: group.isActiveForAdmission,
        totalCourses: leafChildren.length,
        children: leafChildren,
      };
    });
  }, [courseConfigGroups]);

  const totalConfigs = useMemo(
    () => tableRows.reduce((acc, g) => acc + g.totalCourses, 0),
    [tableRows]
  );

  // 5. Controlled expandedRowKeys policy
  useEffect(() => {
    const isFilterActive = Boolean(debouncedSearch.trim() || levelId || semesterTypeId);
    if (isFilterActive) {
      setExpandedRowKeys(tableRows.map((r) => r.key));
    } else {
      if (tableRows.length <= 3) {
        setExpandedRowKeys(tableRows.map((r) => r.key));
      } else {
        setExpandedRowKeys([]);
      }
    }
  }, [tableRows, debouncedSearch, levelId, semesterTypeId]);

  // 6. Controlled selectedRowKeys combining stored numeric IDs and fully-selected visible groups
  const selectedRowKeys = useMemo<React.Key[]>(() => {
    const keys: React.Key[] = [...selectedCourseConfigIds];
    tableRows.forEach((group) => {
      if (
        group.children.length > 0 &&
        group.children.every((child) => selectedCourseConfigIds.includes(child.id))
      ) {
        keys.push(group.key);
      }
    });
    return keys;
  }, [selectedCourseConfigIds, tableRows]);

  // 7. Batch Mutation
  const [batchAllocate, { isLoading: isSubmitting }] = useBatchAllocateCoursesMutation();

  // Handlers
  const handleSessionChange = (sessionId: number | undefined) => {
    setSelectedSessionId(sessionId);
    setConflictCourseConfigId(null);
    setConflictMessage(null);
  };

  const handleProgramFilterChange = (id: number | undefined) => {
    setProgramId(id);
    setConflictCourseConfigId(null);
    setConflictMessage(null);
  };

  const handleLevelFilterChange = (id: number | undefined) => {
    setLevelId(id);
  };

  const handleSemesterTypeFilterChange = (id: number | undefined) => {
    setSemesterTypeId(id);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleExpandedRowsChange = (keys: readonly React.Key[]) => {
    setExpandedRowKeys([...keys]);
  };

  const handleSelectionChange = (newSelectedRowKeys: React.Key[]) => {
    const prevGroupKeys = new Set(
      tableRows
        .filter((g) => g.children.length > 0 && g.children.every((c) => selectedCourseConfigIds.includes(c.id)))
        .map((g) => g.key)
    );
    const nextKeySet = new Set(newSelectedRowKeys);

    // Collect numeric leaf IDs explicitly present
    const nextLeafIds = new Set<number>(
      newSelectedRowKeys.filter((k): k is number => typeof k === "number")
    );

    // Evaluate group toggles
    tableRows.forEach((group) => {
      const isGroupSelected = nextKeySet.has(group.key);
      const wasGroupSelected = prevGroupKeys.has(group.key);

      if (isGroupSelected && !wasGroupSelected) {
        // Group newly checked -> select all its visible children
        group.children.forEach((child) => nextLeafIds.add(child.id));
      } else if (!isGroupSelected && wasGroupSelected) {
        // Group unchecked -> deselect all its visible children
        group.children.forEach((child) => nextLeafIds.delete(child.id));
      }
    });

    const finalSelectedIds = Array.from(nextLeafIds);
    setSelectedCourseConfigIds(finalSelectedIds);

    // Enforce default CO_LECTURER role for any newly selected ID
    setRoleOverrides((prev) => {
      const next = { ...prev };
      finalSelectedIds.forEach((id) => {
        if (!next[id]) {
          next[id] = "CO_LECTURER";
        }
      });
      return next;
    });

    if (conflictCourseConfigId && !finalSelectedIds.includes(conflictCourseConfigId)) {
      setConflictCourseConfigId(null);
      setConflictMessage(null);
    }
  };

  const handleRoleChange = (courseConfigId: number, role: AllocationRole) => {
    setRoleOverrides((prev) => ({
      ...prev,
      [courseConfigId]: role,
    }));

    if (conflictCourseConfigId === courseConfigId) {
      setConflictCourseConfigId(null);
      setConflictMessage(null);
    }
  };

  const summaryCounts = useMemo(() => {
    let primaryCount = 0;
    let coLecturerCount = 0;
    let assistantCount = 0;
    let markerCount = 0;

    selectedCourseConfigIds.forEach((id) => {
      const role = roleOverrides[id] ?? "CO_LECTURER";
      if (role === "PRIMARY_LECTURER") primaryCount++;
      else if (role === "CO_LECTURER") coLecturerCount++;
      else if (role === "ASSISTANT") assistantCount++;
      else if (role === "MARKER") markerCount++;
    });

    return {
      totalSelected: selectedCourseConfigIds.length,
      primaryCount,
      coLecturerCount,
      assistantCount,
      markerCount,
    };
  }, [selectedCourseConfigIds, roleOverrides]);

  const handleSubmit = async () => {
    if (!staff || !selectedSessionId) {
      message.error("Please select a valid academic session.");
      return;
    }

    if (selectedCourseConfigIds.length === 0) {
      message.warning("Please select at least one course to allocate.");
      return;
    }

    const payload: BatchAllocateCoursesPayload = {
      staffId: staff.id,
      academicSessionId: selectedSessionId,
      allocations: selectedCourseConfigIds.map((id) => ({
        courseConfigurationId: id,
        role: roleOverrides[id] ?? "CO_LECTURER",
      })),
    };

    try {
      await batchAllocate(payload).unwrap();
      message.success(
        `Successfully allocated ${selectedCourseConfigIds.length} course${
          selectedCourseConfigIds.length > 1 ? "s" : ""
        }.`
      );
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const conflict = parseAllocationConflictError(err);
      if (conflict) {
        if (conflict.courseConfigurationId) {
          setConflictCourseConfigId(conflict.courseConfigurationId);
        }
        setConflictMessage(conflict.message);
        message.error(conflict.message);
      } else {
        message.error("Failed to allocate courses. Please check your inputs and try again.");
      }
    }
  };

  return {
    state: {
      selectedSessionId,
      programId,
      levelId,
      semesterTypeId,
      search,
      debouncedSearch,
      selectedCourseConfigIds,
      selectedRowKeys,
      expandedRowKeys,
      roleOverrides,
      conflictCourseConfigId,
      conflictMessage,
      sessions,
      programs,
      tableRows,
      totalConfigs,
      isSessionsLoading,
      isProgramsLoading,
      isConfigsLoading: isConfigsLoading || isConfigsFetching,
      isSubmitting,
      summaryCounts,
    },
    actions: {
      handleSessionChange,
      handleProgramFilterChange,
      handleLevelFilterChange,
      handleSemesterTypeFilterChange,
      handleSearchChange,
      handleExpandedRowsChange,
      handleSelectionChange,
      handleRoleChange,
      handleSubmit,
      handleCancel: onClose,
    },
  };
}
