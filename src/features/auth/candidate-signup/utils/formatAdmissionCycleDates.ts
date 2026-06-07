import dayjs from "dayjs";

type CycleDateFields = {
  startDate: string | null;
  endDate: string | null;
};

export function formatAdmissionCycleDates(
  config: CycleDateFields,
): string | null {
  if (!config.startDate && !config.endDate) return null;
  const start = config.startDate
    ? dayjs(config.startDate).format("MMM D, YYYY")
    : null;
  const end = config.endDate
    ? dayjs(config.endDate).format("MMM D, YYYY")
    : null;
  if (start && end) return `Applications open ${start} – ${end}`;
  if (end) return `Applications open until ${end}`;
  if (start) return `Applications open from ${start}`;
  return null;
}
