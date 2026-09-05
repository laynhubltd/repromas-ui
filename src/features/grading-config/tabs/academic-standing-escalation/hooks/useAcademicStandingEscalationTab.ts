import { useGetAcademicStandingsQuery } from "@/features/grading-config/tabs/academic-standing/api/academicStandingApi";
import { useGetAcademicStandingBoundariesQuery } from "@/features/grading-config/tabs/academic-standing-boundary/api/academicStandingBoundaryApi";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetAcademicStandingEscalationStepsQuery } from "../api/academicStandingEscalationApi";
import type { AcademicStandingEscalationStep } from "../types/academic-standing-escalation";

export function useAcademicStandingEscalationTab() {
  const [searchParams] = useSearchParams();
  const initialUrlPolicyId = searchParams.get("policyId");
  const initialUrlBoundaryId = searchParams.get("boundaryId");

  const [userSelectedPolicyId, setUserSelectedPolicyId] = useState<number | null>(
    initialUrlPolicyId ? Number(initialUrlPolicyId) : null,
  );
  const [userSelectedBoundaryId, setUserSelectedBoundaryId] = useState<number | null>(
    initialUrlBoundaryId ? Number(initialUrlBoundaryId) : null,
  );

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [upsertTarget, setUpsertTarget] = useState<AcademicStandingEscalationStep | null>(null);
  const [defaultStepNumber, setDefaultStepNumber] = useState(1);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AcademicStandingEscalationStep | null>(null);

  // Load policies
  const {
    data: policiesData,
    isLoading: isPoliciesLoading,
    isError: isPoliciesError,
    refetch: refetchPolicies,
  } = useGetAcademicStandingsQuery({ itemsPerPage: 100, include: "boundaries" });

  const policies = policiesData?.member ?? [];
  const selectedPolicyId =
    userSelectedPolicyId ?? (policies.length > 0 ? policies[0].id : null);

  // Load boundaries for selected policy
  const {
    data: boundariesData,
    isLoading: isBoundariesLoading,
    isError: isBoundariesError,
    refetch: refetchBoundaries,
  } = useGetAcademicStandingBoundariesQuery(
    {
      academicStandingId: selectedPolicyId!,
      sort: "minCgpa:desc",
      include: "escalationSteps,studentTransitionStatus",
    },
    { skip: selectedPolicyId === null },
  );

  const allBoundaries = boundariesData?.member ?? [];
  const ladderBoundaries = allBoundaries.filter((b) => b.hasEscalationLadder);

  const selectedBoundaryId =
    userSelectedBoundaryId ?? (ladderBoundaries.length > 0 ? ladderBoundaries[0].id : null);

  // Load escalation steps for selected boundary
  const {
    data: stepsData,
    isLoading: isStepsLoading,
    isError: isStepsError,
    refetch: refetchSteps,
  } = useGetAcademicStandingEscalationStepsQuery(
    {
      academicStandingBoundaryId: selectedBoundaryId!,
      sort: "stepNumber:asc",
      include: "studentTransitionStatus",
    },
    { skip: selectedBoundaryId === null },
  );

  const steps = stepsData?.member ?? [];

  const handleSelectPolicy = (policyId: number) => {
    setUserSelectedPolicyId(policyId);
    setUserSelectedBoundaryId(null);
  };

  const handleSelectBoundary = (boundaryId: number) => {
    setUserSelectedBoundaryId(boundaryId);
  };

  const handleOpenUpsert = (
    target: AcademicStandingEscalationStep | null = null,
    nextStepNum?: number,
  ) => {
    setUpsertTarget(target);
    if (!target && nextStepNum) {
      setDefaultStepNumber(nextStepNum);
    } else if (!target) {
      const maxNum = steps.reduce((max, s) => Math.max(max, s.stepNumber), 0);
      setDefaultStepNumber(maxNum + 1);
    }
    setUpsertOpen(true);
  };

  const handleCloseUpsert = () => {
    setUpsertOpen(false);
    setUpsertTarget(null);
  };

  const handleOpenDelete = (target: AcademicStandingEscalationStep) => {
    setDeleteTarget(target);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const refetch = () => {
    refetchPolicies();
    if (selectedPolicyId) refetchBoundaries();
    if (selectedBoundaryId) refetchSteps();
  };

  const isLoading =
    isPoliciesLoading ||
    (selectedPolicyId !== null && isBoundariesLoading) ||
    (selectedBoundaryId !== null && isStepsLoading);

  const isError =
    isPoliciesError ||
    (selectedPolicyId !== null && isBoundariesError) ||
    (selectedBoundaryId !== null && isStepsError);

  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId);
  const selectedBoundary = allBoundaries.find((b) => b.id === selectedBoundaryId);

  return {
    state: {
      selectedPolicyId,
      selectedBoundaryId,
      selectedPolicy,
      selectedBoundary,
      policies,
      ladderBoundaries,
      steps,
      defaultStepNumber,
      upsertOpen,
      upsertTarget,
      deleteOpen,
      deleteTarget,
      isLoading,
      isError,
    },
    actions: {
      handleSelectPolicy,
      handleSelectBoundary,
      handleOpenUpsert,
      handleCloseUpsert,
      handleOpenDelete,
      handleCloseDelete,
      refetch,
    },
    flags: {
      hasPolicies: policies.length > 0,
      hasLadderBoundaries: ladderBoundaries.length > 0,
      hasSelectedBoundary: selectedBoundaryId !== null,
    },
  };
}
