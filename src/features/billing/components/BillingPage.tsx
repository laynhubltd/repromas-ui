import { Tabs } from "@/components/ui-kit";
import { Permission } from "@/features/access-control/permissions";
import { useAccessControl } from "@/features/access-control/use-access-control";
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
import { useMemo, useState } from "react";

export type { ConfigurePricingParams } from "@/features/billing/types/configure-pricing";

export function BillingPage() {
  const { isPermitted } = useAccessControl();
  const [activeTab, setActiveTab] = useState<string | null>(null);
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

  const allBillingTabs = useMemo(
    () => [
      {
        key: "fee-events",
        label: "Fee Event",
        permission: [
          Permission.BillingBillableEventsList,
          Permission.BillingBillableEventsManage,
        ],
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
        permission: [
          Permission.BillingBillableEventPoliciesList,
          Permission.BillingBillableEventPoliciesManage,
        ],
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
        permission: [
          Permission.BillingFeeItemsList,
          Permission.BillingFeeItemsManage,
        ],
        children: <FeeItemsTab />,
      },
      {
        key: "pricing-rules",
        label: "Pricing Rules",
        permission: [
          Permission.BillingPricingRulesList,
          Permission.BillingPricingRulesManage,
        ],
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
        permission: [
          Permission.TenantPaymentGatewayConfigsList,
          Permission.TenantPaymentGatewayConfigsManage,
        ],
        children: <PaymentGatewayTab />,
      },
      {
        key: "fee-charges",
        label: "Fee Charges",
        permission: [
          Permission.BillingFeeChargesList,
          Permission.BillingFeeChargesManage,
        ],
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
        permission: [
          Permission.BillingInvoicesList,
          Permission.BillingInvoicesManage,
        ],
        children: <InvoicesTab key="invoices-tab" />,
      },
      {
        key: "payments",
        label: "Payments",
        permission: [
          Permission.BillingPaymentsList,
          Permission.BillingPaymentsManage,
        ],
        children: <PaymentsTab key="payments-tab" />,
      },
      {
        key: "payment-transactions",
        label: "Transactions",
        permission: [
          Permission.BillingPaymentTransactionsList,
          Permission.BillingPaymentTransactionsManage,
        ],
        children: <PaymentTransactionsTab key="transactions-tab" />,
      },
    ],
    [
      policyEventId,
      pricingEventCode,
      pricingPolicyId,
      pricingCloneFromPolicyId,
      feeChargesEventCode,
    ],
  );

  const permittedTabs = useMemo(
    () => allBillingTabs.filter((tab) => isPermitted(tab.permission)),
    [allBillingTabs, isPermitted],
  );

  const resolvedActiveKey = useMemo(() => {
    if (activeTab && permittedTabs.some((t) => t.key === activeTab)) {
      return activeTab;
    }
    return permittedTabs[0]?.key ?? "";
  }, [activeTab, permittedTabs]);

  if (permittedTabs.length === 0) {
    return null;
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <Tabs
        activeKey={resolvedActiveKey}
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
        items={permittedTabs.map(({ permission: _, ...rest }) => rest)}
        size="md"
        density="compact"
        variant="filled"
        aria-label="Billing configuration navigation"
      />
    </div>
  );
}
