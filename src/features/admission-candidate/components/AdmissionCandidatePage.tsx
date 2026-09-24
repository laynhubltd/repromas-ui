import { PrimarySegmented } from "@/components/ui-kit/tabs";
import { Permission } from "@/features/access-control/permissions";
import {
  usePermittedSegmentedOptions,
  type PermittedSegmentedOption,
} from "@/features/access-control/permitted-segmented";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Flex } from "antd";
import { useMemo, useState } from "react";
import { CandidateTab } from "../tabs/candidate/components/CandidateTab";
import { RecommendationTab } from "../tabs/recommendation";

type Segment = "Candidates" | "Recommended Candidates";

const SEGMENT_OPTIONS: PermittedSegmentedOption<Segment>[] = [
  {
    label: "Candidates",
    value: "Candidates",
    permission: [
      Permission.AdmissionCandidatesList,
      Permission.AdmissionCandidatesManage,
    ],
  },
  {
    label: "Recommended Candidates",
    value: "Recommended Candidates",
    permission: [
      Permission.AdmissionCandidatesList,
      Permission.AdmissionCandidatesManage,
      Permission.AdmissionScreeningsList,
    ],
  },
];

export function AdmissionCandidatePage() {
  const permittedOptions = usePermittedSegmentedOptions(SEGMENT_OPTIONS);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  const activeSegment = useMemo(() => {
    if (
      selectedSegment &&
      permittedOptions.some((opt) => opt.value === selectedSegment)
    ) {
      return selectedSegment;
    }
    return (permittedOptions[0]?.value as Segment) ?? null;
  }, [selectedSegment, permittedOptions]);

  if (permittedOptions.length === 0 || !activeSegment) {
    return null;
  }

  return (
    <Flex vertical gap={20}>
      <PrimarySegmented<Segment>
        options={permittedOptions}
        value={activeSegment}
        onChange={(val) => setSelectedSegment(val as Segment)}
      />
      <ConditionalRenderer when={activeSegment === "Candidates"}>
        <CandidateTab />
      </ConditionalRenderer>
      <ConditionalRenderer when={activeSegment === "Recommended Candidates"}>
        <RecommendationTab />
      </ConditionalRenderer>
    </Flex>
  );
}
