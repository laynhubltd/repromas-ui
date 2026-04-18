export default function TenantClaimMismatch() {
    return (
        <div style={{ padding: 24, textAlign: "center" }}>
            <h2>Tenant Access Denied</h2>
            <p>Your authenticated profile does not match this tenant domain.</p>
        </div>
    );
}