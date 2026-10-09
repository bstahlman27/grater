"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  cacheRawgGame,
  saveReviewForGame,
  toggleInstalledGame,
  togglePlayLaterGame,
} from "@/data/grater";

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

export async function cacheRawgGameAction(formData: FormData) {
  const rawgId = Number(formData.get("rawgId"));

  if (!Number.isInteger(rawgId) || rawgId <= 0) {
    throw new Error("A valid RAWG game id is required.");
  }

  const game = await cacheRawgGame(rawgId);

  revalidateGameLists(game.slug);
  redirect(`/games/${game.slug}`);
}

export async function togglePlayLaterAction(formData: FormData) {
  const slug = getGameSlug(formData);

  await togglePlayLaterGame(slug);
  revalidateGameLists(slug);
}

export async function toggleInstalledAction(formData: FormData) {
  const slug = getGameSlug(formData);

  await toggleInstalledGame(slug);
  revalidateGameLists(slug);
}

export async function saveReviewAction(formData: FormData) {
  const slug = getGameSlug(formData);
  const rating = Number(formData.get("rating"));
  const rawBody = formData.get("body");
  const rawVisibility = formData.get("visibility");

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5 stars.");
  }

  const body = typeof rawBody === "string" ? rawBody.trim() : "";
  const visibility = rawVisibility === "private" ? "private" : "friends";

  await saveReviewForGame(slug, {
    body: body || null,
    containsSpoilers: formData.get("containsSpoilers") === "on",
    rating,
    visibility,
  });
  revalidateGameLists(slug);
}
