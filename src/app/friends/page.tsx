import Link from "next/link";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
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

export const dynamic = "force-dynamic";

function getSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function FriendRow({
  actionLabel,
  friend,
  secondaryActionLabel,
}: {
  actionLabel: string;
  friend: FriendRequestSummary;
  secondaryActionLabel?: string;
}) {
  return (
    <li className="rounded-md border border-zinc-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{friend.profile.displayName}</p>
          <p className="mt-1 text-sm text-zinc-500">
            @{friend.profile.username} - {friend.updatedAt}
          </p>
        </div>
        <form action={deleteFriendshipAction}>
          <input name="friendshipId" type="hidden" value={friend.id} />
          <button
            className="rounded-md border border-zinc-300 px-3 py-1 text-sm font-semibold text-zinc-700 hover:border-red-700 hover:text-red-700"
            type="submit"
          >
            {secondaryActionLabel ?? actionLabel}
          </button>
        </form>
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
      <div className="mx-auto w-full max-w-6xl px-6 py-6 sm:px-8 lg:px-10">
        <AppHeader />

        <section className="grid gap-8 py-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-medium uppercase text-red-700">Friends</p>
            <h2 className="mt-2 text-3xl font-semibold">Build your circle</h2>
            <p className="mt-4 max-w-xl leading-7 text-zinc-700">
              Add friends by username. Once your friends have installed-game
              lists, Grater can use those lists for the shared game picker.
            </p>

            {!friendsData.currentProfile ? (
              <Link
                className="mt-6 inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                href="/login"
              >
                Log in
              </Link>
            ) : null}
          </div>

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
                <p className="text-sm font-medium uppercase text-red-700">
                  Add friend
                </p>
                <form
                  action={sendFriendRequestAction}
                  className="mt-4 flex flex-col gap-3 sm:flex-row"
                >
                  <label className="sr-only" htmlFor="username">
                    Username
                  </label>
                  <input
                    className="min-h-11 flex-1 rounded-lg border border-zinc-300 bg-white px-4 text-base outline-none ring-red-700/20 placeholder:text-zinc-400 focus:border-red-700 focus:ring-4"
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
          </div>
        </section>

        {friendsData.currentProfile ? (
          <section className="grid gap-5 pb-10 lg:grid-cols-3">
            <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium uppercase text-red-700">
                Friends
              </p>
              <h3 className="mt-1 text-xl font-semibold">
                {friendsData.friends.length} accepted
              </h3>
              <ul className="mt-5 space-y-3">
                {friendsData.friends.map((friend) => (
                  <FriendRow
                    actionLabel="Remove"
                    friend={friend}
                    key={friend.id}
                  />
                ))}
              </ul>
              {friendsData.friends.length === 0 ? (
                <EmptyState>No friends yet.</EmptyState>
              ) : null}
            </section>

            <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium uppercase text-red-700">
                Incoming
              </p>
              <h3 className="mt-1 text-xl font-semibold">
                {friendsData.incomingRequests.length} requests
              </h3>
              <ul className="mt-5 space-y-3">
                {friendsData.incomingRequests.map((friend) => (
                  <li className="rounded-md border border-zinc-200 p-3" key={friend.id}>
                    <div>
                      <p className="font-semibold">{friend.profile.displayName}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        @{friend.profile.username} - {friend.updatedAt}
                      </p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <form action={acceptFriendRequestAction}>
                        <input name="friendshipId" type="hidden" value={friend.id} />
                        <button
                          className="rounded-md bg-zinc-950 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
                          type="submit"
                        >
                          Accept
                        </button>
                      </form>
                      <form action={deleteFriendshipAction}>
                        <input name="friendshipId" type="hidden" value={friend.id} />
                        <button
                          className="rounded-md border border-zinc-300 px-3 py-1 text-sm font-semibold text-zinc-700 hover:border-red-700 hover:text-red-700"
                          type="submit"
                        >
                          Decline
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
              {friendsData.incomingRequests.length === 0 ? (
                <EmptyState>No incoming requests.</EmptyState>
              ) : null}
            </section>

            <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium uppercase text-red-700">
                Outgoing
              </p>
              <h3 className="mt-1 text-xl font-semibold">
                {friendsData.outgoingRequests.length} pending
              </h3>
              <ul className="mt-5 space-y-3">
                {friendsData.outgoingRequests.map((friend) => (
                  <FriendRow
                    actionLabel="Cancel"
                    friend={friend}
                    key={friend.id}
                  />
                ))}
              </ul>
              {friendsData.outgoingRequests.length === 0 ? (
                <EmptyState>No outgoing requests.</EmptyState>
              ) : null}
            </section>
          </section>
        ) : null}
      </div>
    </main>
  );
}
