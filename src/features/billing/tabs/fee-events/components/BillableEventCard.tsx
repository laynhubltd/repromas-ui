import type { BillablesTabLabelMaps } from "../hooks/useBillablesTab";
import type { BillableEvent } from "../types/billable-event";
import { FeeEventCard } from "./FeeEventCard";

type BillableEventCardProps = {
  billableEvent: BillableEvent;
  labelMaps: BillablesTabLabelMaps;
  onEdit: (billableEvent: BillableEvent) => void;
  onEditPolicy?: () => void;
  onDelete: (billableEvent: BillableEvent) => void;
};

export function BillableEventCard({
  billableEvent,
  labelMaps,
  onEdit,
  onEditPolicy,
  onDelete,
}: BillableEventCardProps) {
  return (
    <FeeEventCard
      billableEvent={billableEvent}
      labelMaps={labelMaps}
      onEdit={onEdit}
      onViewPolicy={onEditPolicy}
      onDelete={onDelete}
    />
  );
}
