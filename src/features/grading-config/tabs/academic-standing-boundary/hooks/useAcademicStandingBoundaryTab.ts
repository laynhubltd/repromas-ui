import { useGetAcademicStandingsQuery } from "@/features/grading-config/tabs/academic-standing/api/academicStandingApi";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetAcademicStandingBoundariesQuery } from "../api/academicStandingBoundaryApi";
import type { AcademicStandingBoundary } from "../types/academic-standing-boundary";
import { deriveTierIntervals } from "../utils/tierIntervalDerivation";

export function useAcademicStandingBoundaryTab() {
  const [searchParams] = useSearchParams();
  const initialUrlPolicyId = searchParams.get("policyId");

  const [userSelectedPolicyId, setUserSelectedPolicyId] = useState<number | null>(
    initialUrlPolicyId ? Number(initialUrlPolicyId) : null,
  );

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [upsertTarget, setUpsertTarget] = useState<AcademicStandingBoundary | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AcademicStandingBoundary | null>(null);

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

  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId) ?? null;
  const policyMaxCgpa = selectedPolicy ? Number(selectedPolicy.maxCgpa) : 5.0;

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

  const boundaries = boundariesData?.member ?? [];
  const derivation = deriveTierIntervals(boundaries, policyMaxCgpa);

  const handleSelectPolicy = (policyId: number) => {
    setUserSelectedPolicyId(policyId);
  };

  const handleOpenUpsert = (target: AcademicStandingBoundary | null = null) => {
    setUpsertTarget(target);
    setUpsertOpen(true);
  };

  const handleCloseUpsert = () => {
    setUpsertOpen(false);
    setUpsertTarget(null);
  };

  const handleOpenDelete = (target: AcademicStandingBoundary) => {
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
  };

  const isLoading = isPoliciesLoading || (selectedPolicyId !== null && isBoundariesLoading);
  const isError = isPoliciesError || (selectedPolicyId !== null && isBoundariesError);
  const hasBoundaries = boundaries.length > 0;

  return {
    state: {
      selectedPolicyId,
      selectedPolicy,
      policyMaxCgpa,
      policies,
      boundaries,
      derivation,
      upsertOpen,
      upsertTarget,
      deleteOpen,
      deleteTarget,
      isLoading,
      isError,
    },
    actions: {
      handleSelectPolicy,
      handleOpenUpsert,
      handleCloseUpsert,
      handleOpenDelete,
      handleCloseDelete,
      refetch,
    },
    flags: {
      hasBoundaries,
      hasPolicies: policies.length > 0,
    },
  };
}
