import Image from "next/image";
import Link from "next/link";
import type { ListedGame } from "@/types/game";

type ListPanelProps = {
  eyebrow: string;
  title: string;
  games: ListedGame[];
};

export function ListPanel({ eyebrow, title, games }: ListPanelProps) {
  return (
    <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium uppercase text-emerald-700">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-semibold">{title}</h2>
      <ul className="mt-5 space-y-3">
        {games.map(({ game, visibility }) => (
          <li key={game.slug}>
            <Link
              className="group grid grid-cols-[4.5rem_1fr] gap-3 rounded-md border border-zinc-200 bg-white p-2 text-sm transition hover:border-zinc-400 hover:shadow-sm"
              href={`/games/${game.slug}`}
            >
              <span className="relative aspect-video overflow-hidden rounded bg-zinc-200">
                {game.coverUrl ? (
                  <Image
                    alt=""
                    className="h-full w-full object-cover"
                    fill
                    sizes="4.5rem"
                    src={game.coverUrl}
                  />
                ) : (
                  <span
                    className={`flex h-full items-end ${game.coverColor} p-2 text-[0.65rem] font-semibold uppercase text-white`}
                  >
                    {game.releaseYear}
                  </span>
                )}
              </span>

              <span className="min-w-0">
                <span className="block truncate font-medium group-hover:text-red-700">
                  {game.title}
                </span>
                <span className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                  <span>{game.releaseYear}</span>
                  <span>{visibility}</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
