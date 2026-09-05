import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePdfExport } from "./usePdfExport";

const mockDownloadFileFromUrl = vi.fn();
vi.mock("@/shared/utils/download/downloadFile", () => ({
  downloadFileFromUrl: (...args: unknown[]) => mockDownloadFileFromUrl(...args),
}));

vi.mock("react-redux", () => ({
  useStore: () => ({
    getState: () => ({ auth: { token: "fake-jwt-token" } }),
  }),
}));

describe("usePdfExport", () => {
  it("streams binary PDF blob with proper filename and query parameters", async () => {
    mockDownloadFileFromUrl.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() =>
      usePdfExport(
        {
          programId: 10,
          levelId: 100,
          sessionId: 1,
          semesterTypeId: 2,
        },
        {
          programName: "Computer Science",
          sessionName: "2024/2025",
          semesterTypeName: "First Semester",
        },
      ),
    );

    await act(async () => {
      await result.current.handleExportPdf();
    });

    expect(mockDownloadFileFromUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("/results/broadsheet/pdf?"),
        filename: "broadsheet_computer_science_2024_2025_first_semester.pdf",
        accept: "application/pdf",
      }),
      expect.anything(),
    );
  });
});
