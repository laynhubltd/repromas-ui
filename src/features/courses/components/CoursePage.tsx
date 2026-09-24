import { PrimarySegmented } from "@/components/ui-kit";
import { Permission } from "@/features/access-control/permissions";
import {
  usePermittedSegmentedOptions,
  type PermittedSegmentedOption,
} from "@/features/access-control/permitted-segmented";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Flex } from "antd";
import { useMemo, useState } from "react";
import { CourseAssessmentPolicyTab } from "../tabs/course-assessment-policy";
import { CourseConfigurationsTab } from "../tabs/course-configurations";
import { CoursesTab } from "../tabs/courses";

type Segment = "Courses" | "Course Config" | "Assessment Policy";

const SEGMENT_OPTIONS: PermittedSegmentedOption<Segment>[] = [
  {
    label: "Courses",
    value: "Courses",
    permission: [Permission.CoursesList, Permission.CoursesManage],
  },
  {
    label: "Course Config",
    value: "Course Config",
    permission: [
      Permission.CourseConfigurationsList,
      Permission.CourseConfigurationsManage,
      Permission.CoursesManage,
    ],
  },
  {
    label: "Assessment Policy",
    value: "Assessment Policy",
    permission: [
      Permission.CourseAssessmentPoliciesList,
      Permission.CourseAssessmentPoliciesCreate,
      Permission.CourseAssessmentPoliciesUpdate,
      Permission.CourseConfigurationsManage,
      Permission.CoursesManage,
    ],
  },
];

export const CoursePage = () => {
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
      <ConditionalRenderer when={activeSegment === "Courses"}>
        <CoursesTab />
      </ConditionalRenderer>
      <ConditionalRenderer when={activeSegment === "Course Config"}>
        <CourseConfigurationsTab />
      </ConditionalRenderer>
      <ConditionalRenderer when={activeSegment === "Assessment Policy"}>
        <CourseAssessmentPolicyTab />
      </ConditionalRenderer>
    </Flex>
  );
};
