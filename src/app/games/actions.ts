"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  cacheRawgGame,
  removePlayLaterGame,
  removeInstalledGame,
  saveInstalledGame,
  savePlayLaterGame,
  saveReviewForGame,
} from "@/data/grater";
import { normalizeInstalledPlatforms } from "@/lib/platforms";

function getGameSlug(formData: FormData) {
  const slug = formData.get("slug");

  if (typeof slug !== "string" || !slug.trim()) {
    throw new Error("A valid game slug is required.");
  }

  return slug;
}

function revalidateGameLists(slug: string) {
  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath(`/games/${slug}`);
  revalidatePath("/profile");
}

function getVisibility(formData: FormData) {
  return formData.get("visibility") === "private" ? "private" : "friends";
}

export async function cacheRawgGameAction(formData: FormData) {
  const rawgId = Number(formData.get("rawgId"));

  if (!Number.isInteger(rawgId) || rawgId <= 0) {
    throw new Error("A valid game id is required.");
  }

  const game = await cacheRawgGame(rawgId);

  revalidateGameLists(game.slug);
  redirect(`/games/${game.slug}`);
}

export async function togglePlayLaterAction(formData: FormData) {
  const slug = getGameSlug(formData);
  const intent = formData.get("intent");

  if (intent === "remove") {
    await removePlayLaterGame(slug);
  } else {
    await savePlayLaterGame(slug, {
      visibility: getVisibility(formData),
    });
  }
  revalidateGameLists(slug);
}

export async function toggleInstalledAction(formData: FormData) {
  const slug = getGameSlug(formData);
  const intent = formData.get("intent");

  if (intent === "remove") {
    await removeInstalledGame(slug);
  } else {
    await saveInstalledGame(
      slug,
      normalizeInstalledPlatforms(formData.getAll("platforms")),
      {
        visibility: getVisibility(formData),
      },
    );
  }

  revalidateGameLists(slug);
}

export async function saveReviewAction(formData: FormData) {
  const slug = getGameSlug(formData);
  const rating = Number(formData.get("rating"));
  const rawBody = formData.get("body");

  if (
    !Number.isFinite(rating) ||
    rating < 0.5 ||
    rating > 5 ||
    !Number.isInteger(rating * 2)
  ) {
    throw new Error("Rating must be between 0.5 and 5 stars.");
  }

  const body = typeof rawBody === "string" ? rawBody.trim() : "";
  await saveReviewForGame(slug, {
    body: body || null,
    containsSpoilers: formData.get("containsSpoilers") === "on",
    rating,
    visibility: getVisibility(formData),
  });
  revalidateGameLists(slug);
}
