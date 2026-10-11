import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ListPanel } from "@/components/list-panel";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ReviewCard } from "@/components/review-card";
import { getProfilePageData } from "@/data/grater";
import {
  addReviewCommentAction,
  deleteReviewAction,
  deleteReviewCommentAction,
  togglePinnedReviewAction,
  toggleReviewVoteAction,
  updateReviewCommentAction,
} from "@/app/profile/actions";

type PublicProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;
  const data = await getProfilePageData(decodeURIComponent(username));

  if (!data) {
    notFound();
  }

  const {
    canViewContent,
    friendCount,
    installedGames,
    isCurrentUser,
    pinnedReviews,
    playLaterGames,
    profile,
    reviews,
  } = data;

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-zinc-950">
      <div className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <AppHeader />

        <section className="grid gap-8 py-10 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="space-y-5">
            <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <ProfileAvatar
                  avatarUrl={profile.avatarUrl}
                  displayName={profile.displayName}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium uppercase text-emerald-600">
                    Profile
                  </p>
                  <h2 className="truncate text-2xl font-semibold">
                    {profile.displayName}
                  </h2>
                  <p className="mt-1 truncate text-sm text-zinc-600">
                    @{profile.username}
                  </p>
                </div>
              </div>

              {profile.bio ? (
                <p className="mt-5 leading-7 text-zinc-700">{profile.bio}</p>
              ) : null}

              <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                <div>
                  <dt className="text-zinc-500">Reviews</dt>
                  <dd className="mt-1 text-lg font-semibold">
                    {reviews.length}
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
                  <dd className="mt-1 text-lg font-semibold">{friendCount}</dd>
                </div>
              </dl>

              {isCurrentUser ? (
                <Link
                  className="mt-6 flex min-h-10 w-full items-center justify-center rounded-md border border-zinc-950 px-4 text-sm font-semibold text-zinc-950 transition hover:border-emerald-600 hover:text-emerald-600"
                  href="/profile"
                >
                  Edit your profile
                </Link>
              ) : null}
            </section>

            {canViewContent ? (
              <>
                <ListPanel
                  eyebrow="Play later"
                  games={playLaterGames}
                  title="Saved games"
                />
                <ListPanel
                  eyebrow="Installed"
                  filterByPlatform
                  games={installedGames}
                  title="Ready to play"
                />
              </>
            ) : (
              <p className="rounded-lg border border-zinc-300 bg-white p-5 text-sm leading-6 text-zinc-700 shadow-sm">
                Add @{profile.username} as a friend to see their friend-visible
                reviews and lists.
              </p>
            )}
          </aside>

          <section className="space-y-4">
            <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
              <div>
                <p className="text-sm font-medium uppercase text-emerald-600">
                  Pinned
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {profile.displayName}&apos;s best work
                </h2>
              </div>

              {canViewContent ? (
                <div className="mt-5 grid gap-4">
                  {pinnedReviews.map(({ review, game }) => (
                    <ReviewCard
                      commentAction={
                        review.canComment ? addReviewCommentAction : undefined
                      }
                      deleteAction={
                        isCurrentUser ? deleteReviewAction : undefined
                      }
                      deleteCommentAction={deleteReviewCommentAction}
                      game={game}
                      key={review.id}
                      pinAction={
                        isCurrentUser ? togglePinnedReviewAction : undefined
                      }
                      review={review}
                      updateCommentAction={updateReviewCommentAction}
                      voteAction={
                        review.canVote ? toggleReviewVoteAction : undefined
                      }
                    />
                  ))}
                </div>
              ) : null}

              {canViewContent && pinnedReviews.length === 0 ? (
                <p className="mt-5 rounded-md bg-zinc-50 p-4 text-sm text-zinc-600">
                  No pinned reviews yet.
                </p>
              ) : null}
            </section>

            <div>
              <p className="text-sm font-medium uppercase text-emerald-600">
                Public to friends
              </p>
              <h2 className="mt-1 text-2xl font-semibold">Reviews</h2>
            </div>

            {canViewContent ? (
              <div className="grid gap-4">
                {reviews.map(({ review, game }) => (
                  <ReviewCard
                    commentAction={
                      review.canComment ? addReviewCommentAction : undefined
                    }
                    deleteAction={isCurrentUser ? deleteReviewAction : undefined}
                    deleteCommentAction={deleteReviewCommentAction}
                    game={game}
                    key={review.id}
                    pinAction={
                      isCurrentUser ? togglePinnedReviewAction : undefined
                    }
                    review={review}
                    updateCommentAction={updateReviewCommentAction}
                    voteAction={
                      review.canVote ? toggleReviewVoteAction : undefined
                    }
                  />
                ))}
              </div>
            ) : null}

            {canViewContent && reviews.length === 0 ? (
              <p className="rounded-lg border border-zinc-300 bg-white p-4 text-sm text-zinc-700">
                No friend-visible reviews yet.
              </p>
            ) : null}
          </section>
        </section>
      </div>
    </main>
  );
}
