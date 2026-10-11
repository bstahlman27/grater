"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { VisibilityBadge } from "@/components/visibility-badge";
import { installedPlatformOptions } from "@/lib/platforms";
import type { ListedGame } from "@/types/game";

type ListPanelProps = {
  eyebrow: string;
  filterByPlatform?: boolean;
  title: string;
  games: ListedGame[];
  viewHref?: string;
};

const allPlatformFilter = "All";
const sortedPlatformOptions = [...installedPlatformOptions].sort((a, b) =>
  a.localeCompare(b),
);

export function ListPanel({
  eyebrow,
  filterByPlatform = false,
  title,
  games,
  viewHref,
}: ListPanelProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const platformFilters = [allPlatformFilter, ...sortedPlatformOptions];
  const filteredGames =
    !filterByPlatform || selectedPlatforms.length === 0
      ? games
      : games.filter(({ platforms }) =>
          platforms?.some((platform) =>
            selectedPlatforms.some(
              (selectedPlatform) =>
                platform.toLowerCase() === selectedPlatform.toLowerCase(),
            ),
          ),
        );

  function togglePlatform(platform: string) {
    if (platform === allPlatformFilter) {
      setSelectedPlatforms([]);
      return;
    }

    setSelectedPlatforms((currentPlatforms) =>
      currentPlatforms.includes(platform)
        ? currentPlatforms.filter((currentPlatform) => currentPlatform !== platform)
        : [...currentPlatforms, platform],
    );
  }

  return (
    <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase text-emerald-700">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{title}</h2>
        </div>

        {viewHref ? (
          <Link
            className="mt-1 shrink-0 text-xs font-semibold text-zinc-600 transition hover:text-amber-500"
            href={viewHref}
          >
            Open list
          </Link>
        ) : null}
      </div>

      {filterByPlatform ? (
        <div className="mt-4 flex flex-wrap gap-2 border-b border-zinc-200 pb-3">
          {platformFilters.map((platform) => {
            const isSelected =
              platform === allPlatformFilter
                ? selectedPlatforms.length === 0
                : selectedPlatforms.includes(platform);

            return (
              <button
                aria-pressed={isSelected}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-zinc-950 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
                key={platform}
                onClick={() => togglePlatform(platform)}
                type="button"
              >
                {platform}
              </button>
            );
          })}
        </div>
      ) : null}

      <ul className="mt-5 space-y-3">
        {filteredGames.map(({ game, platforms, visibility }) => (
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
                <span className="block truncate font-medium group-hover:text-amber-500">
                  {game.title}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                  <span>{game.releaseYear}</span>
                  {platforms && platforms.length > 0 ? (
                    <span>{platforms.join(", ")}</span>
                  ) : null}
                  <VisibilityBadge visibility={visibility} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {filteredGames.length === 0 ? (
        <p className="mt-5 rounded-md bg-zinc-50 p-3 text-sm text-zinc-600">
          No games here yet.
        </p>
      ) : null}
    </section>
  );
}
