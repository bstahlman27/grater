import { prisma } from "@/lib/prisma";
import { Visibility } from "@/generated/prisma/enums";
import { getSignedInProfile, requireSignedInProfile } from "@/lib/auth";
import { getRawgGameDetails } from "@/lib/rawg";
import type {
  GameDetail,
  GameListState,
  GameSummary,
  ListedGame,
  ProfileSummary,
  ReviewedGame,
  ReviewSummary,
} from "@/types/game";

const coverColors = new Map<string, string>([
  ["hades", "bg-red-700"],
  ["outer-wilds", "bg-sky-800"],
  ["citizen-sleeper", "bg-emerald-800"],
  ["disco-elysium", "bg-orange-800"],
  ["pentiment", "bg-stone-700"],
  ["tunic", "bg-lime-700"],
]);

type GameRecord = {
  slug: string;
  title: string;
  releasedAt: Date | null;
  summary: string | null;
  backgroundUrl: string | null;
  coverUrl: string | null;
};

type GameDetailRecord = GameRecord & {
  metacritic: number | null;
  rawgRating: number | null;
};

type ReviewRecord = {
  id: string;
  rating: number;
  body: string | null;
  containsSpoilers: boolean;
  updatedAt: Date;
  visibility: Visibility;
};

export type SaveReviewInput = {
  body: string | null;
  containsSpoilers: boolean;
  rating: number;
  visibility: ListedGame["visibility"];
};

