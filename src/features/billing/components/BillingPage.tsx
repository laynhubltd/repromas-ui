import { Tabs } from "@/components/ui-kit";
import { BillablesTab } from "@/features/billing/tabs/billables";
import { FeeItemsTab } from "@/features/billing/tabs/fee-items";
import { PricingRulesTab } from "@/features/billing/tabs/pricing-rules";

export function BillingPage() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <Tabs
        items={[
          {
            key: "billables",
            label: "Fees Config",
            children: <BillablesTab />,
          },
          {
            key: "fee-items",
            label: "Fee Items",
            children: <FeeItemsTab />,
          },
          {
            key: "pricing-rules",
            label: "Pricing Rules",
            children: <PricingRulesTab />,
          },
        ]}
        defaultActiveKey="billables"
        size="md"
        density="spacious"
        variant="default"
        aria-label="Billing configuration navigation"
      />
    </div>
  );
}
