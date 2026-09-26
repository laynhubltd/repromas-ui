import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import { baseApi } from "@/app/api/baseApi";
import type { ScoreColumn, ScoreSheetRow } from "../types/score-sheet";
import { ScoreSheetTable } from "./ScoreSheetTable";

function makeStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
}

describe("ScoreSheetTable isLocked Invariant", () => {
  const mockColumns: ScoreColumn[] = [
    {
      code: "CA",
      name: "Continuous Assessment",
      weightPercentage: 40,
      subComponents: [],
    },
    {
      code: "EXAM",
      name: "Examination",
      weightPercentage: 60,
      subComponents: [],
    },
  ];

  const mockRows: ScoreSheetRow[] = [
    {
      id: 101,
      registrationId: 501,
      configId: 99,
      regNo: "ST/2026/001",
      fullName: "Fatima Aliyu",
      scores: { CA: 32, EXAM: 48 },
      totalScore: 80,
      grade: "A",
      gradePoint: 4.0,
      isPass: true,
      wasVetoed: false,
      vetoReason: null,
      evaluationStatusId: 1,
      displayGrade: "A",
      evaluationStatusSource: "SYSTEM",
      evaluationStatuses: [
        {
          id: 1,
          code: "NORMAL",
          name: "Normal",
          isDefault: true,
          isStandardGraded: true,
          computesInGpa: true,
          earnsCredit: true,
          requiresRetake: false,
        },
      ],
    },
  ];

  it("renders WorkflowLockBanner and disables inputs when isLocked is true", () => {
    render(
      <Provider store={makeStore()}>
        <ScoreSheetTable
          columns={mockColumns}
          rows={mockRows}
          isLocked={true}
          stepName="Dean Approval"
        />
      </Provider>,
    );

    expect(screen.getByText(/Score entry locked/i)).toBeInTheDocument();
    expect(screen.getByText(/currently at step "Dean Approval"/i)).toBeInTheDocument();

    const caInput = screen.getByLabelText(/Score for CA/i);
    expect(caInput).toBeDisabled();

    const examInput = screen.getByLabelText(/Score for EXAM/i);
    expect(examInput).toBeDisabled();
  });
});
