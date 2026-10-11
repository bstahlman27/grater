"use client";

import { useState } from "react";
import { GameCard } from "@/components/game-card";
import { installedPlatformOptions } from "@/lib/platforms";
import type { ListedGame } from "@/types/game";

type InstalledListGridProps = {
  games: ListedGame[];
};

const allPlatformFilter = "All";
const sortedPlatformOptions = [...installedPlatformOptions].sort((a, b) =>
  a.localeCompare(b),
);

export function InstalledListGrid({ games }: InstalledListGridProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const platformFilters = [allPlatformFilter, ...sortedPlatformOptions];
  const filteredGames =
    selectedPlatforms.length === 0
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
    <div className="mt-7 space-y-5">
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3">
        {platformFilters.map((platform) => {
          const isSelected =
            platform === allPlatformFilter
              ? selectedPlatforms.length === 0
              : selectedPlatforms.includes(platform);

          return (
            <button
              aria-pressed={isSelected}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold transition ${
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

      {filteredGames.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredGames.map(({ game, platforms }) => (
            <GameCard game={game} key={game.slug} platforms={platforms} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-zinc-300 bg-white p-5 text-sm text-zinc-700">
          No installed games for {selectedPlatforms.join(", ")}.
        </p>
      )}
    </div>
  );
}
