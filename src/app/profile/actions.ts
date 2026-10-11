"use server";

import { revalidatePath } from "next/cache";
import { requireSignedInProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  addReviewComment,
  deleteReview,
  deleteReviewComment,
  togglePinnedReview,
  toggleReviewVote,
  updateReviewComment,
} from "@/data/grater";

const maxAvatarSize = 750 * 1024;
const allowedAvatarTypes = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getTrimmedString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

async function getAvatarDataUrl(formData: FormData) {
  const shouldRemoveAvatar = formData.get("removeAvatar") === "on";

  if (shouldRemoveAvatar) {
    return null;
  }

  const avatarFile = formData.get("avatarFile");

  if (!(avatarFile instanceof File) || avatarFile.size === 0) {
    return undefined;
  }

  if (!allowedAvatarTypes.has(avatarFile.type)) {
    throw new Error("Profile picture must be a PNG, JPG, GIF, or WebP image.");
  }

  if (avatarFile.size > maxAvatarSize) {
    throw new Error("Profile picture must be 750 KB or smaller.");
  }

  const buffer = Buffer.from(await avatarFile.arrayBuffer());

  return `data:${avatarFile.type};base64,${buffer.toString("base64")}`;
}

function revalidateReviewSurfaces({
  gameSlug,
  profileUsername,
  reviewAuthorUsername,
}: {
  gameSlug: string;
  profileUsername: string;
  reviewAuthorUsername: string;
}) {
  revalidatePath("/");
  revalidatePath(`/games/${gameSlug}`);
  revalidatePath("/profile");
  revalidatePath(`/profiles/${profileUsername}`);
  revalidatePath(`/profiles/${reviewAuthorUsername}`);
}

export async function updateProfileAction(formData: FormData) {
  const profile = await requireSignedInProfile();
  const displayName = getTrimmedString(formData, "displayName");
  const bio = getTrimmedString(formData, "bio");
  const avatarUrl = await getAvatarDataUrl(formData);

  if (displayName.length > 40) {
    throw new Error("Display name must be 40 characters or fewer.");
  }

  if (bio.length > 280) {
    throw new Error("Bio must be 280 characters or fewer.");
  }

  await prisma.profile.update({
    where: {
      id: profile.id,
    },
    data: {
      displayName: displayName || profile.username,
      bio: bio || null,
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    },
  });

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath(`/profiles/${profile.username}`);
}

export async function togglePinnedReviewAction(formData: FormData) {
  const profile = await requireSignedInProfile();
  const reviewId = formData.get("reviewId");

  if (typeof reviewId !== "string" || !reviewId.trim()) {
    throw new Error("A valid review id is required.");
  }

  await togglePinnedReview(reviewId);

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath(`/profiles/${profile.username}`);
}

export async function addReviewCommentAction(formData: FormData) {
  const profile = await requireSignedInProfile();
  const reviewId = formData.get("reviewId");
  const body = formData.get("body");

  if (typeof reviewId !== "string" || !reviewId.trim()) {
    throw new Error("A valid review id is required.");
  }

  if (typeof body !== "string") {
    throw new Error("Comment text is required.");
  }

  const { gameSlug, reviewAuthorUsername } = await addReviewComment(
    reviewId,
    body,
  );

  revalidateReviewSurfaces({
    gameSlug,
    profileUsername: profile.username,
    reviewAuthorUsername,
  });
}

export async function toggleReviewVoteAction(formData: FormData) {
  const profile = await requireSignedInProfile();
  const reviewId = formData.get("reviewId");
  const voteValue = formData.get("voteValue");

  if (typeof reviewId !== "string" || !reviewId.trim()) {
    throw new Error("A valid review id is required.");
  }

  if (voteValue !== "like" && voteValue !== "dislike") {
    throw new Error("A valid vote is required.");
  }

  const { gameSlug, reviewAuthorUsername } = await toggleReviewVote(
    reviewId,
    voteValue,
  );

  revalidateReviewSurfaces({
    gameSlug,
    profileUsername: profile.username,
    reviewAuthorUsername,
  });
}

export async function updateReviewCommentAction(formData: FormData) {
  const profile = await requireSignedInProfile();
  const commentId = formData.get("commentId");
  const body = formData.get("body");

  if (typeof commentId !== "string" || !commentId.trim()) {
    throw new Error("A valid comment id is required.");
  }

  if (typeof body !== "string") {
    throw new Error("Comment text is required.");
  }

  const { gameSlug, reviewAuthorUsername } = await updateReviewComment(
    commentId,
    body,
  );

  revalidateReviewSurfaces({
    gameSlug,
    profileUsername: profile.username,
    reviewAuthorUsername,
  });
}

export async function deleteReviewCommentAction(formData: FormData) {
  const profile = await requireSignedInProfile();
  const commentId = formData.get("commentId");

  if (typeof commentId !== "string" || !commentId.trim()) {
    throw new Error("A valid comment id is required.");
  }

  const { gameSlug, reviewAuthorUsername } =
    await deleteReviewComment(commentId);

  revalidateReviewSurfaces({
    gameSlug,
    profileUsername: profile.username,
    reviewAuthorUsername,
  });
}

export async function deleteReviewAction(formData: FormData) {
  const profile = await requireSignedInProfile();
  const reviewId = formData.get("reviewId");

  if (typeof reviewId !== "string" || !reviewId.trim()) {
    throw new Error("A valid review id is required.");
  }

  const { gameSlug, reviewAuthorUsername } = await deleteReview(reviewId);

  revalidateReviewSurfaces({
    gameSlug,
    profileUsername: profile.username,
    reviewAuthorUsername,
  });
}
