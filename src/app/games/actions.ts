"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  cacheRawgGame,
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
