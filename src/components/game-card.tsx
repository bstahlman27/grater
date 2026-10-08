import Link from "next/link";
import type { GameSummary } from "@/types/game";

type GameCardProps = {
  game: GameSummary;
};

export function GameCard({ game }: GameCardProps) {
  return (
    <Link
      className="group grid grid-cols-[5rem_1fr] gap-4 rounded-lg border border-zinc-300 bg-white p-4 shadow-sm transition hover:border-zinc-500"
      href={`/games/${game.slug}`}
    >
      <div
        className={`flex aspect-[3/4] items-end rounded-md ${game.coverColor} p-3 text-xs font-semibold uppercase text-white`}
      >
        {game.releaseYear}
      </div>
      <div>
        <h2 className="text-lg font-semibold group-hover:text-red-700">
          {game.title}
        </h2>
        <p className="mt-1 text-sm text-zinc-600">{game.releaseYear}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-700">
          {game.summary}
        </p>
      </div>
    </Link>
  );
}
