"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { installedPlatformOptions } from "@/lib/platforms";
import type {
  GamePickerParticipant,
  GameSummary,
  ListedGame,
} from "@/types/game";

type PickerMode = "solo" | "group";

type GamePickerProps = {
  currentProfile: GamePickerParticipant;
  friends: GamePickerParticipant[];
};

type PickerChoice = {
  game: GameSummary;
  platforms: string[];
  participantCount: number;
};

const anyPlatform = "Any";
const platformOptions = [
  anyPlatform,
  ...[...installedPlatformOptions].sort((a, b) => a.localeCompare(b)),
];

function gameMatchesPlatform(game: ListedGame, platform: string) {
  return (
    platform === anyPlatform ||
    game.platforms?.some(
      (gamePlatform) =>
        gamePlatform.toLowerCase() === platform.toLowerCase(),
    )
  );
}

function getParticipantGame(
  participant: GamePickerParticipant,
  slug: string,
  platform: string,
) {
  return participant.games.find(
    ({ game, platforms }) =>
      game.slug === slug &&
      (platform === anyPlatform ||
        platforms?.some(
          (gamePlatform) =>
            gamePlatform.toLowerCase() === platform.toLowerCase(),
        )),
  );
}

function getCommonPlatforms(games: ListedGame[]) {
  const platformSets = games
    .map(({ platforms }) => platforms ?? [])
    .filter((platforms) => platforms.length > 0);

  if (platformSets.length === 0) {
    return [];
  }

  return platformOptions
    .filter((platform) => platform !== anyPlatform)
    .filter((platform) =>
      platformSets.every((platforms) => platforms.includes(platform)),
    );
}

function getRandomChoice(choices: PickerChoice[]) {
  if (choices.length === 0) {
    return null;
  }

  return choices[Math.floor(Math.random() * choices.length)] ?? null;
}

