import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { InstalledListGrid } from "@/components/installed-list-grid";
import { getInstalledGames } from "@/data/grater";

export const dynamic = "force-dynamic";

export default async function InstalledListPage() {
  const games = await getInstalledGames();

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-zinc-950">
      <div className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <AppHeader />

        <section className="py-10">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium uppercase text-emerald-600">
              Your lists
            </p>
            <h2 className="text-2xl font-semibold">Installed games</h2>
            <p className="max-w-2xl leading-7 text-zinc-700">
              Your installed pool for friend picking and quick browsing.
            </p>
          </div>

          {games.length > 0 ? (
            <InstalledListGrid games={games} />
          ) : (
            <div className="mt-7 rounded-lg border border-zinc-300 bg-white p-5 text-sm text-zinc-700">
              <p>No installed games yet.</p>
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
