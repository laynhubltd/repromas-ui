// Feature: assessment
import { StepCard } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import {
    ApartmentOutlined,
    BookOutlined,
    FileTextOutlined,
    RadiusSettingOutlined,
} from "@ant-design/icons";
import { Flex, Typography } from "antd";

type ScoreSheetGuideProps = {
  hasProgram: boolean;
  hasLevel: boolean;
};

export function ScoreSheetGuide({
  hasProgram,
  hasLevel,
}: ScoreSheetGuideProps) {
  const token = useToken();

  const step1Done = hasProgram;
  const step2Done = hasProgram && hasLevel;
  const step3Active = step2Done;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: `${token.paddingXL}px ${token.paddingMD}px`,
        gap: token.marginLG,
      }}
    >
      {/* Hero icon + headline */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: token.colorPrimaryBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            marginBottom: token.marginMD,
            boxShadow: token.boxShadow,
          }}
        >
          <FileTextOutlined
            style={{ fontSize: 32, color: token.colorPrimary }}
          />
        </div>
        <Typography.Title
          level={4}
          style={{ margin: 0, color: token.colorText }}
        >
          Load a Score Sheet
        </Typography.Title>
        <Typography.Text
          type="secondary"
          style={{
            fontSize: token.fontSize,
            marginTop: token.marginXS,
            display: "block",
          }}
        >
          Complete the three steps below to view and enter student scores.
        </Typography.Text>
      </div>

      {/* Step cards */}
      <Flex
        gap={token.marginLG}
        wrap="wrap"
        justify="center"
        style={{ width: "100%", maxWidth: 720, paddingTop: token.paddingSM }}
      >
        <StepCard
          stepNumber={1}
          icon={<RadiusSettingOutlined />}
          title="Select a Program"
          description="Choose the academic program from the dropdown above."
          done={step1Done}
          active={!step1Done}
        />
        <StepCard
          stepNumber={2}
          icon={<ApartmentOutlined />}
          title="Select a Level"
          description="Pick the year or level within that program."
          done={step2Done}
          active={step1Done && !step2Done}
        />
        <StepCard
          stepNumber={3}
          icon={<BookOutlined />}
          title="Select a Course"
          description="Choose a course configuration to load its score sheet."
          done={false}
          active={step3Active}
        />
      </Flex>
    </div>
  );
}
