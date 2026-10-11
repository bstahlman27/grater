import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { RatingInput } from "@/components/rating-input";
import { ReviewCard } from "@/components/review-card";
import { StarRating } from "@/components/star-rating";
import { getGamePageData } from "@/data/grater";
import { installedPlatformOptions } from "@/lib/platforms";
import type { ReviewSummary } from "@/types/game";
import {
  addReviewCommentAction,
  deleteReviewAction,
  deleteReviewCommentAction,
  toggleReviewVoteAction,
  updateReviewCommentAction,
} from "@/app/profile/actions";
import {
  saveReviewAction,
  toggleInstalledAction,
  togglePlayLaterAction,
} from "../actions";

export const dynamic = "force-dynamic";

const visibilityOptions = [
  { label: "Friends", value: "friends" },
  { label: "Private", value: "private" },
] as const;

function formatVisibilityLabel(visibility: "friends" | "private" | null) {
  if (!visibility) {
    return "";
  }

  return visibility === "friends" ? "Friends" : "Private";
}

function ListVisibilityField({
  className = "mt-4",
  compact = false,
  defaultValue,
}: {
  className?: string;
  compact?: boolean;
  defaultValue: "friends" | "private";
}) {
  return (
    <fieldset className={className}>
      <legend
        className={`font-medium text-zinc-700 ${compact ? "text-xs" : "text-sm"}`}
      >
        Visibility
      </legend>
      <div className={`grid grid-cols-2 gap-2 ${compact ? "mt-1.5" : "mt-2"}`}>
        {visibilityOptions.map((option) => (
          <label
            className={`flex items-center gap-2 rounded-md border border-zinc-300 bg-white text-zinc-700 transition hover:border-zinc-500 ${
              compact ? "min-h-8 px-2 text-xs" : "min-h-10 px-3 text-sm"
            }`}
            key={option.value}
          >
            <input
              className={`${compact ? "size-3.5" : "size-4"} accent-emerald-600`}
              defaultChecked={defaultValue === option.value}
              name="visibility"
              type="radio"
              value={option.value}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ReviewForm({
  gameSlug,
  review,
}: {
  gameSlug: string;
  review: ReviewSummary | null;
}) {
  return (
    <form action={saveReviewAction} className="space-y-4">
      <input name="slug" type="hidden" value={gameSlug} />
      <div className="grid gap-4 sm:grid-cols-2">
        <RatingInput defaultRating={review?.rating} />

        <ListVisibilityField
          className="mt-0"
          defaultValue={review?.visibility ?? "friends"}
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium text-zinc-700"
          htmlFor="body"
        >
          Notes
        </label>
        <textarea
          className="mt-2 min-h-32 w-full rounded-md border border-zinc-300 bg-white px-3 py-3 text-sm leading-6 outline-none ring-emerald-600/20 focus:border-emerald-600 focus:ring-4"
          defaultValue={review?.body ?? ""}
          id="body"
          name="body"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          className="size-4 accent-emerald-600"
          defaultChecked={review?.containsSpoilers ?? false}
          name="containsSpoilers"
          type="checkbox"
        />
        Contains spoilers
      </label>

      <button
        className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
        type="submit"
      >
        {review ? "Save changes" : "Save review"}
      </button>
    </form>
  );
}

function formatAverageRating(rating: number) {
  return Number.isInteger(rating) ? rating.toFixed(0) : rating.toFixed(1);
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getGamePageData(id);

  if (!data) {
    notFound();
  }

  const { friendReviews, game, isSignedIn, listState, review } = data;
  const selectedInstalledPlatforms =
    listState.installedPlatforms.length > 0
      ? listState.installedPlatforms
      : ["PC"];
  const playLaterVisibility = listState.playLaterVisibility ?? "private";
  const installedVisibility = listState.installedVisibility ?? "friends";
  const friendAverageRating =
    friendReviews.length > 0
      ? friendReviews.reduce(
          (total, { review: friendReview }) => total + friendReview.rating,
          0,
        ) / friendReviews.length
      : null;

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-zinc-950">
      <div className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <AppHeader />

        <section className="py-10">
          <Link className="text-sm font-medium text-emerald-600" href="/games">
            Back to games
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-200 shadow-sm">
              {game.coverUrl ? (
                <Image
                  alt=""
                  className="h-full w-full object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 52rem"
                  src={game.coverUrl}
                />
              ) : (
                <div
                  className={`flex h-full items-end ${game.coverColor} p-5 text-lg font-semibold uppercase text-white`}
                >
                  {game.releaseYear}
                </div>
              )}
            </div>

            <aside className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium uppercase text-emerald-600">
                Game info
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-zinc-500">Released</p>
                  <p className="mt-1 font-semibold text-zinc-950">
                    {game.releasedAt}
                  </p>
                </div>
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-zinc-500">Year</p>
                  <p className="mt-1 font-semibold text-zinc-950">
                    {game.releaseYear}
                  </p>
                </div>
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-zinc-500">Metacritic</p>
                  <p className="mt-1 font-semibold text-zinc-950">
                    {game.metacritic ?? "Not listed"}
                  </p>
                </div>
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-zinc-500">Community rating</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-950">
                    {game.rawgRating ? game.rawgRating.toFixed(1) : "Not listed"}
                  </p>
                </div>
                <Link
                  className="col-span-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-center transition hover:border-amber-300 hover:text-amber-500"
                  href="#your-review"
                >
                  <span className="block text-zinc-500">Your rating</span>
                  {review ? (
                    <span className="mt-2 flex items-center justify-center gap-2 font-semibold text-zinc-950">
                      <StarRating rating={review.rating} />
                      <span>{formatAverageRating(review.rating)}</span>
                    </span>
                  ) : (
                    <span className="mt-1 block font-semibold text-zinc-950">
                      Add yours
                    </span>
                  )}
                </Link>
                <Link
                  className="col-span-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-center transition hover:border-amber-300 hover:text-amber-500"
                  href="#friends-reviews"
                >
                  <span className="block text-zinc-500">Friends average</span>
                  {friendAverageRating ? (
                    <span className="mt-2 flex items-center justify-center gap-2 font-semibold text-zinc-950">
                      <StarRating rating={friendAverageRating} />
                      <span>{formatAverageRating(friendAverageRating)}</span>
                    </span>
                  ) : (
                    <span className="mt-1 block font-semibold text-zinc-950">
                      No ratings yet
                    </span>
                  )}
                </Link>
              </div>
            </aside>
          </div>

          <article className="mt-8">
            <h2 className="text-4xl font-semibold leading-tight">
              {game.title}
            </h2>
            <p className="mt-6 text-lg leading-8 text-zinc-700">
              {game.summary}
            </p>
          </article>

          <section className="mt-8 rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium uppercase text-emerald-600">
              Lists
            </p>
            {isSignedIn ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <form
                  action={togglePlayLaterAction}
                  className="rounded-md border border-zinc-200 p-3"
                >
                  <input name="slug" type="hidden" value={game.slug} />
                  <div>
                    <h3 className="text-lg font-semibold">Play Later</h3>
                    <p className="mt-1 text-sm text-zinc-600">
                      {listState.inPlayLater
                        ? `Saved as ${formatVisibilityLabel(
                            listState.playLaterVisibility,
                          )}`
                        : "Choose who can see this"}
                    </p>
                  </div>
                  <ListVisibilityField
                    compact
                    className="mt-3"
                    defaultValue={playLaterVisibility}
                  />
                  <button
                    className="mt-3 w-full rounded-md bg-zinc-950 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                    name="intent"
                    type="submit"
                    value="save"
                  >
                    {listState.inPlayLater
                      ? "Save Play Later"
                      : "Add to Play Later"}
                  </button>
                  {listState.inPlayLater ? (
                    <button
                      className="mt-1.5 w-full rounded-md px-4 py-1.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-emerald-600"
                      name="intent"
                      type="submit"
                      value="remove"
                    >
                      Remove from Play Later
                    </button>
                  ) : null}
                </form>

                <form
                  action={toggleInstalledAction}
                  className="rounded-md border border-zinc-200 p-3"
                >
                  <input name="slug" type="hidden" value={game.slug} />
                  <div>
                    <h3 className="text-lg font-semibold">Installed</h3>
                    <p className="mt-1 text-sm text-zinc-600">
                      {listState.inInstalled
                        ? `${formatVisibilityLabel(
                            listState.installedVisibility,
                          )}${
                            listState.installedPlatforms.length > 0
                              ? ` - ${listState.installedPlatforms.join(", ")}`
                              : ""
                          }`
                        : "Defaults to friends"}
                    </p>
                  </div>
                  <ListVisibilityField
                    compact
                    className="mt-3"
                    defaultValue={installedVisibility}
                  />
                  <fieldset className="mt-3">
                    <legend className="text-xs font-medium text-zinc-700">
                      Platforms
                    </legend>
                    <div className="mt-1.5 grid gap-2 sm:grid-cols-4">
                      {installedPlatformOptions.map((platform) => (
                        <label
                          className="flex min-h-8 min-w-0 items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2 text-xs text-zinc-700 transition hover:border-zinc-500"
                          key={platform}
                        >
                          <input
                            className="size-3.5 accent-emerald-600"
                            defaultChecked={selectedInstalledPlatforms.includes(
                              platform,
                            )}
                            name="platforms"
                            type="checkbox"
                            value={platform}
                          />
                          <span className="min-w-0">{platform}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <button
                    className="mt-3 w-full rounded-md border border-zinc-950 px-4 py-1.5 text-sm font-semibold text-zinc-950 transition hover:border-emerald-600 hover:text-emerald-600"
                    name="intent"
                    type="submit"
                    value="save"
                  >
                    {listState.inInstalled ? "Save Installed" : "Mark Installed"}
                  </button>
                  {listState.inInstalled ? (
                    <button
                      className="mt-1.5 w-full rounded-md px-4 py-1.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-emerald-600"
                      name="intent"
                      type="submit"
                      value="remove"
                    >
                      Remove from Installed
                    </button>
                  ) : null}
                </form>
              </div>
            ) : (
              <div className="mt-4 rounded-md border border-zinc-200 p-4">
                <p className="text-sm text-zinc-700">
                  Log in to save this game to your lists.
                </p>
                <Link
                  className="mt-4 inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                  href="/login"
                >
                  Log in
                </Link>
              </div>
            )}
          </section>

          <section className="mt-8 scroll-mt-8" id="your-review">
            <div>
              <p className="text-sm font-medium uppercase text-emerald-600">
                Your review
              </p>
              <h3 className="mt-1 text-2xl font-semibold">
                {review ? "What you thought" : "No review yet"}
              </h3>
            </div>

            {review ? (
              <>
                <div className="mt-5">
                  <ReviewCard
                    commentAction={addReviewCommentAction}
                    deleteAction={deleteReviewAction}
                    deleteCommentAction={deleteReviewCommentAction}
                    game={game}
                    review={review}
                    showVisibility
                    updateCommentAction={updateReviewCommentAction}
                    voteAction={toggleReviewVoteAction}
                  />
                </div>

                <details className="group mt-6 border-t border-zinc-300">
                  <summary className="mx-auto -mt-4 flex w-fit cursor-pointer list-none rounded-full border border-zinc-300 bg-[#f7f4ee] px-4 py-1.5 text-sm font-semibold text-zinc-700 transition hover:border-amber-300 hover:text-amber-500 [&::-webkit-details-marker]:hidden">
                    <span className="group-open:hidden">Update review</span>
                    <span className="hidden group-open:inline">Hide editor</span>
                  </summary>
                  <div className="mt-5 rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
                    <ReviewForm gameSlug={game.slug} review={review} />
                  </div>
                </details>
              </>
            ) : (
              <div className="mt-5 rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
                {isSignedIn ? (
                  <ReviewForm gameSlug={game.slug} review={review} />
                ) : (
                  <div className="rounded-md border border-zinc-200 p-4">
                    <p className="text-sm text-zinc-700">
                      Log in to rate and review this game.
                    </p>
                    <Link
                      className="mt-4 inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                      href="/login"
                    >
                      Log in
                    </Link>
                  </div>
                )}
              </div>
            )}
          </section>

          {friendReviews.length > 0 ? (
            <section className="mt-8 scroll-mt-8" id="friends-reviews">
              <div>
                <p className="text-sm font-medium uppercase text-emerald-600">
                  Friends&apos; reviews
                </p>
                <h3 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold">
                  <span>What your friends thought</span>
                  {friendAverageRating ? (
                    <span className="inline-flex items-center gap-2 text-base font-semibold text-zinc-700">
                      <span>-</span>
                      <StarRating rating={friendAverageRating} />
                      <span>{formatAverageRating(friendAverageRating)} average</span>
                    </span>
                  ) : null}
                </h3>
              </div>
              <div className="mt-5 grid gap-4">
                {friendReviews.map(({ review: friendReview, game: reviewGame }) => (
                  <ReviewCard
                    commentAction={addReviewCommentAction}
                    deleteAction={deleteReviewAction}
                    deleteCommentAction={deleteReviewCommentAction}
                    game={reviewGame}
                    key={friendReview.id}
                    review={friendReview}
                    updateCommentAction={updateReviewCommentAction}
                    voteAction={toggleReviewVoteAction}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
