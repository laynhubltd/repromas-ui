export default function UnknownDomain({ hostname }: { hostname: string }) {
    return (
        <div style={{ padding: 24, textAlign: "center" }}>
            <h2>Unsupported Domain</h2>
            <p>
                Host <strong>{hostname}</strong> is not mapped to this environment.
            </p>
        </div>
    );
}