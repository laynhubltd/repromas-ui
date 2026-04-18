import { PrimarySegmented } from "@/components/ui-kit";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Flex } from "antd";
import { useState } from "react";
import { CourseConfigurationsTab } from "../tabs/course-configurations";
import { CoursesTab } from "../tabs/courses";

type Segment = "Courses" | "Course Config";

export const CoursePage = () => {
  const [activeSegment, setActiveSegment] = useState<Segment>("Courses");

  return (
    <Flex vertical gap={20}>
      <PrimarySegmented<Segment>
        options={["Courses", "Course Config"]}
        value={activeSegment}
        onChange={setActiveSegment}
      />
      <ConditionalRenderer when={activeSegment === "Courses"}>
        <CoursesTab />
      </ConditionalRenderer>
      <ConditionalRenderer when={activeSegment === "Course Config"}>
        <CourseConfigurationsTab />
      </ConditionalRenderer>
    </Flex>
  );
};
