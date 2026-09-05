import { useGetAcademicStandingsQuery } from "@/features/grading-config/tabs/academic-standing/api/academicStandingApi";
import { notification } from "antd";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useCreateAcademicStandingDegreeClassificationMutation,
  useGetAcademicStandingDegreeClassificationsQuery,
} from "../api/academicStandingDegreeClassificationApi";
import type {
  DegreeClassificationBand,
  DegreeClassificationPresetTemplate,
} from "../types/academic-standing-degree-classification";
import {
  DEGREE_PRESET_TEMPLATES,
  deriveDegreeIntervals,
} from "../utils/degreeIntervalDerivations";

export function useDegreeClassificationTab() {
  const [searchParams] = useSearchParams();
  const initialUrlPolicyId = searchParams.get("policyId");

  const [userSelectedPolicyId, setUserSelectedPolicyId] = useState<number | null>(
    initialUrlPolicyId ? Number(initialUrlPolicyId) : null,
  );

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [upsertTarget, setUpsertTarget] = useState<DegreeClassificationBand | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DegreeClassificationBand | null>(null);

  const [isApplyingPreset, setIsApplyingPreset] = useState(false);

  // Load parent academic standing policies
  const {
    data: policiesData,
    isLoading: isPoliciesLoading,
    isError: isPoliciesError,
    refetch: refetchPolicies,
  } = useGetAcademicStandingsQuery({ itemsPerPage: 100 });

  const policies = policiesData?.member ?? [];

  const selectedPolicyId =
    userSelectedPolicyId ?? (policies.length > 0 ? policies[0].id : null);

  const selectedPolicy = useMemo(
    () => policies.find((p) => p.id === selectedPolicyId) ?? null,
    [policies, selectedPolicyId],
  );

  const policyMaxCgpa = selectedPolicy ? Number(selectedPolicy.maxCgpa) : 5.0;

  // Load degree classifications for selected policy
  const {
    data: classificationsData,
    isLoading: isClassificationsLoading,
    isFetching: isClassificationsFetching,
    isError: isClassificationsError,
    refetch: refetchClassifications,
  } = useGetAcademicStandingDegreeClassificationsQuery(
    {
      academicStandingId: selectedPolicyId!,
      sort: "rankOrder",
    },
    { skip: selectedPolicyId === null },
  );

  const [createClassification] =
    useCreateAcademicStandingDegreeClassificationMutation();

  const classifications = classificationsData?.member ?? [];
  const derivation = useMemo(
    () => deriveDegreeIntervals(classifications, policyMaxCgpa),
    [classifications, policyMaxCgpa],
  );

  const handleSelectPolicy = (policyId: number) => {
    setUserSelectedPolicyId(policyId);
  };

  const handleOpenUpsert = (target: DegreeClassificationBand | null = null) => {
    setUpsertTarget(target);
    setUpsertOpen(true);
  };

  const handleCloseUpsert = () => {
    setUpsertOpen(false);
    setUpsertTarget(null);
  };

  const handleOpenDelete = (target: DegreeClassificationBand) => {
    setDeleteTarget(target);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleApplyPreset = async (preset: DegreeClassificationPresetTemplate) => {
    if (!selectedPolicyId) return;
    setIsApplyingPreset(true);
    try {
      for (const band of preset.bands) {
        await createClassification({
          academicStandingId: selectedPolicyId,
          name: band.name,
          code: band.code,
          minCgpa: band.minCgpa,
          maxCgpa: band.maxCgpa,
          rankOrder: band.rankOrder,
        }).unwrap();
      }
      notification.success({
        message: "Preset Applied",
        description: `Successfully loaded ${preset.bands.length} classification bands from ${preset.label}.`,
      });
      refetchClassifications();
    } catch (err: unknown) {
      const msg =
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        typeof (err as { data?: { description?: string; message?: string } }).data?.description === "string"
          ? (err as { data?: { description?: string; message?: string } }).data?.description
          : "Failed to apply preset template.";
      notification.error({
        message: "Preset Error",
        description: msg,
      });
    } finally {
      setIsApplyingPreset(false);
    }
  };

  const refetch = () => {
    refetchPolicies();
    if (selectedPolicyId) refetchClassifications();
  };

  const isLoading =
    isPoliciesLoading || (selectedPolicyId !== null && isClassificationsLoading);
  const isError =
    isPoliciesError || (selectedPolicyId !== null && isClassificationsError);
  const hasClassifications = classifications.length > 0;
  const hasPolicies = policies.length > 0;

  return {
    state: {
      selectedPolicyId,
      selectedPolicy,
      policyMaxCgpa,
      policies,
      classifications,
      derivation,
      upsertOpen,
      upsertTarget,
      deleteOpen,
      deleteTarget,
      isLoading,
      isFetching: isClassificationsFetching,
      isError,
      isApplyingPreset,
      presetTemplates: DEGREE_PRESET_TEMPLATES,
    },
    actions: {
      handleSelectPolicy,
      handleOpenUpsert,
      handleCloseUpsert,
      handleOpenDelete,
      handleCloseDelete,
      handleApplyPreset,
      refetch,
    },
    flags: {
      hasClassifications,
      hasPolicies,
    },
  };
}
