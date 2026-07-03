import { Tabs } from "@/components/ui-kit";
import { FeeChargesTab } from "@/features/billing/tabs/fee-charges";
import { FeeEventsTab } from "@/features/billing/tabs/fee-events";
import { FeeItemsTab } from "@/features/billing/tabs/fee-items";
import { FeePoliciesTab } from "@/features/billing/tabs/fee-policies";
import { InvoicesTab } from "@/features/billing/tabs/invoices";
import { PaymentGatewayTab } from "@/features/billing/tabs/payment-gateway";
import { PaymentTransactionsTab } from "@/features/billing/tabs/payment-transactions";
import { PaymentsTab } from "@/features/billing/tabs/payments";
import { PricingRulesTab } from "@/features/billing/tabs/pricing-rules";
import type { ConfigurePricingParams } from "@/features/billing/types/configure-pricing";
import { useState } from "react";

export type { ConfigurePricingParams } from "@/features/billing/types/configure-pricing";

export function BillingPage() {
  const [activeTab, setActiveTab] = useState("fee-events");
  const [policyEventId, setPolicyEventId] = useState<number | null>(null);
  const [pricingEventCode, setPricingEventCode] = useState<string | null>(null);
  const [pricingPolicyId, setPricingPolicyId] = useState<number | null>(null);
  const [pricingCloneFromPolicyId, setPricingCloneFromPolicyId] = useState<
    number | null
  >(null);
  const [feeChargesEventCode, setFeeChargesEventCode] = useState<string | null>(
    null,
  );

  const handleViewPolicy = (eventId: number) => {
    setPolicyEventId(eventId);
    setActiveTab("fee-policies");
  };

  const handleConfigurePricing = ({
    eventCode,
    billableEventPolicyId,
    cloneFromPolicyId,
  }: ConfigurePricingParams) => {
    setPricingEventCode(eventCode);
    setPricingPolicyId(billableEventPolicyId ?? null);
    setPricingCloneFromPolicyId(cloneFromPolicyId ?? null);
    setActiveTab("pricing-rules");
  };

  const handleViewFeeCharges = (eventCode?: string) => {
    setFeeChargesEventCode(eventCode ?? null);
    setActiveTab("fee-charges");
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          if (key !== "fee-policies") {
            setPolicyEventId(null);
          }
          if (key !== "pricing-rules") {
            setPricingEventCode(null);
            setPricingPolicyId(null);
            setPricingCloneFromPolicyId(null);
          }
          if (key !== "fee-charges") {
            setFeeChargesEventCode(null);
          }
        }}
        items={[
          {
            key: "fee-events",
            label: "Fee Event",
            children: (
              <FeeEventsTab
                onViewPolicy={handleViewPolicy}
                onConfigurePricing={handleConfigurePricing}
              />
            ),
          },
          {
            key: "fee-policies",
            label: "Fee Policy",
            children: (
              <FeePoliciesTab
                initialEventId={policyEventId}
                onConfigurePricing={handleConfigurePricing}
                onViewFeeCharges={handleViewFeeCharges}
              />
            ),
          },
          {
            key: "fee-items",
            label: "Fee Items",
            children: <FeeItemsTab />,
          },
          {
            key: "pricing-rules",
            label: "Pricing Rules",
            children: (
              <PricingRulesTab
                initialEventCode={pricingEventCode}
                initialBillableEventPolicyId={pricingPolicyId}
                initialCloneFromPolicyId={pricingCloneFromPolicyId}
                onNavigateToFeePolicy={handleViewPolicy}
                key={`${pricingEventCode ?? "default"}-${pricingPolicyId ?? "p"}-${pricingCloneFromPolicyId ?? "c"}`}
              />
            ),
          },
          {
            key: "payment-gateway",
            label: "Payment Gateway",
            children: <PaymentGatewayTab />,
          },
          {
            key: "fee-charges",
            label: "Fee Charges",
            children: (
              <FeeChargesTab
                initialEventCode={feeChargesEventCode}
                key={feeChargesEventCode ?? "default-charges"}
              />
            ),
          },
          {
            key: "invoices",
            label: "Invoices",
            children: <InvoicesTab key="invoices-tab" />,
          },
          {
            key: "payments",
            label: "Payments",
            children: <PaymentsTab key="payments-tab" />,
          },
          {
            key: "payment-transactions",
            label: "Transactions",
            children: <PaymentTransactionsTab key="transactions-tab" />,
          },
        ]}
        defaultActiveKey="fee-events"
        size="md"
        density="compact"
        variant="filled"
        aria-label="Billing configuration navigation"
      />
    </div>
  );
}
