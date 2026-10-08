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
          <li
            className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-3 text-sm last:border-b-0 last:pb-0"
            key={game.slug}
          >
            <Link className="font-medium hover:text-red-700" href={`/games/${game.slug}`}>
              {game.title}
            </Link>
            <span className="text-zinc-500">{visibility}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
