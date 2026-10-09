type HeaderReader = {
  get(name: string): string | null;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getFirstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() ?? null;
}

export function getSiteUrl(headerStore?: HeaderReader) {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? null;

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  const forwardedHost = getFirstHeaderValue(
    headerStore?.get("x-forwarded-host") ?? null,
  );
  const host = forwardedHost ?? getFirstHeaderValue(headerStore?.get("host") ?? null);

  if (host) {
    const forwardedProto = getFirstHeaderValue(
      headerStore?.get("x-forwarded-proto") ?? null,
    );
    const protocol =
      forwardedProto ?? (host.includes("localhost") ? "http" : "https");

    return `${protocol}://${host}`;
  }

  const origin = getFirstHeaderValue(headerStore?.get("origin") ?? null);

  if (origin) {
    return trimTrailingSlash(origin);
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/profile";
  }

  return value;
}
