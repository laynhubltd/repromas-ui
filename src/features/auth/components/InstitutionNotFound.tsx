export default function InstitutionNotFound({ tenantSlug }: { tenantSlug: string }) {
    return (
        <div style={{ padding: 24, textAlign: "center" }}>
            <h2>Institution Not Found</h2>
            <p>
                Could not find an institution for slug <strong>{tenantSlug}</strong>.
            </p>
        </div>
    );
}