import { AppHeader } from "@/components/app-header";
import { ListPanel } from "@/components/list-panel";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ReviewCard } from "@/components/review-card";
import {
  getHomeProfile,
  getInstalledGames,
  getPlayLaterGames,
  getReviewedGames,
} from "@/data/grater";
import {
  addReviewCommentAction,
  deleteReviewAction,
  deleteReviewCommentAction,
  togglePinnedReviewAction,
  toggleReviewVoteAction,
  updateReviewCommentAction,
  updateProfileAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [profile, reviewedGames, playLaterGames, installedGames] =
    await Promise.all([
      getHomeProfile(),
      getReviewedGames(),
      getPlayLaterGames(),
      getInstalledGames(),
    ]);

  const username = profile?.username ?? "not-signed-in";
  const displayName = profile?.displayName ?? username;
  const pinnedReviews = reviewedGames.filter(({ review }) => review.pinned);

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-zinc-950">
      <div className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <AppHeader />

        <section className="grid gap-8 py-10 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="space-y-5">
            <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <ProfileAvatar
                  avatarUrl={profile?.avatarUrl ?? null}
                  displayName={displayName}
                  size="lg"
                />
                <div>
                  <p className="text-sm font-medium uppercase text-emerald-600">
                    Profile
                  </p>
                  <h2 className="text-2xl font-semibold">{displayName}</h2>
                  <p className="mt-1 text-sm text-zinc-600">@{username}</p>
                </div>
              </div>

              {profile?.bio ? (
                <p className="mt-5 leading-7 text-zinc-700">{profile.bio}</p>
              ) : !profile ? (
                <p className="mt-5 leading-7 text-zinc-700">
                  Sign in to keep personal reviews and lists.
                </p>
              ) : null}
              <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                <div>
                  <dt className="text-zinc-500">Reviews</dt>
                  <dd className="mt-1 text-lg font-semibold">
                    {profile?.reviewCount ?? reviewedGames.length}
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
                    {profile?.friendCount ?? 0}
                  </dd>
                </div>
              </dl>

              {profile ? (
                <details className="group mt-6">
                  <summary className="flex min-h-10 w-full cursor-pointer list-none items-center justify-center rounded-md border border-zinc-950 px-4 text-sm font-semibold text-zinc-950 transition hover:border-emerald-600 hover:text-emerald-600 [&::-webkit-details-marker]:hidden">
                    Edit profile
                  </summary>

                  <form
                    action={updateProfileAction}
                    className="mt-5 space-y-4 border-t border-zinc-200 pt-5"
                  >
                    <div>
                      <label
                        className="block text-sm font-medium text-zinc-700"
                        htmlFor="displayName"
                      >
                        Display name
                      </label>
                      <input
                        className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-emerald-600/20 focus:border-emerald-600 focus:ring-4"
                        defaultValue={profile.displayName}
                        id="displayName"
                        maxLength={40}
                        name="displayName"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium text-zinc-700"
                        htmlFor="avatarFile"
                      >
                        Profile picture
                      </label>
                      <input
                        accept="image/gif,image/jpeg,image/png,image/webp"
                        className="mt-2 block w-full rounded-md border border-zinc-300 bg-white text-sm text-zinc-700 file:mr-3 file:min-h-11 file:border-0 file:bg-zinc-950 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-600"
                        id="avatarFile"
                        name="avatarFile"
                        type="file"
                      />
                      <p className="mt-2 text-xs leading-5 text-zinc-500">
                        PNG, JPG, GIF, or WebP. Leave blank to keep your current
                        picture.
                      </p>
                      {profile.avatarUrl ? (
                        <label className="mt-3 flex items-center gap-2 text-sm text-zinc-700">
                          <input
                            className="size-4 accent-emerald-600"
                            name="removeAvatar"
                            type="checkbox"
                          />
                          Remove current picture
                        </label>
                      ) : null}
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium text-zinc-700"
                        htmlFor="bio"
                      >
                        Bio
                      </label>
                      <textarea
                        className="mt-2 min-h-28 w-full rounded-md border border-zinc-300 bg-white px-3 py-3 text-sm leading-6 outline-none ring-emerald-600/20 focus:border-emerald-600 focus:ring-4"
                        defaultValue={profile.bio ?? ""}
                        id="bio"
                        maxLength={280}
                        name="bio"
                        placeholder="What have you been playing?"
                      />
                    </div>

                    <button
                      className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                      type="submit"
                    >
                      Save profile
                    </button>
                  </form>
                </details>
              ) : null}
            </section>

            <ListPanel
              eyebrow="Play later"
              games={playLaterGames}
              title="Saved games"
              viewHref="/lists/play-later"
            />
            <ListPanel
              eyebrow="Installed"
              filterByPlatform
              games={installedGames}
              title="Ready to play"
              viewHref="/lists/installed"
            />
          </aside>

          <section className="space-y-4">
            <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
              <div>
                <p className="text-sm font-medium uppercase text-emerald-600">
                  Pinned
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {displayName}&apos;s best work
                </h2>
              </div>

              <div className="mt-5 grid gap-4">
                {pinnedReviews.map(({ review, game }) => (
                  <ReviewCard
                    commentAction={addReviewCommentAction}
                    deleteAction={deleteReviewAction}
                    deleteCommentAction={deleteReviewCommentAction}
                    game={game}
                    key={review.id}
                    pinAction={togglePinnedReviewAction}
                    review={review}
                    updateCommentAction={updateReviewCommentAction}
                    voteAction={toggleReviewVoteAction}
                  />
                ))}
              </div>

              {pinnedReviews.length === 0 ? (
                <p className="mt-5 rounded-md bg-zinc-50 p-4 text-sm text-zinc-600">
                  Pin reviews you want friends to see first.
                </p>
              ) : null}
            </section>

            <div>
              <p className="text-sm font-medium uppercase text-emerald-600">
                Public to friends
              </p>
              <h2 className="mt-1 text-2xl font-semibold">Reviews</h2>
            </div>
            <div className="grid gap-4">
              {reviewedGames.map(({ review, game }) => (
                <ReviewCard
                  commentAction={addReviewCommentAction}
                  deleteAction={deleteReviewAction}
                  deleteCommentAction={deleteReviewCommentAction}
                  game={game}
                  key={review.id}
                  pinAction={togglePinnedReviewAction}
                  review={review}
                  updateCommentAction={updateReviewCommentAction}
                  voteAction={toggleReviewVoteAction}
                />
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
