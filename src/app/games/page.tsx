import Image from "next/image";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { GameCard } from "@/components/game-card";
import { ListPreviewCard } from "@/components/list-preview-card";
import {
  getInstalledGames,
  getPlayLaterGames,
  getSavedGameLibrary,
} from "@/data/grater";
import { searchRawgGames, type RawgSearchGame } from "@/lib/rawg";
import { cacheRawgGameAction } from "./actions";

export const dynamic = "force-dynamic";

type GamesPageProps = {
  searchParams: Promise<{
    limit?: string | string[];
    q?: string | string[];
  }>;
};

const DEFAULT_RESULT_LIMIT = 8;
const RESULT_LIMIT_STEP = 8;
const MAX_RESULT_LIMIT = 40;

function getQuery(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getResultLimit(value: string | string[] | undefined) {
  const limit = Number(getQuery(value));

  if (!Number.isInteger(limit)) {
    return DEFAULT_RESULT_LIMIT;
  }

  return Math.min(Math.max(limit, DEFAULT_RESULT_LIMIT), MAX_RESULT_LIMIT);
}

function RawgResultContent({
  game,
  label,
}: {
  game: RawgSearchGame;
  label: string;
}) {
  return (
    <>
      <span className="relative block aspect-video overflow-hidden bg-zinc-800">
        {game.backgroundUrl ? (
          <Image
            alt=""
            className="h-full w-full object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 24rem"
            src={game.backgroundUrl}
          />
        ) : (
          <span className="flex h-full items-end bg-zinc-700 p-4 text-xs font-semibold uppercase text-white">
            {game.releaseYear}
          </span>
        )}
      </span>

      <span className="flex min-h-36 flex-col gap-4 p-4">
        <span>
          <span className="flex flex-wrap items-center gap-2">
            <span className="line-clamp-2 text-xl font-semibold leading-6 text-zinc-950 group-hover:text-amber-500">
              {game.title}
            </span>
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
              {game.releaseYear}
            </span>
          </span>
          <span className="mt-2 block text-sm text-zinc-600">
            {game.metacritic
              ? `Metacritic ${game.metacritic}`
              : "No Metacritic score"}
            {game.rawgRating
              ? ` - Community ${game.rawgRating.toFixed(1)}`
              : ""}
          </span>
        </span>

        <span className="mt-auto w-fit rounded-md bg-zinc-950 px-3 py-1 text-sm font-semibold text-white group-hover:bg-emerald-600">
          {label}
        </span>
      </span>
    </>
  );
}

function RawgResultCard({
  canSave,
  game,
}: {
  canSave: boolean;
  game: RawgSearchGame;
}) {
  const className =
    "group block w-full cursor-pointer overflow-hidden rounded-lg border border-zinc-300 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-500 hover:shadow-lg";

  if (!canSave) {
    return (
      <Link className={className} href="/login">
        <RawgResultContent game={game} label="Log in to save" />
      </Link>
    );
  }

  return (
    <form action={cacheRawgGameAction}>
      <input name="rawgId" type="hidden" value={game.rawgId} />
      <button className={className} type="submit">
        <RawgResultContent game={game} label="Save to Grater" />
      </button>
    </form>
  );
}

function getShowMoreHref(query: string, limit: number) {
  const params = new URLSearchParams({
    q: query,
    limit: String(Math.min(limit + RESULT_LIMIT_STEP, MAX_RESULT_LIMIT)),
  });

  return `/games?${params.toString()}`;
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const [{ limit, q }, savedGameLibrary, playLaterGames, installedGames] =
    await Promise.all([
      searchParams,
      getSavedGameLibrary(),
      getPlayLaterGames(),
      getInstalledGames(),
    ]);
  const { games: savedGames, profile: currentProfile } = savedGameLibrary;
  const query = getQuery(q).trim();
  const resultLimit = getResultLimit(limit);
  let rawgResults: RawgSearchGame[] = [];
  let rawgError: string | null = null;

  if (query) {
    try {
      rawgResults = await searchRawgGames(query, resultLimit);
    } catch (error) {
      rawgError =
        error instanceof Error ? error.message : "Game search failed unexpectedly.";
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-zinc-950">
      <div className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <AppHeader />

        <section className="py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_32rem] lg:items-start">
            <div className="flex flex-col">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium uppercase text-emerald-600">
                  Games
                </p>
                <h2 className="text-2xl font-semibold">Find a game</h2>
                <p className="max-w-2xl leading-7 text-zinc-700">
                  Search for any game ever (mostly), then save it to your lists
                  or leave a review.
                </p>
              </div>

              <form
                className="mt-5 flex max-w-2xl flex-col gap-3 sm:flex-row"
                method="get"
              >
                <label className="sr-only" htmlFor="game-search">
                  Search games
                </label>
                <input
                  className="min-h-11 flex-1 rounded-lg border border-zinc-300 bg-white px-4 text-base outline-none ring-emerald-600/20 placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4"
                  defaultValue={query}
                  id="game-search"
                  name="q"
                  placeholder="Search for a game"
                  type="search"
                />
                <button
                  className="rounded-lg bg-zinc-950 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                  type="submit"
                >
                  Search
                </button>
              </form>

              <div className="mt-4 flex max-w-2xl flex-col gap-3 rounded-lg border border-zinc-300 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-zinc-700">
                  Can&apos;t decide what to play? Try Grater&apos;s game picker.
                </p>
                <Link
                  className="w-fit rounded-lg border border-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:border-amber-500 hover:text-amber-500"
                  href="/picker"
                >
                  Game picker
                </Link>
              </div>
            </div>

            <section>
              <h3 className="text-xl font-semibold">Your Lists</h3>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <ListPreviewCard
                  games={playLaterGames}
                  href="/lists/play-later"
                  title="Play later"
                />
                <ListPreviewCard
                  games={installedGames}
                  href="/lists/installed"
                  title="Installed games"
                />
              </div>
            </section>
          </div>

          {query ? (
            <section className="mt-9 space-y-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium uppercase text-emerald-600">
                  Search results
                </p>
                <h3 className="text-xl font-semibold">Results for {query}</h3>
                <p className="text-sm text-zinc-600">
                  Save a result to add it to your Grater library.
                </p>
              </div>

              {rawgError ? (
                <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                  {rawgError}
                </p>
              ) : null}

              {!rawgError && rawgResults.length === 0 ? (
                <p className="rounded-lg border border-zinc-300 bg-white p-4 text-sm text-zinc-700">
                  No results found.
                </p>
              ) : null}

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {rawgResults.map((game) => (
                  <RawgResultCard
                    canSave={Boolean(currentProfile)}
                    game={game}
                    key={game.rawgId}
                  />
                ))}
              </div>

              {!rawgError &&
              rawgResults.length >= resultLimit &&
              resultLimit < MAX_RESULT_LIMIT ? (
                <div className="flex justify-center pt-2">
                  <Link
                    className="rounded-lg border border-zinc-400 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:border-zinc-800 hover:text-emerald-600"
                    href={getShowMoreHref(query, resultLimit)}
                  >
                    Show more
                  </Link>
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="mt-10 space-y-4">
            <div>
              <p className="text-sm font-medium uppercase text-emerald-600">
                Your library
              </p>
              <h3 className="text-xl font-semibold">Recent Searches</h3>
            </div>

            {!currentProfile ? (
              <p className="rounded-lg border border-zinc-300 bg-white p-4 text-sm text-zinc-700">
                Log in to save games to your library.
              </p>
            ) : null}

            {currentProfile && savedGames.length === 0 ? (
              <p className="rounded-lg border border-zinc-300 bg-white p-4 text-sm text-zinc-700">
                No recent games yet. Search for a game to start building your
                library.
              </p>
            ) : null}

            {savedGames.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {savedGames.map((game) => (
                  <GameCard game={game} key={game.slug} />
                ))}
              </div>
            ) : null}
          </section>
        </section>
      </div>
    </main>
  );
}
