export const installedPlatformOptions = [
  "PC",
  "Xbox",
  "Nintendo",
  "PlayStation",
] as const;

export type InstalledPlatform = (typeof installedPlatformOptions)[number];

const defaultPlatform = "PC" satisfies InstalledPlatform;
const platformSeparator = "|";

function getInstalledPlatform(
  value: FormDataEntryValue | string | null,
): InstalledPlatform | null {
  if (typeof value !== "string") {
    return null;
  }

  return installedPlatformOptions.find(
    (option) => option.toLowerCase() === value.trim().toLowerCase(),
  ) ?? null;
}

export function normalizeInstalledPlatforms(
  values: FormDataEntryValue[],
): InstalledPlatform[] {
  const platforms = values.flatMap((value) => {
    const platform = getInstalledPlatform(value);

    return platform ? [platform] : [];
  });
  const uniquePlatforms = installedPlatformOptions.filter((platform) =>
    platforms.includes(platform),
  );

  return uniquePlatforms.length > 0 ? uniquePlatforms : [defaultPlatform];
}

export function parseInstalledPlatforms(value: string | null): InstalledPlatform[] {
  if (!value) {
    return [];
  }

  const parsedPlatforms = value.split(platformSeparator).flatMap((platform) => {
    const installedPlatform = getInstalledPlatform(platform);

    return installedPlatform ? [installedPlatform] : [];
  });

  return installedPlatformOptions.filter((platform) =>
    parsedPlatforms.includes(platform),
  );
}

export function serializeInstalledPlatforms(platforms: InstalledPlatform[]) {
  return platforms.join(platformSeparator);
}
