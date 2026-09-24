import { PrimarySegmented } from "@/components/ui-kit";
import { Permission } from "@/features/access-control/permissions";
import {
  usePermittedSegmentedOptions,
  type PermittedSegmentedOption,
} from "@/features/access-control/permitted-segmented";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Flex } from "antd";
import { useMemo, useState } from "react";
import { CreditLimitsTab } from "../tabs/credit-limits";
import { GraduationConfigTab } from "../tabs/graduation-config";
import { ProgramsTab } from "../tabs/programs";

type Segment = "Programs" | "Program Config" | "Credit Limits";

const SEGMENT_OPTIONS: PermittedSegmentedOption<Segment>[] = [
  {
    label: "Programs",
    value: "Programs",
    permission: [Permission.ProgramsList, Permission.ProgramsManage],
  },
  {
    label: "Program Config",
    value: "Program Config",
    permission: [
      Permission.GraduationRequirementsList,
      Permission.GraduationRequirementsManage,
      Permission.ProgramsManage,
    ],
  },
  {
    label: "Credit Limits",
    value: "Credit Limits",
    permission: [
      Permission.RegistrationCreditLimitsList,
      Permission.RegistrationCreditLimitsManage,
      Permission.ProgramsManage,
    ],
  },
];

export const ProgramPage = () => {
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
      <ConditionalRenderer when={activeSegment === "Programs"}>
        <ProgramsTab />
      </ConditionalRenderer>
      <ConditionalRenderer when={activeSegment === "Program Config"}>
        <GraduationConfigTab />
      </ConditionalRenderer>
      <ConditionalRenderer when={activeSegment === "Credit Limits"}>
        <CreditLimitsTab />
      </ConditionalRenderer>
    </Flex>
  );
};
