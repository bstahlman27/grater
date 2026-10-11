import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { GameCard } from "@/components/game-card";
import { getPlayLaterGames } from "@/data/grater";

export const dynamic = "force-dynamic";

export default async function PlayLaterListPage() {
  const games = await getPlayLaterGames();

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-zinc-950">
      <div className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <AppHeader />

        <section className="py-10">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium uppercase text-emerald-600">
              Your lists
            </p>
            <h2 className="text-2xl font-semibold">Play later</h2>
            <p className="max-w-2xl leading-7 text-zinc-700">
              Games you saved for later, shown in the same browseable grid as
              your game library.
            </p>
          </div>

          {games.length > 0 ? (
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {games.map(({ game }) => (
                <GameCard game={game} key={game.slug} />
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-lg border border-zinc-300 bg-white p-5 text-sm text-zinc-700">
              <p>No play-later games yet.</p>
              <Link
                className="mt-3 inline-flex font-semibold text-emerald-600 transition hover:text-amber-500"
                href="/games"
              >
                Browse games
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
