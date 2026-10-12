import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { GamePicker } from "@/components/game-picker";
import { getGamePickerData } from "@/data/grater";

export const dynamic = "force-dynamic";

export default async function PickerPage() {
  const { currentProfile, friends } = await getGamePickerData();

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-zinc-950">
      <div className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <AppHeader />

        <section className="py-10">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase text-emerald-600">
              Game picker
            </p>
            <h1 className="mt-1 text-4xl font-semibold leading-tight">
              Find something to play
            </h1>
            <p className="mt-4 text-lg leading-8 text-zinc-700">
              Pick from your installed list, or compare friend libraries to find
              something everyone already has ready.
            </p>
          </div>

          <div className="mt-8">
            {currentProfile ? (
              <GamePicker currentProfile={currentProfile} friends={friends} />
            ) : (
              <div className="rounded-lg border border-zinc-300 bg-white p-5 text-sm text-zinc-700 shadow-sm">
                <p>Log in to use the game picker.</p>
                <Link
                  className="mt-4 inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  href="/login"
                >
                  Log in
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
