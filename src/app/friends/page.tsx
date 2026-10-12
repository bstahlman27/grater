import Link from "next/link";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { ProfileAvatar } from "@/components/profile-avatar";
import { getFriendsPageData } from "@/data/friends";
import type { FriendRequestSummary } from "@/types/friends";
import {
  acceptFriendRequestAction,
  deleteFriendshipAction,
  sendFriendRequestAction,
} from "./actions";

type FriendsPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
  }>;
};

type FriendRowProps = {
  friend: FriendRequestSummary;
  primaryAction?: {
    action: (formData: FormData) => void | Promise<void>;
    label: string;
    style: "primary" | "secondary";
  };
  secondaryAction?: {
    action: (formData: FormData) => void | Promise<void>;
    label: string;
  };
};

export const dynamic = "force-dynamic";

function getSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function ActionButton({
  label,
  style,
}: {
  label: string;
  style: "primary" | "secondary";
}) {
  return (
    <button
      className={
        style === "primary"
          ? "cursor-pointer rounded-md bg-zinc-950 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
          : "cursor-pointer rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-700 transition hover:border-emerald-600 hover:text-emerald-600"
      }
      type="submit"
    >
      {label}
    </button>
  );
}

function FriendRow({ friend, primaryAction, secondaryAction }: FriendRowProps) {
  return (
    <li className="rounded-md border border-zinc-200 p-3">
      <div className="flex h-full flex-col justify-between gap-4">
        <Link
          className="flex min-w-0 items-center gap-3 hover:text-amber-500"
          href={`/profiles/${friend.profile.username}`}
        >
          <ProfileAvatar
            avatarUrl={friend.profile.avatarUrl}
            displayName={friend.profile.displayName}
            size="xs"
          />
          <span className="min-w-0">
            <span className="block truncate font-semibold">
              {friend.profile.displayName}
            </span>
            <span className="mt-0.5 block truncate text-sm text-zinc-500">
              @{friend.profile.username} - {friend.updatedAt}
            </span>
          </span>
        </Link>

        <div className="flex flex-wrap gap-2">
          {primaryAction ? (
            <form action={primaryAction.action}>
              <input name="friendshipId" type="hidden" value={friend.id} />
              <ActionButton
                label={primaryAction.label}
                style={primaryAction.style}
              />
            </form>
          ) : null}
          {secondaryAction ? (
            <form action={secondaryAction.action}>
              <input name="friendshipId" type="hidden" value={friend.id} />
              <ActionButton label={secondaryAction.label} style="secondary" />
            </form>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
      {children}
    </p>
  );
}

export default async function FriendsPage({ searchParams }: FriendsPageProps) {
  const [{ error, message }, friendsData] = await Promise.all([
    searchParams,
    getFriendsPageData(),
  ]);
  const errorMessage = getSearchValue(error);
  const statusMessage = getSearchValue(message);

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-zinc-950">
      <div className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <AppHeader />

        <section className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_38rem] lg:items-start">
          <section>
            <p className="text-sm font-medium uppercase text-emerald-600">
              Friends
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Build your circle</h2>
            <p className="mt-4 max-w-xl leading-7 text-zinc-700">
              Add friends by username to see their public reviews, compare
              installed lists, and set up the game picker later.
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-700">
                <li>
                  View friends profiles, including friend-visible reviews and lists
                </li>
                <li>See friend-visible reviews on your timeline</li>
                <li>Like, dislike, and comment on them</li>
                <li>See installed/play later lists visible to friends</li>
                <li>
                  Use the group game picker, which selects from a pool of games
                  everyone has installed
                </li>
            </ul>

            {!friendsData.currentProfile ? (
              <Link
                className="mt-6 inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                href="/login"
              >
                Log in
              </Link>
            ) : null}
          </section>

          <div className="space-y-5">
            {errorMessage ? (
              <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                {errorMessage}
              </p>
            ) : null}

            {statusMessage ? (
              <p className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
                {statusMessage}
              </p>
            ) : null}

            {friendsData.currentProfile ? (
              <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium uppercase text-emerald-600">
                  Add friend
                </p>
                <h3 className="mt-1 text-xl font-semibold">
                  Search by username
                </h3>
                <form
                  action={sendFriendRequestAction}
                  className="mt-4 flex flex-col gap-3 sm:flex-row"
                >
                  <label className="sr-only" htmlFor="username">
                    Username
                  </label>
                  <input
                    className="min-h-11 flex-1 rounded-lg border border-zinc-300 bg-white px-4 text-base outline-none ring-emerald-600/20 placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4"
                    id="username"
                    name="username"
                    placeholder="friend-username"
                  />
                  <button
                    className="rounded-lg bg-zinc-950 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                    type="submit"
                  >
                    Send request
                  </button>
                </form>
                <p className="mt-3 text-sm text-zinc-500">
                  Your username is @{friendsData.currentProfile.username}.
                </p>
              </section>
            ) : null}

            {friendsData.currentProfile ? (
              <section className="grid items-start gap-5 sm:grid-cols-2">
                <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium uppercase text-emerald-600">
                    Incoming
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">
                    {friendsData.incomingRequests.length} requests
                  </h3>
                  {friendsData.incomingRequests.length > 0 ? (
                    <ul className="mt-5 grid gap-3">
                      {friendsData.incomingRequests.map((friend) => (
                        <FriendRow
                          friend={friend}
                          key={friend.id}
                          primaryAction={{
                            action: acceptFriendRequestAction,
                            label: "Accept",
                            style: "primary",
                          }}
                          secondaryAction={{
                            action: deleteFriendshipAction,
                            label: "Decline",
                          }}
                        />
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-3">
                      <EmptyState>No incoming requests.</EmptyState>
                    </div>
                  )}
                </section>

                <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium uppercase text-emerald-600">
                    Outgoing
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">
                    {friendsData.outgoingRequests.length} pending
                  </h3>
                  {friendsData.outgoingRequests.length > 0 ? (
                    <ul className="mt-5 grid gap-3">
                      {friendsData.outgoingRequests.map((friend) => (
                        <FriendRow
                          friend={friend}
                          key={friend.id}
                          primaryAction={{
                            action: deleteFriendshipAction,
                            label: "Cancel",
                            style: "secondary",
                          }}
                        />
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-3">
                      <EmptyState>No outgoing requests.</EmptyState>
                    </div>
                  )}
                </section>
              </section>
            ) : null}
          </div>
        </section>

        {friendsData.currentProfile ? (
          <section className="pb-10">
            <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium uppercase text-emerald-600">
                Friends
              </p>
              <h3 className="mt-1 text-xl font-semibold">
                {friendsData.friends.length} accepted
              </h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {friendsData.friends.map((friend) => (
                  <FriendRow
                    friend={friend}
                    key={friend.id}
                    primaryAction={{
                      action: deleteFriendshipAction,
                      label: "Remove",
                      style: "secondary",
                    }}
                  />
                ))}
              </ul>
              {friendsData.friends.length === 0 ? (
                <div className="mt-5">
                  <EmptyState>No friends yet.</EmptyState>
                </div>
              ) : null}
            </section>
          </section>
        ) : null}
      </div>
    </main>
  );
}
