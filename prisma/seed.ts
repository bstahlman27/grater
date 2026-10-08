import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { Visibility } from "../src/generated/prisma/enums";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");

  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    process.env[key] ??= value;
  }
}

loadEnvFile();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const profileId = "11111111-1111-4111-8111-111111111111";

const games = [
  {
    rawgId: 1001,
    slug: "hades",
    title: "Hades",
    releasedAt: new Date("2020-09-17"),
    summary:
      "Battle out of the underworld in a run-based action game with sharp combat and a huge cast.",
    metacritic: 93,
    rawgRating: 4.4,
  },
  {
    rawgId: 1002,
    slug: "outer-wilds",
    title: "Outer Wilds",
    releasedAt: new Date("2019-05-28"),
    summary:
      "Explore a hand-built solar system where knowledge is the main progression system.",
    metacritic: 85,
    rawgRating: 4.5,
  },
  {
    rawgId: 1003,
    slug: "citizen-sleeper",
    title: "Citizen Sleeper",
    releasedAt: new Date("2022-05-05"),
    summary:
      "Survive on a ruined space station through dice rolls, relationships, and hard choices.",
    metacritic: 82,
    rawgRating: 4.1,
  },
  {
    rawgId: 1004,
    slug: "disco-elysium",
    title: "Disco Elysium",
    releasedAt: new Date("2019-10-15"),
    summary:
      "Investigate a murder with a broken mind, a loud tie, and a city full of politics.",
    metacritic: 91,
    rawgRating: 4.4,
  },
  {
    rawgId: 1005,
    slug: "pentiment",
    title: "Pentiment",
    releasedAt: new Date("2022-11-15"),
    summary:
      "A manuscript-inspired mystery about art, faith, gossip, and consequences.",
    metacritic: 86,
    rawgRating: 4.0,
  },
  {
    rawgId: 1006,
    slug: "tunic",
    title: "Tunic",
    releasedAt: new Date("2022-03-16"),
    summary:
      "A tiny adventure full of hidden systems, secret pages, and hard-earned discoveries.",
    metacritic: 85,
    rawgRating: 4.2,
  },
];

const reviews = [
  {
    slug: "hades",
    rating: 10,
    body: "Sharp combat, excellent pacing, and one of the cleanest loops in the genre.",
  },
  {
    slug: "outer-wilds",
    rating: 10,
    body: "A game that turns curiosity into the whole control scheme.",
  },
  {
    slug: "citizen-sleeper",
    rating: 8,
    body: "Quiet, tense, and full of small choices that feel personal.",
  },
];

const playLaterSlugs = ["disco-elysium", "pentiment", "tunic"];
const installedSlugs = ["hades", "outer-wilds", "citizen-sleeper"];

async function main() {
  const profile = await prisma.profile.upsert({
    where: { username: "grater-user" },
    update: {
      bio: "Seed profile for local Grater development.",
      displayName: "Grater User",
    },
    create: {
      id: profileId,
      email: "grater@example.com",
      username: "grater-user",
      displayName: "Grater User",
      bio: "Seed profile for local Grater development.",
    },
  });

  const gameBySlug = new Map<string, { id: string }>();

  for (const game of games) {
    const savedGame = await prisma.game.upsert({
      where: { rawgId: game.rawgId },
      update: {
        slug: game.slug,
        title: game.title,
        releasedAt: game.releasedAt,
        summary: game.summary,
        metacritic: game.metacritic,
        rawgRating: game.rawgRating,
        rawgLastSyncedAt: new Date(),
      },
      create: {
        ...game,
        rawgLastSyncedAt: new Date(),
      },
      select: {
        id: true,
        slug: true,
      },
    });

    gameBySlug.set(savedGame.slug, savedGame);
  }

  for (const review of reviews) {
    const game = gameBySlug.get(review.slug);

    if (!game) {
      throw new Error(`Missing seeded game for review: ${review.slug}`);
    }

    await prisma.review.upsert({
      where: {
        profileId_gameId: {
          profileId: profile.id,
          gameId: game.id,
        },
      },
      update: {
        rating: review.rating,
        body: review.body,
        visibility: Visibility.FRIENDS,
      },
      create: {
        profileId: profile.id,
        gameId: game.id,
        rating: review.rating,
        body: review.body,
        visibility: Visibility.FRIENDS,
      },
    });
  }

  for (const slug of playLaterSlugs) {
    const game = gameBySlug.get(slug);

    if (!game) {
      throw new Error(`Missing seeded play later game: ${slug}`);
    }

    await prisma.playLaterItem.upsert({
      where: {
        profileId_gameId: {
          profileId: profile.id,
          gameId: game.id,
        },
      },
      update: {
        visibility: slug === "tunic" ? Visibility.FRIENDS : Visibility.PRIVATE,
      },
      create: {
        profileId: profile.id,
        gameId: game.id,
        visibility: slug === "tunic" ? Visibility.FRIENDS : Visibility.PRIVATE,
      },
    });
  }

  for (const slug of installedSlugs) {
    const game = gameBySlug.get(slug);

    if (!game) {
      throw new Error(`Missing seeded installed game: ${slug}`);
    }

    await prisma.installedGameItem.upsert({
      where: {
        profileId_gameId: {
          profileId: profile.id,
          gameId: game.id,
        },
      },
      update: {
        visibility: Visibility.FRIENDS,
        platform: "PC",
      },
      create: {
        profileId: profile.id,
        gameId: game.id,
        visibility: Visibility.FRIENDS,
        platform: "PC",
      },
    });
  }

  console.log(`Seeded ${games.length} games for ${profile.username}.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
