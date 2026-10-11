import Image from "next/image";
import Link from "next/link";
import type { ListedGame } from "@/types/game";

type ListPreviewCardProps = {
  games: ListedGame[];
  href: string;
  title: string;
};

const previewSlots = 6;

export function ListPreviewCard({ games, href, title }: ListPreviewCardProps) {
  const previewGames = games.slice(0, previewSlots);
  const placeholders = Array.from({
    length: Math.max(previewSlots - previewGames.length, 0),
  });

  return (
    <Link
      className="group block rounded-lg border border-zinc-300 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-lg"
      href={href}
    >
      <span className="grid aspect-[1.28] grid-cols-3 grid-rows-2 gap-2">
        {previewGames.map(({ game }) => (
          <span
            className="relative overflow-hidden rounded-md border border-zinc-200 bg-zinc-100"
            key={game.slug}
          >
            {game.coverUrl ? (
              <Image
                alt=""
                className="h-full w-full object-cover"
                fill
                sizes="8rem"
                src={game.coverUrl}
              />
            ) : (
              <span
                className={`flex h-full items-end ${game.coverColor} p-2 text-[0.6rem] font-semibold uppercase text-white`}
              >
                {game.releaseYear}
              </span>
            )}
          </span>
        ))}

        {placeholders.map((_, index) => (
          <span
            className="rounded-md border border-dashed border-zinc-300 bg-zinc-100"
            key={`placeholder-${index}`}
          />
        ))}
      </span>

      <span className="mt-4 flex items-end justify-between gap-3">
        <span className="text-lg font-semibold text-zinc-950 group-hover:text-amber-500">
          {title}
        </span>
        <span className="text-sm font-medium text-zinc-500">
          {games.length}
        </span>
      </span>
    </Link>
  );
}
