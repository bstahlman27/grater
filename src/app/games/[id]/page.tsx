import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { StarRating } from "@/components/star-rating";
import { getGamePageData } from "@/data/grater";
import { toggleInstalledAction, togglePlayLaterAction } from "../actions";

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

        <section className="grid gap-8 py-10">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-200 shadow-sm">
            {game.coverUrl ? (
              <Image
                alt=""
                className="h-full w-full object-cover"
                fill
                priority
                sizes="(max-width: 1152px) 100vw, 72rem"
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

          <div>
            <Link className="text-sm font-medium text-red-700" href="/games">
              Back to games
            </Link>
            <h2 className="mt-4 text-4xl font-semibold">{game.title}</h2>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-zinc-700">
              {game.summary}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-md bg-white px-3 py-1 text-sm font-medium text-zinc-700 shadow-sm">
                Released {game.releasedAt}
              </span>
              {game.metacritic ? (
                <span className="rounded-md bg-white px-3 py-1 text-sm font-medium text-zinc-700 shadow-sm">
                  Metacritic {game.metacritic}
                </span>
              ) : null}
              {game.rawgRating ? (
                <span className="rounded-md bg-white px-3 py-1 text-sm font-medium text-zinc-700 shadow-sm">
                  RAWG {game.rawgRating.toFixed(1)}
                </span>
              ) : null}
            </div>

            <section className="mt-8 rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium uppercase text-red-700">
                Lists
              </p>
              {isSignedIn ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
              <p className="mt-4 leading-7 text-zinc-700">
                {review
                  ? review.body
                  : "The real review form will live here once auth and database storage are connected."}
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
