import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { StarRating } from "@/components/star-rating";
import { getGamePageData } from "@/data/grater";
import {
  saveReviewAction,
  toggleInstalledAction,
  togglePlayLaterAction,
} from "../actions";

export const dynamic = "force-dynamic";

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

  const { game, isSignedIn, listState, review } = data;

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-zinc-950">
      <div className="mx-auto w-full max-w-6xl px-6 py-6 sm:px-8 lg:px-10">
        <AppHeader />

        <section className="py-10">
          <Link className="text-sm font-medium text-red-700" href="/games">
            Back to games
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,42rem)_18rem] xl:gap-10">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-200 shadow-sm">
              {game.coverUrl ? (
                <Image
                  alt=""
                  className="h-full w-full object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42rem"
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
              <p className="text-sm font-medium uppercase text-red-700">
                Game info
              </p>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-zinc-500">Released</dt>
                  <dd className="mt-1 font-semibold text-zinc-950">
                    {game.releasedAt}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Year</dt>
                  <dd className="mt-1 font-semibold text-zinc-950">
                    {game.releaseYear}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Metacritic</dt>
                  <dd className="mt-1 font-semibold text-zinc-950">
                    {game.metacritic ?? "Not listed"}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">RAWG rating</dt>
                  <dd className="mt-1 font-semibold text-zinc-950">
                    {game.rawgRating ? game.rawgRating.toFixed(1) : "Not listed"}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,42rem)_18rem] xl:gap-10">
            <article>
              <h2 className="text-4xl font-semibold leading-tight">
                {game.title}
              </h2>
              <p className="mt-6 text-lg leading-8 text-zinc-700">
                {game.summary}
              </p>
            </article>

            <div>
              <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium uppercase text-red-700">
                  Lists
                </p>
                {isSignedIn ? (
                  <div className="mt-4 space-y-3">
                    <form
                      action={togglePlayLaterAction}
                      className="rounded-md border border-zinc-200 p-4"
                    >
                      <input name="slug" type="hidden" value={game.slug} />
                      <div>
                        <h3 className="text-lg font-semibold">Play Later</h3>
                        <p className="mt-1 text-sm text-zinc-600">
                          {listState.inPlayLater
                            ? `Saved as ${listState.playLaterVisibility}`
                            : "Defaults to private"}
                        </p>
                      </div>
                      <button
                        className="mt-4 w-full rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        type="submit"
                      >
                        {listState.inPlayLater
                          ? "Remove from Play Later"
                          : "Add to Play Later"}
                      </button>
                    </form>

                    <form
                      action={toggleInstalledAction}
                      className="rounded-md border border-zinc-200 p-4"
                    >
                      <input name="slug" type="hidden" value={game.slug} />
                      <div>
                        <h3 className="text-lg font-semibold">Installed</h3>
                        <p className="mt-1 text-sm text-zinc-600">
                          {listState.inInstalled
                            ? `${listState.installedVisibility} list${
                                listState.installedPlatform
                                  ? ` - ${listState.installedPlatform}`
                                  : ""
                              }`
                            : "Defaults to friends, platform PC"}
                        </p>
                      </div>
                      <button
                        className="mt-4 w-full rounded-md border border-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:border-red-700 hover:text-red-700"
                        type="submit"
                      >
                        {listState.inInstalled
                          ? "Remove from Installed"
                          : "Mark Installed"}
                      </button>
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
            </div>
          </div>

          <section className="mt-8 rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase text-red-700">
                  Your review
                </p>
                <h3 className="mt-1 text-xl font-semibold">
                  {review ? "Already reviewed" : "No review yet"}
                </h3>
              </div>
              {review ? <StarRating rating={review.rating} /> : null}
            </div>

            {review?.body ? (
              <p className="mt-4 leading-7 text-zinc-700">{review.body}</p>
            ) : null}

            {review ? (
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-zinc-600">
                <span className="rounded-md bg-zinc-100 px-2 py-1">
                  {review.visibility}
                </span>
                {review.containsSpoilers ? (
                  <span className="rounded-md bg-red-50 px-2 py-1 text-red-800">
                    spoilers
                  </span>
                ) : null}
                <span className="rounded-md bg-zinc-100 px-2 py-1">
                  Updated {review.updatedAt}
                </span>
              </div>
            ) : null}

            {isSignedIn ? (
              <form action={saveReviewAction} className="mt-6 space-y-4">
                <input name="slug" type="hidden" value={game.slug} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      className="block text-sm font-medium text-zinc-700"
                      htmlFor="rating"
                    >
                      Rating
                    </label>
                    <select
                      className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-red-700/20 focus:border-red-700 focus:ring-4"
                      defaultValue={review?.rating ?? 5}
                      id="rating"
                      name="rating"
                    >
                      <option value="5">5 stars</option>
                      <option value="4">4 stars</option>
                      <option value="3">3 stars</option>
                      <option value="2">2 stars</option>
                      <option value="1">1 star</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-zinc-700"
                      htmlFor="visibility"
                    >
                      Visibility
                    </label>
                    <select
                      className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-red-700/20 focus:border-red-700 focus:ring-4"
                      defaultValue={review?.visibility ?? "friends"}
                      id="visibility"
                      name="visibility"
                    >
                      <option value="friends">Friends</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-zinc-700"
                    htmlFor="body"
                  >
                    Notes
                  </label>
                  <textarea
                    className="mt-2 min-h-32 w-full rounded-md border border-zinc-300 bg-white px-3 py-3 text-sm leading-6 outline-none ring-red-700/20 focus:border-red-700 focus:ring-4"
                    defaultValue={review?.body ?? ""}
                    id="body"
                    name="body"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    className="size-4 accent-red-700"
                    defaultChecked={review?.containsSpoilers ?? false}
                    name="containsSpoilers"
                    type="checkbox"
                  />
                  Contains spoilers
                </label>

                <button
                  className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  type="submit"
                >
                  {review ? "Update review" : "Save review"}
                </button>
              </form>
            ) : (
              <div className="mt-6 rounded-md border border-zinc-200 p-4">
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
          </section>
        </section>
      </div>
    </main>
  );
}
