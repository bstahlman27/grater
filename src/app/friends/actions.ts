"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  acceptFriendRequest,
  deleteFriendship,
  sendFriendRequest,
} from "@/data/friends";

function getFriendshipId(formData: FormData) {
  const friendshipId = formData.get("friendshipId");

  if (typeof friendshipId !== "string" || !friendshipId.trim()) {
    throw new Error("A valid friendship id is required.");
  }

  return friendshipId;
}

function getRedirectUrl(type: "error" | "message", message: string) {
  return `/friends?${type}=${encodeURIComponent(message)}`;
}

function revalidateFriends() {
  revalidatePath("/");
  revalidatePath("/friends");
  revalidatePath("/profile");
}

export async function sendFriendRequestAction(formData: FormData) {
  const username = formData.get("username");

  if (typeof username !== "string") {
    redirect(getRedirectUrl("error", "Enter a username."));
  }

  let message: string;

  try {
    message = await sendFriendRequest(username);
  } catch (error) {
    redirect(
      getRedirectUrl(
        "error",
        error instanceof Error ? error.message : "Could not send friend request.",
      ),
    );
  }

  revalidateFriends();
  redirect(getRedirectUrl("message", message));
}

export async function acceptFriendRequestAction(formData: FormData) {
  try {
    await acceptFriendRequest(getFriendshipId(formData));
  } catch (error) {
    redirect(
      getRedirectUrl(
        "error",
        error instanceof Error ? error.message : "Could not accept request.",
      ),
    );
  }

  revalidateFriends();
  redirect(getRedirectUrl("message", "Friend request accepted."));
}

export async function deleteFriendshipAction(formData: FormData) {
  try {
    await deleteFriendship(getFriendshipId(formData));
  } catch (error) {
    redirect(
      getRedirectUrl(
        "error",
        error instanceof Error ? error.message : "Could not update friendship.",
      ),
    );
  }

  revalidateFriends();
  redirect(getRedirectUrl("message", "Friendship updated."));
}
