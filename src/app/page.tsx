import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { ListPanel } from "@/components/list-panel";
import { ReviewCard } from "@/components/review-card";
import {
  getInstalledGames,
  getPlayLaterGames,
  getReviewedGames,
} from "@/data/grater";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [reviewedGames, playLaterGames, installedGames] = await Promise.all([
    getReviewedGames(),
    getPlayLaterGames(),
    getInstalledGames(),
  ]);

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <AppHeader />

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-8">
            <section>
              <p className="max-w-2xl text-lg leading-8 text-zinc-700">
                Track what you play, rate games out of five stars, keep a play
                later list, and share reviews with friends when you want them to
                see what stuck with you.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                  href="/games"
                >
                  Browse games
                </Link>
                <Link
                  className="rounded-lg border border-zinc-400 px-4 py-2 text-sm font-semibold text-zinc-800 hover:border-zinc-800"
                  href="/profile"
                >
                  View profile
                </Link>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase text-red-700">
                    Recent reviews
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">Journal</h2>
                </div>
                <p className="text-sm text-zinc-600">One editable review per game</p>
              </div>

              <div className="grid gap-4">
                {reviewedGames.map(({ review, game }) => (
                  <ReviewCard game={game} key={review.id} review={review} />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <ListPanel
              eyebrow="Play later"
              games={playLaterGames}
              title="Saved for later"
            />
            <ListPanel
              eyebrow="Installed"
              games={installedGames}
              title="Friend picker pool"
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
