export default function InstitutionNotActive({ tenantSlug }: { tenantSlug: string }) {
    return (
        <div style={{ padding: 24, textAlign: "center" }}>
            <h2>Institution Not Active</h2>
            <p>
                Institution <strong>{tenantSlug}</strong> is not currently active.
            </p>
        </div>
    );
}