import { PrimarySegmented } from "@/components/ui-kit/tabs";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Flex } from "antd";
import { useState } from "react";
import { CandidateTab } from "../tabs/candidate/components/CandidateTab";
import { RecommendationTab } from "../tabs/recommendation";

type Segment = "Candidates" | "Recommended Candidates";

export function AdmissionCandidatePage() {
  const [activeSegment, setActiveSegment] = useState<Segment>("Candidates");

  return (
    <Flex vertical gap={20}>
      <PrimarySegmented<Segment>
        options={["Candidates", "Recommended Candidates"]}
        value={activeSegment}
        onChange={setActiveSegment}
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