function ChoiceCard({ choice }: { choice: PickerChoice }) {
  return (
    <section className="overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <div className="relative aspect-video bg-zinc-800">
          {choice.game.coverUrl ? (
            <Image
              alt=""
              className="h-full w-full object-cover"
              fill
              sizes="(max-width: 1024px) 100vw, 44rem"
              src={choice.game.coverUrl}
            />
          ) : (
            <div
              className={`flex h-full items-end ${choice.game.coverColor} p-5 text-sm font-semibold uppercase text-white`}
            >
              {choice.game.releaseYear}
            </div>
          )}
        </div>
        <div className="p-5">
          <p className="text-sm font-medium uppercase text-emerald-600">
            Tonight&apos;s pick
          </p>
          <h2 className="mt-1 text-3xl font-semibold leading-tight">
            {choice.game.title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
            <span>{choice.game.releaseYear}</span>
            {choice.platforms.map((platform) => (
              <span
                className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700"
                key={platform}
              >
                {platform}
              </span>
            ))}
            {choice.participantCount > 1 ? (
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                {choice.participantCount} libraries
              </span>
            ) : null}
          </div>
          <p className="mt-4 line-clamp-5 leading-7 text-zinc-700">
            {choice.game.summary}
          </p>
          <Link
            className="mt-5 inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
            href={`/games/${choice.game.slug}`}
          >
            Open game
          </Link>
        </div>
      </div>
    </section>
  );
}

export function GamePicker({ currentProfile, friends }: GamePickerProps) {
  const [mode, setMode] = useState<PickerMode>("solo");
  const [selectedPlatform, setSelectedPlatform] = useState(anyPlatform);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [choice, setChoice] = useState<PickerChoice | null>(null);

  const selectedFriends = useMemo(
    () => friends.filter((friend) => selectedFriendIds.includes(friend.id)),
    [friends, selectedFriendIds],
  );
  const participants = [currentProfile, ...selectedFriends];
  const soloChoices = currentProfile.games
    .filter((listedGame) => gameMatchesPlatform(listedGame, selectedPlatform))
    .map(({ game, platforms }) => ({
      game,
      platforms:
        selectedPlatform === anyPlatform
          ? (platforms ?? [])
          : [selectedPlatform],
      participantCount: 1,
    }));
  const groupChoices =
    selectedFriends.length === 0
      ? []
      : currentProfile.games.flatMap((listedGame) => {
          if (!gameMatchesPlatform(listedGame, selectedPlatform)) {
            return [];
          }

          const participantGames = participants.flatMap((participant) => {
            const match = getParticipantGame(
              participant,
              listedGame.game.slug,
              selectedPlatform,
            );

            return match ? [match] : [];
          });

          if (participantGames.length !== participants.length) {
            return [];
          }

          return [
            {
              game: listedGame.game,
              platforms:
                selectedPlatform === anyPlatform
                  ? getCommonPlatforms(participantGames)
                  : [selectedPlatform],
              participantCount: participants.length,
            },
          ];
        });
  const currentChoices = mode === "solo" ? soloChoices : groupChoices;

  function pickGame() {
    setChoice(getRandomChoice(currentChoices));
  }

  function selectMode(nextMode: PickerMode) {
    setMode(nextMode);
    setChoice(null);
  }

  function toggleFriend(friendId: string) {
    setChoice(null);
    setSelectedFriendIds((currentFriendIds) =>
      currentFriendIds.includes(friendId)
        ? currentFriendIds.filter((currentFriendId) => currentFriendId !== friendId)
        : [...currentFriendIds, friendId],
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium uppercase text-emerald-600">
          Picker mode
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            aria-pressed={mode === "solo"}
            className={`cursor-pointer rounded-lg border p-4 text-left transition ${
              mode === "solo"
                ? "border-emerald-600 bg-emerald-50"
                : "border-zinc-300 hover:border-zinc-500"
            }`}
            onClick={() => selectMode("solo")}
            type="button"
          >
            <span className="block text-lg font-semibold">
              Pick a game for me
            </span>
            <span className="mt-2 block text-sm leading-6 text-zinc-600">
              Pull one random game from your installed list.
            </span>
          </button>
          <button
            aria-pressed={mode === "group"}
            className={`cursor-pointer rounded-lg border p-4 text-left transition ${
              mode === "group"
                ? "border-emerald-600 bg-emerald-50"
                : "border-zinc-300 hover:border-zinc-500"
            }`}
            onClick={() => selectMode("group")}
            type="button"
          >
            <span className="block text-lg font-semibold">
              Pick a game for my group
            </span>
            <span className="mt-2 block text-sm leading-6 text-zinc-600">
              Compare installed lists and pick something everyone has.
            </span>
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase text-emerald-600">
              Platform
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              {selectedPlatform === anyPlatform
                ? "Any installed platform"
                : selectedPlatform}
            </h2>
          </div>
          <p className="text-sm text-zinc-600">
            {currentChoices.length} possible{" "}
            {currentChoices.length === 1 ? "game" : "games"}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {platformOptions.map((platform) => {
            const isSelected = selectedPlatform === platform;

            return (
              <button
                aria-pressed={isSelected}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  isSelected
                    ? "bg-zinc-950 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
                key={platform}
                onClick={() => {
                  setSelectedPlatform(platform);
                  setChoice(null);
                }}
                type="button"
              >
                {platform}
              </button>
            );
          })}
        </div>
      </section>

      {mode === "group" ? (
        <section className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase text-emerald-600">
                Group
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Who&apos;s playing?
              </h2>
            </div>
            <p className="text-sm text-zinc-600">
              You are included automatically.
            </p>
          </div>

          {friends.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {friends.map((friend) => {
                const isSelected = selectedFriendIds.includes(friend.id);

                return (
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-zinc-300 hover:border-zinc-500"
                    }`}
                    key={friend.id}
                  >
                    <input
                      checked={isSelected}
                      className="size-4 accent-emerald-600"
                      onChange={() => toggleFriend(friend.id)}
                      type="checkbox"
                    />
                    <ProfileAvatar
                      avatarUrl={friend.avatarUrl}
                      displayName={friend.displayName}
                      size="xs"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {friend.displayName}
                      </span>
                      <span className="block truncate text-sm text-zinc-500">
                        {friend.games.length} installed
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
              Add friends with installed games to use group picking.
            </p>
          )}
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="cursor-pointer rounded-md bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentChoices.length === 0}
          onClick={pickGame}
          type="button"
        >
          {choice ? "Pick again" : "Pick a game"}
        </button>
        {mode === "group" && selectedFriends.length === 0 ? (
          <p className="text-sm text-zinc-600">
            Select at least one friend to build a group pool.
          </p>
        ) : currentChoices.length === 0 ? (
          <p className="text-sm text-zinc-600">
            No games match this setup yet.
          </p>
        ) : null}
      </div>

      {choice ? <ChoiceCard choice={choice} /> : null}
    </div>
  );
}
