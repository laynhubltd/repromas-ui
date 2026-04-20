export type HostKind = "apex" | "tenant" | "unknown";

export type HostResolution = {
  kind: HostKind;
  hostname: string;
  tenantSlug: string | null;
  apexDomain: string;
};

type ResolveHostOptions = {
  apexDomain?: string;
};

const LOCALHOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function resolveHost(
  rawHostname: string,
  options: ResolveHostOptions = {},
): HostResolution {
  const hostname = normalizeHostname(rawHostname);
  const apexDomain = normalizeApexDomain(options.apexDomain);

  console.log({ hostname, apexDomain });

  if (!hostname) {
    return {
      kind: "unknown",
      hostname,
      tenantSlug: null,
      apexDomain,
    };
  }

  if (LOCALHOSTS.has(hostname)) {
    return {
      kind: "apex",
      hostname,
      tenantSlug: null,
      apexDomain,
    };
  }

  if (hostname.endsWith(".localhost")) {
    const slug = hostname.slice(0, -".localhost".length);
    if (isValidSlug(slug)) {
      return {
        kind: "tenant",
        hostname,
        tenantSlug: slug,
        apexDomain,
      };
    }
    return {
      kind: "unknown",
      hostname,
      tenantSlug: null,
      apexDomain,
    };
  }

  if (hostname === apexDomain || hostname === `www.${apexDomain}`) {
    return {
      kind: "apex",
      hostname,
      tenantSlug: null,
      apexDomain,
    };
  }

  const suffix = `.${apexDomain}`;
  if (hostname.endsWith(suffix)) {
    const slug = hostname.slice(0, -suffix.length);
    console.log({ slug });
    if (isValidSlug(slug)) {
      return {
        kind: "tenant",
        hostname,
        tenantSlug: slug,
        apexDomain,
      };
    }
  }

  return {
    kind: "unknown",
    hostname,
    tenantSlug: null,
    apexDomain,
  };
}

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase();
}

function normalizeApexDomain(apexDomain?: string): string {
  const value = (apexDomain ?? "repromas.app").trim().toLowerCase();
  return value.replace(/^\.+|\.+$/g, "");
}

function isValidSlug(value: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value);
}
