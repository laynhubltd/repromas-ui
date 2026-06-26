import { describe, expect, it } from "vitest";
import { buildAcknowledgementSlipModel } from "./buildAcknowledgementSlipModel";
import type { MeAdmissionApplication } from "../types/me-admission-application";

const baseApplication = (
  overrides: Partial<MeAdmissionApplication> = {},
): MeAdmissionApplication => ({
  id: 10,
  candidateId: 5,
  appliedProgramId: 1,
  offeredProgramId: null,
  applicationStatus: "SUBMITTED",
  finalDecision: "PENDING",
  isMatriculated: false,
  updatedAt: "2026-01-15T10:00:00Z",
  candidate: {
    id: 5,
    cycleId: 2,
    jambRegNo: "123456789AB",
    firstName: "Ada",
    lastName: "Okafor",
    dateOfBirth: null,
    gender: "FEMALE",
    stateId: 1,
    lgaId: null,
    email: "ada@example.com",
    phone: null,
    entryMode: "JAMB",
    metadata: null,
    createdAt: "2026-01-01T00:00:00Z",
    cycle: {
      id: 2,
      sessionId: 1,
      name: "2025/2026",
      status: "OPEN",
      startDate: null,
      endDate: null,
    },
    jambScores: [],
    olevelSittings: [],
  },
  appliedProgram: {
    id: 1,
    name: "Computer Science",
  },
  ...overrides,
});

describe("buildAcknowledgementSlipModel", () => {
  it("returns null for draft applications", () => {
    expect(
      buildAcknowledgementSlipModel({
        application: baseApplication({ applicationStatus: "DRAFT" }),
        profilePictureUrl: null,
        logoUrl: null,
        schoolName: "Test University",
      }),
    ).toBeNull();
  });

  it("maps submitted application fields", () => {
    const model = buildAcknowledgementSlipModel({
      application: baseApplication(),
      profilePictureUrl: "https://cdn.example/photo.jpg",
      logoUrl: "https://cdn.example/logo.png",
      schoolName: "Test University",
    });

    expect(model).toMatchObject({
      applicantName: "Ada Okafor",
      jambRegNo: "123456789AB",
      programmeName: "Computer Science",
      cycleName: "2025/2026",
      candidateId: 5,
      applicationId: 10,
      acknowledgementNumber: "APP-2-10",
      profilePictureUrl: "https://cdn.example/photo.jpg",
      schoolName: "Test University",
    });
    expect(model?.verifyUrl).toContain("ref=10");
  });

  it("handles missing JAMB reg number", () => {
    const model = buildAcknowledgementSlipModel({
      application: baseApplication({
        candidate: {
          ...baseApplication().candidate!,
          jambRegNo: null,
        },
      }),
      profilePictureUrl: null,
      logoUrl: null,
      schoolName: null,
    });

    expect(model?.jambRegNo).toBeNull();
    expect(model?.applicantName).toBe("Ada Okafor");
  });
});
