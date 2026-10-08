import { AppHeader } from "@/components/app-header";
import { ListPanel } from "@/components/list-panel";
import { ReviewCard } from "@/components/review-card";
import {
  getCurrentProfile,
  getInstalledGames,
  getPlayLaterGames,
  getReviewedGames,
} from "@/data/grater";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [profile, reviewedGames, playLaterGames, installedGames] = await Promise.all([
    getCurrentProfile(),
    getReviewedGames(),
    getPlayLaterGames(),
    getInstalledGames(),
  ]);

  const username = profile?.username ?? "not-signed-in";
  const displayName = profile?.displayName ?? username;

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-zinc-950">
      <div className="mx-auto w-full max-w-6xl px-6 py-6 sm:px-8 lg:px-10">
        <AppHeader />

        <section className="grid gap-8 py-10 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="space-y-5">
            <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-lg bg-red-700 text-2xl font-semibold text-white">
                  G
                </div>
                <div>
                  <p className="text-sm font-medium uppercase text-red-700">
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
              <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-zinc-500">Reviews</dt>
                  <dd className="mt-1 text-lg font-semibold">{reviewedGames.length}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Later</dt>
                  <dd className="mt-1 text-lg font-semibold">{playLaterGames.length}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Installed</dt>
                  <dd className="mt-1 text-lg font-semibold">{installedGames.length}</dd>
                </div>
              </dl>
            </section>

            <ListPanel
              eyebrow="Play later"
              games={playLaterGames}
              title="Saved games"
            />
            <ListPanel
              eyebrow="Installed"
              games={installedGames}
              title="Ready to play"
            />
          </aside>

          <section className="space-y-4">
            <div>
              <p className="text-sm font-medium uppercase text-red-700">
                Public to friends
              </p>
              <h2 className="mt-1 text-2xl font-semibold">Reviews</h2>
            </div>
            <div className="grid gap-4">
              {reviewedGames.map(({ review, game }) => (
                <ReviewCard game={game} key={review.id} review={review} />
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