function formatDate(date: Date | null) {
  if (!date) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getReleaseYear(date: Date | null) {
  return date ? String(date.getFullYear()) : "TBD";
}

function getCoverColor(slug: string) {
  return coverColors.get(slug) ?? "bg-zinc-700";
}

function toVisibilityLabel(visibility: Visibility): ListedGame["visibility"] {
  return visibility === Visibility.FRIENDS ? "friends" : "private";
}

function toGameSummary(game: GameRecord): GameSummary {
  return {
    slug: game.slug,
    title: game.title,
    releaseYear: getReleaseYear(game.releasedAt),
    summary: game.summary ?? "No summary cached yet.",
    coverColor: getCoverColor(game.slug),
    coverUrl: game.coverUrl ?? game.backgroundUrl,
  };
}

function toGameDetail(game: GameDetailRecord): GameDetail {
  return {
    ...toGameSummary(game),
    releasedAt: formatDate(game.releasedAt),
    metacritic: game.metacritic,
    rawgRating: game.rawgRating,
  };
}

function toReviewSummary(review: ReviewRecord): ReviewSummary {
  return {
    id: review.id,
    rating: review.rating / 2,
    body: review.body ?? "",
    containsSpoilers: review.containsSpoilers,
    updatedAt: formatDate(review.updatedAt),
    visibility: toVisibilityLabel(review.visibility),
  };
}

export async function getAllGames(): Promise<GameSummary[]> {
  const games = await prisma.game.findMany({
    orderBy: {
      title: "asc",
    },
  });

  return games.map(toGameSummary);
}

export async function getGameSlugs() {
  return prisma.game.findMany({
    orderBy: {
      slug: "asc",
    },
    select: {
      slug: true,
    },
  });
}

export async function getGamePageData(slug: string) {
  const profile = await getSignedInProfile();

  if (!profile) {
    const game = await prisma.game.findUnique({
      where: {
        slug,
      },
    });

    if (!game) {
      return null;
    }

    return {
      game: toGameDetail(game),
      isSignedIn: false,
      review: null,
      listState: {
        inPlayLater: false,
        playLaterVisibility: null,
        inInstalled: false,
        installedVisibility: null,
        installedPlatform: null,
      } satisfies GameListState,
    };
  }

  const game = await prisma.game.findUnique({
    where: {
      slug,
    },
    include: {
      reviews: {
        where: {
          profileId: profile.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
      },
      playLaterItems: {
        where: {
          profileId: profile.id,
        },
        take: 1,
      },
      installedGameItems: {
        where: {
          profileId: profile.id,
        },
        take: 1,
      },
    },
  });

  if (!game) {
    return null;
  }

  return {
    game: toGameDetail(game),
    isSignedIn: true,
    review: game.reviews[0] ? toReviewSummary(game.reviews[0]) : null,
    listState: {
      inPlayLater: Boolean(game.playLaterItems[0]),
      playLaterVisibility: game.playLaterItems[0]
        ? toVisibilityLabel(game.playLaterItems[0].visibility)
        : null,
      inInstalled: Boolean(game.installedGameItems[0]),
      installedVisibility: game.installedGameItems[0]
        ? toVisibilityLabel(game.installedGameItems[0].visibility)
        : null,
      installedPlatform: game.installedGameItems[0]?.platform ?? null,
    } satisfies GameListState,
  };
}

export async function getReviewedGames(): Promise<ReviewedGame[]> {
  const profile = await getSignedInProfile();

  if (!profile) {
    return [];
  }

  const reviews = await prisma.review.findMany({
    where: {
      profileId: profile.id,
    },
    include: {
      game: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return reviews.map((review) => ({
    game: toGameSummary(review.game),
    review: toReviewSummary(review),
  }));
}

export async function getPlayLaterGames(): Promise<ListedGame[]> {
  const profile = await getSignedInProfile();

  if (!profile) {
    return [];
  }

  const items = await prisma.playLaterItem.findMany({
    where: {
      profileId: profile.id,
    },
    include: {
      game: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return items.map((item) => ({
    game: toGameSummary(item.game),
    visibility: toVisibilityLabel(item.visibility),
  }));
}

export async function getInstalledGames(): Promise<ListedGame[]> {
  const profile = await getSignedInProfile();

  if (!profile) {
    return [];
  }

  const items = await prisma.installedGameItem.findMany({
    where: {
      profileId: profile.id,
    },
    include: {
      game: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return items.map((item) => ({
    game: toGameSummary(item.game),
    visibility: toVisibilityLabel(item.visibility),
    platform: item.platform,
  }));
}

export async function getCurrentProfile(): Promise<ProfileSummary | null> {
  const signedInProfile = await getSignedInProfile();

  if (!signedInProfile) {
    return null;
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: signedInProfile.id,
    },
    select: {
      username: true,
      displayName: true,
      bio: true,
    },
  });

  if (!profile) {
    return null;
  }

  return {
    username: profile.username,
    displayName: profile.displayName ?? profile.username,
    bio: profile.bio,
  };
}

export async function cacheRawgGame(rawgId: number): Promise<GameSummary> {
  const rawgGame = await getRawgGameDetails(rawgId);
  const releasedAt = rawgGame.releasedAt ? new Date(rawgGame.releasedAt) : null;

  const existingByRawgId = await prisma.game.findUnique({
    where: {
      rawgId,
    },
  });

  if (existingByRawgId) {
    const game = await prisma.game.update({
      where: {
        rawgId,
      },
      data: {
        slug: rawgGame.slug,
        title: rawgGame.title,
        releasedAt,
        backgroundUrl: rawgGame.backgroundUrl,
        coverUrl: rawgGame.backgroundUrl,
        summary: rawgGame.summary,
        metacritic: rawgGame.metacritic,
        rawgRating: rawgGame.rawgRating,
        rawgLastSyncedAt: new Date(),
      },
    });

    return toGameSummary(game);
  }

  const existingBySlug = await prisma.game.findUnique({
    where: {
      slug: rawgGame.slug,
    },
  });

  if (existingBySlug) {
    const game = await prisma.game.update({
      where: {
        slug: rawgGame.slug,
      },
      data: {
        rawgId,
        title: rawgGame.title,
        releasedAt,
        backgroundUrl: rawgGame.backgroundUrl,
        coverUrl: rawgGame.backgroundUrl,
        summary: rawgGame.summary,
        metacritic: rawgGame.metacritic,
        rawgRating: rawgGame.rawgRating,
        rawgLastSyncedAt: new Date(),
      },
    });

    return toGameSummary(game);
  }

  const game = await prisma.game.create({
    data: {
      rawgId,
      slug: rawgGame.slug,
      title: rawgGame.title,
      releasedAt,
      backgroundUrl: rawgGame.backgroundUrl,
      coverUrl: rawgGame.backgroundUrl,
      summary: rawgGame.summary,
      metacritic: rawgGame.metacritic,
      rawgRating: rawgGame.rawgRating,
      rawgLastSyncedAt: new Date(),
    },
  });

  return toGameSummary(game);
}

export async function togglePlayLaterGame(slug: string) {
  const [profile, game] = await Promise.all([
    requireSignedInProfile(),
    prisma.game.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!game) {
    throw new Error(`Game not found: ${slug}`);
  }

  const existingItem = await prisma.playLaterItem.findUnique({
    where: {
      profileId_gameId: {
        profileId: profile.id,
        gameId: game.id,
      },
    },
  });

  if (existingItem) {
    await prisma.playLaterItem.delete({
      where: {
        id: existingItem.id,
      },
    });

    return;
  }

  await prisma.playLaterItem.create({
    data: {
      profileId: profile.id,
      gameId: game.id,
      visibility: Visibility.PRIVATE,
    },
  });
}

export async function toggleInstalledGame(slug: string) {
  const [profile, game] = await Promise.all([
    requireSignedInProfile(),
    prisma.game.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!game) {
    throw new Error(`Game not found: ${slug}`);
  }

  const existingItem = await prisma.installedGameItem.findUnique({
    where: {
      profileId_gameId: {
        profileId: profile.id,
        gameId: game.id,
      },
    },
  });

  if (existingItem) {
    await prisma.installedGameItem.delete({
      where: {
        id: existingItem.id,
      },
    });

    return;
  }

  await prisma.installedGameItem.create({
    data: {
      profileId: profile.id,
      gameId: game.id,
      visibility: Visibility.FRIENDS,
      platform: "PC",
    },
  });
}

export async function saveReviewForGame(slug: string, input: SaveReviewInput) {
  const [profile, game] = await Promise.all([
    requireSignedInProfile(),
    prisma.game.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!game) {
    throw new Error(`Game not found: ${slug}`);
  }

  const rating = input.rating * 2;

  await prisma.review.upsert({
    where: {
      profileId_gameId: {
        profileId: profile.id,
        gameId: game.id,
      },
    },
    update: {
      body: input.body,
      containsSpoilers: input.containsSpoilers,
      rating,
      visibility:
        input.visibility === "friends" ? Visibility.FRIENDS : Visibility.PRIVATE,
    },
    create: {
      profileId: profile.id,
      gameId: game.id,
      body: input.body,
      containsSpoilers: input.containsSpoilers,
      rating,
      visibility:
        input.visibility === "friends" ? Visibility.FRIENDS : Visibility.PRIVATE,
    },
  });
}
