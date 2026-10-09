import Link from "next/link";
import Image from "next/image";
import type { GameSummary } from "@/types/game";

type GameCardProps = {
  game: GameSummary;
};

export function GameCard({ game }: GameCardProps) {
  return (
    <Link
      className="group block overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-500 hover:shadow-lg"
      href={`/games/${game.slug}`}
    >
      <div className="relative aspect-video overflow-hidden bg-zinc-800">
        {game.coverUrl ? (
          <Image
            alt=""
            className="h-full w-full object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 24rem"
            src={game.coverUrl}
          />
        ) : (
          <div
            className={`flex h-full items-end ${game.coverColor} p-4 text-xs font-semibold uppercase text-white`}
          >
            {game.releaseYear}
          </div>
        )}
      </div>
      <div className="p-4">
        <h2 className="line-clamp-2 text-xl font-semibold leading-6 text-zinc-950 group-hover:text-red-700">
          {game.title}
        </h2>
        <p className="mt-2 text-sm text-zinc-600">{game.releaseYear}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-700">
          {game.summary}
        </p>
      </div>
    </Link>
  );
}
