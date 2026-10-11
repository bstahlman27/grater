import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { ListPanel } from "@/components/list-panel";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ReviewCard } from "@/components/review-card";
import {
  getHomeProfile,
  getInstalledGames,
  getPlayLaterGames,
  getTimelineReviews,
} from "@/data/grater";
import {
  addReviewCommentAction,
  deleteReviewAction,
  deleteReviewCommentAction,
  toggleReviewVoteAction,
  updateReviewCommentAction,
} from "./profile/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [homeProfile, timelineReviews, playLaterGames, installedGames] = await Promise.all([
    getHomeProfile(),
    getTimelineReviews(),
    getPlayLaterGames(),
    getInstalledGames(),
  ]);

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <AppHeader />

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
          <div className="space-y-8">
            <section>
              <p className="text-sm font-medium uppercase text-emerald-600">
                Home
              </p>
              <p className="max-w-2xl text-lg leading-8 text-zinc-700">
                Keep track of what you play, what you want to play, leave reviews, and share your awesome recs with your friends.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                  href="/games"
                >
                  Browse games
                </Link>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase text-emerald-600">
                    Recent reviews
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">Timeline</h2>
                </div>
                <p className="text-sm text-zinc-600">
                  Your reviews and friends&apos; updates
                </p>
              </div>

              <div className="grid gap-4">
                {timelineReviews.map(({ review, game }) => (
                  <ReviewCard
                    commentAction={addReviewCommentAction}
                    deleteAction={deleteReviewAction}
                    deleteCommentAction={deleteReviewCommentAction}
                    game={game}
                    key={review.id}
                    review={review}
                    updateCommentAction={updateReviewCommentAction}
                    voteAction={toggleReviewVoteAction}
                  />
                ))}
              </div>

              {timelineReviews.length === 0 ? (
                <p className="rounded-lg border border-zinc-300 bg-white p-4 text-sm text-zinc-700">
                  No timeline reviews yet. Review a game or add friends to see
                  activity here.
                </p>
              ) : null}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
              {homeProfile ? (
                <>
                  <div className="flex items-center gap-4">
                    <ProfileAvatar
                      avatarUrl={homeProfile.avatarUrl}
                      displayName={homeProfile.displayName}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold">
                        {homeProfile.displayName}
                      </p>
                      <p className="mt-1 truncate text-sm text-zinc-600">
                        @{homeProfile.username}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <dt className="text-zinc-500">Reviews</dt>
                      <dd className="mt-1 text-lg font-semibold">
                        {homeProfile.reviewCount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-zinc-500">Later</dt>
                      <dd className="mt-1 text-lg font-semibold">
                        {playLaterGames.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-zinc-500">Installed</dt>
                      <dd className="mt-1 text-lg font-semibold">
                        {installedGames.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-zinc-500">Friends</dt>
                      <dd className="mt-1 text-lg font-semibold">
                        {homeProfile.friendCount}
                      </dd>
                    </div>
                  </dl>

                  <Link
                    className="mt-5 flex min-h-10 w-full items-center justify-center rounded-md border border-zinc-950 px-4 text-sm font-semibold text-zinc-950 transition hover:border-emerald-600 hover:text-emerald-600"
                    href="/profile"
                  >
                    View profile
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium uppercase text-emerald-600">
                    Profile
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">
                    Log in to keep reviews, friends, and lists tied to your
                    account.
                  </p>
                  <Link
                    className="mt-5 flex min-h-10 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
                    href="/login"
                  >
                    Log in
                  </Link>
                </>
              )}
            </section>

            <ListPanel
              eyebrow="Play later"
              games={playLaterGames}
              title="Saved for later"
              viewHref="/lists/play-later"
            />
            <ListPanel
              eyebrow="Installed"
              filterByPlatform
              games={installedGames}
              title="Friend picker pool"
              viewHref="/lists/installed"
            />

            <section className="rounded-lg border border-zinc-900 bg-zinc-950 p-5 text-white shadow-sm">
              <p className="text-sm font-medium uppercase text-amber-300">
                Later feature
              </p>
              <h2 className="mt-1 text-xl font-semibold">Pick something shared</h2>
              <p className="mt-3 leading-7 text-zinc-300">
                Once friends are added, Grater can compare installed-game lists
                and choose one game both people already have ready.
              </p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
