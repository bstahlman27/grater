import type { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileIdentity = {
  id: string;
  username: string;
  displayName: string | null;
  email: string | null;
};

function normalizeUsername(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  return normalized || "player";
}

function getBaseUsername(user: User) {
  const metadataUsername = user.user_metadata?.username;
  const metadataName = user.user_metadata?.name;

  if (typeof metadataUsername === "string" && metadataUsername.trim()) {
    return normalizeUsername(metadataUsername);
  }

  if (typeof metadataName === "string" && metadataName.trim()) {
    return normalizeUsername(metadataName);
  }

  if (user.email) {
    return normalizeUsername(user.email.split("@")[0] ?? "player");
  }

  return `player-${user.id.slice(0, 8)}`;
}

async function getAvailableUsername(baseUsername: string, authUserId: string) {
  const suffix = authUserId.slice(0, 6);
  const candidates = [
    baseUsername,
    `${baseUsername}-${suffix}`,
    `player-${suffix}`,
  ];

  for (const candidate of candidates) {
    const existingProfile = await prisma.profile.findUnique({
      where: {
        username: candidate,
      },
      select: {
        id: true,
      },
    });

    if (!existingProfile) {
      return candidate;
    }
  }

  return `player-${authUserId.slice(0, 12)}`;
}

export async function getSupabaseUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function ensureProfileForUser(user: User): Promise<ProfileIdentity> {
  const existingProfile = await prisma.profile.findUnique({
    where: {
      authUserId: user.id,
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
    },
  });

  if (existingProfile) {
    return existingProfile;
  }

  if (user.email) {
    const profileWithEmail = await prisma.profile.findUnique({
      where: {
        email: user.email,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
      },
    });

    if (profileWithEmail) {
      return prisma.profile.update({
        where: {
          id: profileWithEmail.id,
        },
        data: {
          authUserId: user.id,
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          email: true,
        },
      });
    }
  }

  const username = await getAvailableUsername(getBaseUsername(user), user.id);

  return prisma.profile.create({
    data: {
      authUserId: user.id,
      email: user.email ?? null,
      username,
      displayName: username,
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
    },
  });
}

export async function getSignedInProfile() {
  const user = await getSupabaseUser();

  if (!user) {
    return null;
  }

  return ensureProfileForUser(user);
}

export async function requireSignedInProfile() {
  const profile = await getSignedInProfile();

  if (!profile) {
    throw new Error("You must be signed in to change your lists.");
  }

  return profile;
}
