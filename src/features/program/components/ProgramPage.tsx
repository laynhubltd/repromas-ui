import { PrimarySegmented } from "@/components/ui-kit";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Flex } from "antd";
import { useState } from "react";
import { GraduationConfigTab } from "../tabs/graduation-config";
import { ProgramsTab } from "../tabs/programs";

type Segment = "Programs" | "Program Config";

export const ProgramPage = () => {
  const [activeSegment, setActiveSegment] = useState<Segment>("Programs");

  return (
    <Flex vertical gap={20}>
      <PrimarySegmented<Segment>
        options={["Programs", "Program Config"]}
        value={activeSegment}
        onChange={setActiveSegment}
      />
      <ConditionalRenderer when={activeSegment === "Programs"}>
        <ProgramsTab />
      </ConditionalRenderer>
      <ConditionalRenderer when={activeSegment === "Program Config"}>
        <GraduationConfigTab />
      </ConditionalRenderer>
    </Flex>
  );
};
