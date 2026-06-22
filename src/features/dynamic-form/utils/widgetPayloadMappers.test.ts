import { describe, expect, it } from "vitest";
import {
  jambWidgetFromWire,
  jambWidgetToWire,
  olevelSittingFromWire,
  olevelSittingToWire,
  olevelWidgetFromWire,
  olevelWidgetToWire,
  sectionValuesToSubmitPayload,
  validateOlevelWidgetValue,
} from "./widgetPayloadMappers";
import type { RenderSection } from "../types/dynamic-form";

describe("olevelWidgetPayloadMappers", () => {
  it("maps camelCase API read data to camelCase UI state", () => {
    const wire = {
      sittings: [
        {
          examType: "WAEC",
          examYear: 2018,
          examRegNo: "637846538GH",
          schoolName: "GTTS",
          centerNumber: "445",
          grades: [{ subjectId: 102, grade: "C5" }],
        },
      ],
    };

    expect(olevelWidgetFromWire(wire)).toEqual({
      sittings: [
        {
          examType: "WAEC",
          examYear: 2018,
          examRegNo: "637846538GH",
          schoolName: "GTTS",
          centerNumber: "445",
          grades: [{ subjectId: 102, grade: "C5" }],
        },
      ],
    });
  });

  it("maps snake_case draft payload to camelCase UI state", () => {
    const wire = {
      sittings: [
        {
          exam_type: "WAEC",
          exam_year: 2018,
          exam_reg_no: "637846538GH",
          school_name: "GTTS",
          center_number: "445",
          grades: [{ subject_id: 102, grade: "C5" }],
        },
      ],
    };

    expect(olevelWidgetFromWire(wire).sittings[0]?.examYear).toBe(2018);
    expect(olevelWidgetFromWire(wire).sittings[0]?.grades?.[0]?.subjectId).toBe(
      102,
    );
  });

  it("maps camelCase UI state to snake_case submit payload", () => {
    const ui = {
      sittings: [
        {
          examType: "WAEC",
          examYear: 2018,
          examRegNo: "637846538GH",
          schoolName: "GTTS",
          centerNumber: "445",
          grades: [
            { subjectId: 102, grade: "C5" },
            { subjectId: 103, grade: "C5" },
          ],
        },
      ],
    };

    expect(olevelWidgetToWire(ui)).toEqual({
      sittings: [
        {
          exam_type: "WAEC",
          exam_year: 2018,
          exam_reg_no: "637846538GH",
          school_name: "GTTS",
          center_number: "445",
          grades: [
            { subject_id: 102, grade: "C5" },
            { subject_id: 103, grade: "C5" },
          ],
        },
      ],
    });
  });

  it("maps examYear 2018 to exam_year 2018 in sitting mapper", () => {
    expect(
      olevelSittingToWire(
        olevelSittingFromWire({
          examType: "WAEC",
          examYear: 2018,
          examRegNo: "637846538GH",
        }),
      ),
    ).toEqual({
      exam_type: "WAEC",
      exam_year: 2018,
      exam_reg_no: "637846538GH",
      center_number: undefined,
      school_name: undefined,
      grades: [],
    });
  });
});

describe("jambWidgetPayloadMappers", () => {
  it("maps camelCase UI to snake_case submit with subject_id only", () => {
    const ui = {
      scores: [
        { subjectId: 103, score: 62 },
        { subjectId: 107, score: 59 },
      ],
    };

    expect(jambWidgetToWire(ui)).toEqual({
      scores: [
        { subject_id: 103, score: 62 },
        { subject_id: 107, score: 59 },
      ],
    });
  });

  it("does not emit subjectId in submit rows", () => {
    const submit = jambWidgetToWire({
      scores: [{ subjectId: 103, score: 62 }],
    });
    expect(submit.scores[0]).not.toHaveProperty("subjectId");
    expect(submit.scores[0]).toHaveProperty("subject_id", 103);
  });

  it("reads subject_id from wire into camelCase UI", () => {
    expect(
      jambWidgetFromWire({
        scores: [{ subject_id: 103, score: 62 }],
      }),
    ).toEqual({
      scores: [{ subjectId: 103, score: 62 }],
    });
  });
});

describe("sectionValuesToSubmitPayload", () => {
  const section: RenderSection = {
    id: 28,
    title: "O-Level",
    stepOrder: 2,
    fields: [
      {
        fieldKey: "olevel_results",
        label: "O-Level",
        helpText: null,
        fieldType: "WIDGET_OLEVEL",
        isRequired: true,
        isReadOnly: false,
        displayOrder: 1,
        options: null,
        ui: null,
      },
      {
        fieldKey: "firstName",
        label: "First name",
        helpText: null,
        fieldType: "TEXT",
        isRequired: true,
        isReadOnly: false,
        displayOrder: 2,
        options: null,
        ui: null,
      },
    ],
  };

  it("keeps biodata camelCase and converts widget fields to snake_case", () => {
    const values = {
      firstName: "Ada",
      olevel_results: {
        sittings: [
          {
            examType: "WAEC",
            examYear: 2018,
            examRegNo: "637846538GH",
            grades: [{ subjectId: 102, grade: "C5" }],
          },
        ],
      },
    };

    expect(sectionValuesToSubmitPayload(section, values)).toEqual({
      firstName: "Ada",
      olevel_results: {
        sittings: [
          {
            exam_type: "WAEC",
            exam_year: 2018,
            exam_reg_no: "637846538GH",
            center_number: undefined,
            school_name: undefined,
            grades: [{ subject_id: 102, grade: "C5" }],
          },
        ],
      },
    });
  });
});

describe("validateOlevelWidgetValue", () => {
  it("rejects missing exam year", () => {
    const message = validateOlevelWidgetValue("olevel_results", {
      sittings: [
        {
          examType: "WAEC",
          examRegNo: "ABC",
          grades: [{ subjectId: 1, grade: "C5" }],
        },
      ],
    });
    expect(message).toMatch(/exam year/i);
  });

  it("rejects duplicate subject in a sitting", () => {
    const message = validateOlevelWidgetValue("olevel_results", {
      sittings: [
        {
          examType: "WAEC",
          examYear: 2018,
          examRegNo: "ABC",
          grades: [
            { subjectId: 102, grade: "C5" },
            { subjectId: 102, grade: "B3" },
          ],
        },
      ],
    });
    expect(message).toMatch(/duplicate subject/i);
  });
});
