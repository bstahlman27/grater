import { prisma } from "@/lib/prisma";
import {
  FriendshipStatus,
  ReviewVoteValue,
  Visibility,
} from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { getSignedInProfile, requireSignedInProfile } from "@/lib/auth";
import {
  type InstalledPlatform,
  parseInstalledPlatforms,
  serializeInstalledPlatforms,
} from "@/lib/platforms";
import { getRawgGameDetails } from "@/lib/rawg";
import type {
  GameDetail,
  GameListState,
  GamePickerData,
  GamePickerParticipant,
  GameSummary,
  HomeProfileSummary,
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
  comments?: ReviewCommentRecord[];
  containsSpoilers: boolean;
  pinned: boolean;
  profileId: string;
  updatedAt: Date;
  visibility: Visibility;
  votes?: ReviewVoteRecord[];
};
type ReviewProfileRecord = {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type ReviewWithProfileRecord = ReviewRecord & {
  profile: ReviewProfileRecord;
};

type ReviewCommentRecord = {
  id: string;
  body: string;
  profileId: string;
  createdAt: Date;
  profile: ReviewProfileRecord;
};

type ReviewVoteRecord = {
  profileId: string;
  value: ReviewVoteValue;
};

export type SaveReviewInput = {
  body: string | null;
  containsSpoilers: boolean;
  rating: number;
  visibility: ListedGame["visibility"];
};

type SaveListVisibilityInput = {
  visibility: ListedGame["visibility"];
};

type SavedGameLibrary = {
  games: GameSummary[];
  profile: ProfileSummary | null;
};

const reviewInteractionInclude = {
  comments: {
    include: {
      profile: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  votes: {
    select: {
      profileId: true,
      value: true,
    },
  },
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

function sortListedGamesByTitle(games: ListedGame[]) {
  return games.toSorted((a, b) => a.game.title.localeCompare(b.game.title));
}

function toReviewSummary(
  review: ReviewRecord,
  viewerProfileId: string | null = null,
): ReviewSummary {
  const votes = review.votes ?? [];
  const viewerVote = votes.find((vote) => vote.profileId === viewerProfileId);

  return {
    id: review.id,
    rating: review.rating / 2,
    body: review.body ?? "",
    canManage: Boolean(viewerProfileId && review.profileId === viewerProfileId),
    canComment: Boolean(viewerProfileId),
    canVote: Boolean(viewerProfileId),
    comments: (review.comments ?? []).map((comment) => ({
      id: comment.id,
      body: comment.body,
      canManage: Boolean(
        viewerProfileId && comment.profileId === viewerProfileId,
      ),
      createdAt: formatDate(comment.createdAt),
      author: {
        username: comment.profile.username,
        displayName: comment.profile.displayName ?? comment.profile.username,
        avatarUrl: comment.profile.avatarUrl,
      },
    })),
    containsSpoilers: review.containsSpoilers,
    dislikeCount: votes.filter((vote) => vote.value === ReviewVoteValue.DISLIKE)
      .length,
    likeCount: votes.filter((vote) => vote.value === ReviewVoteValue.LIKE)
      .length,
    pinned: review.pinned,
    updatedAt: formatDate(review.updatedAt),
    viewerVote:
      viewerVote?.value === ReviewVoteValue.LIKE
        ? "like"
        : viewerVote?.value === ReviewVoteValue.DISLIKE
          ? "dislike"
          : null,
    visibility: toVisibilityLabel(review.visibility),
  };
}

function toTimelineReviewSummary(
  review: ReviewWithProfileRecord,
  viewerProfileId: string | null = null,
): ReviewSummary {
  return {
    ...toReviewSummary(review, viewerProfileId),
    author: {
      username: review.profile.username,
      displayName: review.profile.displayName ?? review.profile.username,
      avatarUrl: review.profile.avatarUrl,
    },
  };
}

function toProfileSummary(profile: {
  avatarUrl: string | null;
  bio: string | null;
  displayName: string | null;
  username: string;
}): ProfileSummary {
  return {
    username: profile.username,
    displayName: profile.displayName ?? profile.username,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
  };
}

export async function getSavedGameLibrary(): Promise<SavedGameLibrary> {
  const signedInProfile = await getSignedInProfile();

  if (!signedInProfile) {
    return {
      games: [],
      profile: null,
    };
  }

  const [profile, items] = await Promise.all([
    prisma.profile.findUnique({
      where: {
        id: signedInProfile.id,
      },
      select: {
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
      },
    }),
    prisma.savedGameItem.findMany({
      where: {
        profileId: signedInProfile.id,
      },
      include: {
        game: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    games: items.map((item) => toGameSummary(item.game)),
    profile: profile ? toProfileSummary(profile) : null,
  };
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
      friendReviews: [],
      isSignedIn: false,
      review: null,
      listState: {
        inPlayLater: false,
        playLaterVisibility: null,
        inInstalled: false,
        installedVisibility: null,
        installedPlatforms: [],
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
        include: reviewInteractionInclude,
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

  const friendProfileIds = await getAcceptedFriendProfileIds(profile.id);
  const friendReviews =
    friendProfileIds.length > 0
      ? await prisma.review.findMany({
          where: {
            gameId: game.id,
            profileId: {
              in: friendProfileIds,
            },
            visibility: Visibility.FRIENDS,
          },
          include: {
            game: true,
            profile: {
              select: {
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
            ...reviewInteractionInclude,
          },
          orderBy: {
            updatedAt: "desc",
          },
        })
      : [];

  return {
    game: toGameDetail(game),
    friendReviews: friendReviews.map((friendReview) => ({
      game: toGameSummary(friendReview.game),
      review: toTimelineReviewSummary(friendReview, profile.id),
    })),
    isSignedIn: true,
    review: game.reviews[0]
      ? {
          ...toReviewSummary(game.reviews[0], profile.id),
          author: {
            username: profile.username,
            displayName: profile.displayName ?? profile.username,
            avatarUrl: profile.avatarUrl,
          },
        }
      : null,
    listState: {
      inPlayLater: Boolean(game.playLaterItems[0]),
      playLaterVisibility: game.playLaterItems[0]
        ? toVisibilityLabel(game.playLaterItems[0].visibility)
        : null,
      inInstalled: Boolean(game.installedGameItems[0]),
      installedVisibility: game.installedGameItems[0]
        ? toVisibilityLabel(game.installedGameItems[0].visibility)
        : null,
      installedPlatforms: parseInstalledPlatforms(
        game.installedGameItems[0]?.platform ?? null,
      ),
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
      ...reviewInteractionInclude,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return reviews.map((review) => ({
    game: toGameSummary(review.game),
    review: toReviewSummary(review, profile.id),
  }));
}

export async function getHomeProfile(): Promise<HomeProfileSummary | null> {
  const signedInProfile = await getSignedInProfile();

  if (!signedInProfile) {
    return null;
  }

  const [profile, reviewCount, friendCount] = await Promise.all([
    prisma.profile.findUnique({
      where: {
        id: signedInProfile.id,
      },
      select: {
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
      },
    }),
    prisma.review.count({
      where: {
        profileId: signedInProfile.id,
      },
    }),
    prisma.friendship.count({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [
          {
            userAId: signedInProfile.id,
          },
          {
            userBId: signedInProfile.id,
          },
        ],
      },
    }),
  ]);

  if (!profile) {
    return null;
  }

  return {
    ...toProfileSummary(profile),
    reviewCount,
    friendCount,
  };
}

async function canViewFriendContent(profileId: string, viewerId: string | null) {
  if (!viewerId) {
    return false;
  }

  if (profileId === viewerId) {
    return true;
  }

  const friendship = await prisma.friendship.findFirst({
    where: {
      status: FriendshipStatus.ACCEPTED,
      OR: [
        {
          userAId: profileId,
          userBId: viewerId,
        },
        {
          userAId: viewerId,
          userBId: profileId,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return Boolean(friendship);
}

async function getAcceptedFriendProfileIds(profileId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: FriendshipStatus.ACCEPTED,
      OR: [
        {
          userAId: profileId,
        },
        {
          userBId: profileId,
        },
      ],
    },
    select: {
      userAId: true,
      userBId: true,
    },
  });

  return friendships.map((friendship) =>
    friendship.userAId === profileId ? friendship.userBId : friendship.userAId,
  );
}

export async function getProfilePageData(username: string) {
  const normalizedUsername = username.trim().toLowerCase();
  const [viewerProfile, targetProfile] = await Promise.all([
    getSignedInProfile(),
    prisma.profile.findUnique({
      where: {
        username: normalizedUsername,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
      },
    }),
  ]);

  if (!targetProfile) {
    return null;
  }

  const isCurrentUser = viewerProfile?.id === targetProfile.id;
  const canViewContent = await canViewFriendContent(
    targetProfile.id,
    viewerProfile?.id ?? null,
  );
  const visibilityFilter = isCurrentUser
    ? undefined
    : {
        visibility: Visibility.FRIENDS,
      };
  const [reviews, playLaterItems, installedItems, friendCount] =
    await Promise.all([
      canViewContent
        ? prisma.review.findMany({
            where: {
              profileId: targetProfile.id,
              ...visibilityFilter,
            },
            include: {
              game: true,
              ...reviewInteractionInclude,
            },
            orderBy: {
              updatedAt: "desc",
            },
          })
        : [],
      canViewContent
        ? prisma.playLaterItem.findMany({
            where: {
              profileId: targetProfile.id,
              ...visibilityFilter,
            },
            include: {
              game: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          })
        : [],
      canViewContent
        ? prisma.installedGameItem.findMany({
            where: {
              profileId: targetProfile.id,
              ...visibilityFilter,
            },
            include: {
              game: true,
            },
            orderBy: {
              updatedAt: "desc",
            },
          })
        : [],
      prisma.friendship.count({
        where: {
          status: FriendshipStatus.ACCEPTED,
          OR: [
            {
              userAId: targetProfile.id,
            },
            {
              userBId: targetProfile.id,
            },
          ],
        },
      }),
    ]);

  return {
    canViewContent,
    friendCount,
    isCurrentUser,
    profile: toProfileSummary(targetProfile),
    pinnedReviews: reviews
      .filter((review) => review.pinned)
      .map((review) => ({
        game: toGameSummary(review.game),
        review: toReviewSummary(review, viewerProfile?.id ?? null),
      })),
    reviews: reviews.map((review) => ({
      game: toGameSummary(review.game),
      review: toReviewSummary(review, viewerProfile?.id ?? null),
    })),
    playLaterGames: sortListedGamesByTitle(
      playLaterItems.map((item) => ({
        game: toGameSummary(item.game),
        visibility: toVisibilityLabel(item.visibility),
      })),
    ),
    installedGames: sortListedGamesByTitle(
      installedItems.map((item) => ({
        game: toGameSummary(item.game),
        visibility: toVisibilityLabel(item.visibility),
        platforms: parseInstalledPlatforms(item.platform),
      })),
    ),
  };
}

export async function getTimelineReviews(): Promise<ReviewedGame[]> {
  const profile = await getSignedInProfile();

  if (!profile) {
    return [];
  }

  const friendships = await prisma.friendship.findMany({
    where: {
      status: FriendshipStatus.ACCEPTED,
      OR: [
        {
          userAId: profile.id,
        },
        {
          userBId: profile.id,
        },
      ],
    },
    select: {
      userAId: true,
      userBId: true,
    },
  });

  const friendProfileIds = friendships.map((friendship) =>
    friendship.userAId === profile.id ? friendship.userBId : friendship.userAId,
  );
  const reviewFilters: Prisma.ReviewWhereInput[] = [
    {
      profileId: profile.id,
    },
  ];

  if (friendProfileIds.length > 0) {
    reviewFilters.push({
      profileId: {
        in: friendProfileIds,
      },
      visibility: Visibility.FRIENDS,
    });
  }

  const reviews = await prisma.review.findMany({
    where: {
      OR: reviewFilters,
    },
    include: {
      game: true,
      profile: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      ...reviewInteractionInclude,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 24,
  });

  return reviews.map((review) => ({
    game: toGameSummary(review.game),
    review: toTimelineReviewSummary(review, profile.id),
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

  return sortListedGamesByTitle(
    items.map((item) => ({
      game: toGameSummary(item.game),
      visibility: toVisibilityLabel(item.visibility),
    })),
  );
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

  return sortListedGamesByTitle(
    items.map((item) => ({
      game: toGameSummary(item.game),
      visibility: toVisibilityLabel(item.visibility),
      platforms: parseInstalledPlatforms(item.platform),
    })),
  );
}

function toPickerParticipant(
  profile: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  },
  games: ListedGame[],
): GamePickerParticipant {
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName ?? profile.username,
    avatarUrl: profile.avatarUrl,
    games: sortListedGamesByTitle(games),
  };
}

export async function getGamePickerData(): Promise<GamePickerData> {
  const profile = await getSignedInProfile();

  if (!profile) {
    return {
      currentProfile: null,
      friends: [],
    };
  }

  const friendProfileIds = await getAcceptedFriendProfileIds(profile.id);
  const [profiles, installedItems] = await Promise.all([
    prisma.profile.findMany({
      where: {
        id: {
          in: [profile.id, ...friendProfileIds],
        },
      },
      select: {
        avatarUrl: true,
        displayName: true,
        id: true,
        username: true,
      },
    }),
    prisma.installedGameItem.findMany({
      where: {
        OR: [
          {
            profileId: profile.id,
          },
          {
            profileId: {
              in: friendProfileIds,
            },
            visibility: Visibility.FRIENDS,
          },
        ],
      },
      include: {
        game: true,
      },
    }),
  ]);
  const gamesByProfileId = new Map<string, ListedGame[]>();

  for (const item of installedItems) {
    const profileGames = gamesByProfileId.get(item.profileId) ?? [];

    profileGames.push({
      game: toGameSummary(item.game),
      visibility: toVisibilityLabel(item.visibility),
      platforms: parseInstalledPlatforms(item.platform),
    });
    gamesByProfileId.set(item.profileId, profileGames);
  }

  const currentProfileRecord =
    profiles.find((profileRecord) => profileRecord.id === profile.id) ??
    profile;
  const friendParticipants = profiles
    .filter((profileRecord) => friendProfileIds.includes(profileRecord.id))
    .map((friendProfile) =>
      toPickerParticipant(
        friendProfile,
        gamesByProfileId.get(friendProfile.id) ?? [],
      ),
    )
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  return {
    currentProfile: toPickerParticipant(
      currentProfileRecord,
      gamesByProfileId.get(profile.id) ?? [],
    ),
    friends: friendParticipants,
  };
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
      avatarUrl: true,
      bio: true,
    },
  });

  if (!profile) {
    return null;
  }

  return toProfileSummary(profile);
}

export async function cacheRawgGame(rawgId: number): Promise<GameSummary> {
  const profile = await requireSignedInProfile();
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

    await saveGameToProfile(profile.id, game.id);

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

    await saveGameToProfile(profile.id, game.id);

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

  await saveGameToProfile(profile.id, game.id);

  return toGameSummary(game);
}

async function saveGameToProfile(profileId: string, gameId: string) {
  await prisma.savedGameItem.upsert({
    where: {
      profileId_gameId: {
        profileId,
        gameId,
      },
    },
    update: {},
    create: {
      profileId,
      gameId,
    },
  });
}

function toPrismaVisibility(visibility: ListedGame["visibility"]) {
  return visibility === "friends" ? Visibility.FRIENDS : Visibility.PRIVATE;
}

export async function savePlayLaterGame(
  slug: string,
  input: SaveListVisibilityInput,
) {
  const [profile, game] = await Promise.all([
    requireSignedInProfile(),
    getGameIdForSlug(slug),
  ]);

  await prisma.playLaterItem.upsert({
    where: {
      profileId_gameId: {
        profileId: profile.id,
        gameId: game,
      },
    },
    update: {
      visibility: toPrismaVisibility(input.visibility),
    },
    create: {
      profileId: profile.id,
      gameId: game,
      visibility: toPrismaVisibility(input.visibility),
    },
  });
}

export async function removePlayLaterGame(slug: string) {
  const [profile, game] = await Promise.all([
    requireSignedInProfile(),
    getGameIdForSlug(slug),
  ]);

  await prisma.playLaterItem.deleteMany({
    where: {
      profileId: profile.id,
      gameId: game,
    },
  });
}

async function getGameIdForSlug(slug: string) {
  const game = await prisma.game.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (!game) {
    throw new Error(`Game not found: ${slug}`);
  }

  return game.id;
}

export async function saveInstalledGame(
  slug: string,
  platforms: InstalledPlatform[],
  input: SaveListVisibilityInput,
) {
  const [profile, game] = await Promise.all([
    requireSignedInProfile(),
    getGameIdForSlug(slug),
  ]);
  const platform = serializeInstalledPlatforms(platforms);

  await prisma.installedGameItem.upsert({
    where: {
      profileId_gameId: {
        profileId: profile.id,
        gameId: game,
      },
    },
    update: {
      platform,
      visibility: toPrismaVisibility(input.visibility),
    },
    create: {
      profileId: profile.id,
      gameId: game,
      visibility: toPrismaVisibility(input.visibility),
      platform,
    },
  });
}

export async function removeInstalledGame(slug: string) {
  const [profile, game] = await Promise.all([
    requireSignedInProfile(),
    getGameIdForSlug(slug),
  ]);

  await prisma.installedGameItem.deleteMany({
    where: {
      profileId: profile.id,
      gameId: game,
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

  const rating = Math.round(input.rating * 2);

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
      visibility: toPrismaVisibility(input.visibility),
    },
    create: {
      profileId: profile.id,
      gameId: game.id,
      body: input.body,
      containsSpoilers: input.containsSpoilers,
      rating,
      visibility: toPrismaVisibility(input.visibility),
    },
  });
}

export async function togglePinnedReview(reviewId: string) {
  const profile = await requireSignedInProfile();
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      profileId: profile.id,
    },
    select: {
      pinned: true,
      updatedAt: true,
    },
  });

  if (!review) {
    throw new Error("Review not found.");
  }

  await prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      pinned: !review.pinned,
      updatedAt: review.updatedAt,
    },
  });
}

export async function addReviewComment(reviewId: string, body: string) {
  const profile = await requireSignedInProfile();
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    throw new Error("Comment cannot be empty.");
  }

  if (trimmedBody.length > 300) {
    throw new Error("Comment must be 300 characters or fewer.");
  }

  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
    select: {
      profileId: true,
      visibility: true,
      profile: {
        select: {
          username: true,
        },
      },
      game: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found.");
  }

  const ownsReview = review.profileId === profile.id;
  const canCommentAsFriend =
    review.visibility === Visibility.FRIENDS &&
    (await canViewFriendContent(review.profileId, profile.id));

  if (!ownsReview && !canCommentAsFriend) {
    throw new Error("You can only comment on reviews shared with you.");
  }

  await prisma.reviewComment.create({
    data: {
      reviewId,
      profileId: profile.id,
      body: trimmedBody,
    },
  });

  return {
    gameSlug: review.game.slug,
    reviewAuthorUsername: review.profile.username,
  };
}

export async function updateReviewComment(commentId: string, body: string) {
  const profile = await requireSignedInProfile();
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    throw new Error("Comment cannot be empty.");
  }

  if (trimmedBody.length > 300) {
    throw new Error("Comment must be 300 characters or fewer.");
  }

  const comment = await prisma.reviewComment.findFirst({
    where: {
      id: commentId,
      profileId: profile.id,
    },
    select: {
      review: {
        select: {
          profile: {
            select: {
              username: true,
            },
          },
          game: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!comment) {
    throw new Error("Comment not found.");
  }

  await prisma.reviewComment.update({
    where: {
      id: commentId,
    },
    data: {
      body: trimmedBody,
    },
  });

  return {
    gameSlug: comment.review.game.slug,
    reviewAuthorUsername: comment.review.profile.username,
  };
}

export async function deleteReviewComment(commentId: string) {
  const profile = await requireSignedInProfile();
  const comment = await prisma.reviewComment.findFirst({
    where: {
      id: commentId,
      profileId: profile.id,
    },
    select: {
      review: {
        select: {
          profile: {
            select: {
              username: true,
            },
          },
          game: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!comment) {
    throw new Error("Comment not found.");
  }

  await prisma.reviewComment.delete({
    where: {
      id: commentId,
    },
  });

  return {
    gameSlug: comment.review.game.slug,
    reviewAuthorUsername: comment.review.profile.username,
  };
}

export async function deleteReview(reviewId: string) {
  const profile = await requireSignedInProfile();
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      profileId: profile.id,
    },
    select: {
      profile: {
        select: {
          username: true,
        },
      },
      game: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found.");
  }

  await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  return {
    gameSlug: review.game.slug,
    reviewAuthorUsername: review.profile.username,
  };
}

export async function toggleReviewVote(
  reviewId: string,
  value: "like" | "dislike",
) {
  const profile = await requireSignedInProfile();
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
    select: {
      profileId: true,
      visibility: true,
      profile: {
        select: {
          username: true,
        },
      },
      game: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found.");
  }

  const ownsReview = review.profileId === profile.id;
  const canVoteAsFriend =
    review.visibility === Visibility.FRIENDS &&
    (await canViewFriendContent(review.profileId, profile.id));

  if (!ownsReview && !canVoteAsFriend) {
    throw new Error("You can only vote on reviews shared with you.");
  }

  const nextValue =
    value === "like" ? ReviewVoteValue.LIKE : ReviewVoteValue.DISLIKE;
  const existingVote = await prisma.reviewVote.findUnique({
    where: {
      profileId_reviewId: {
        profileId: profile.id,
        reviewId,
      },
    },
  });

  if (existingVote?.value === nextValue) {
    await prisma.reviewVote.delete({
      where: {
        id: existingVote.id,
      },
    });
  } else {
    await prisma.reviewVote.upsert({
      where: {
        profileId_reviewId: {
          profileId: profile.id,
          reviewId,
        },
      },
      update: {
        value: nextValue,
      },
      create: {
        profileId: profile.id,
        reviewId,
        value: nextValue,
      },
    });
  }

  return {
    gameSlug: review.game.slug,
    reviewAuthorUsername: review.profile.username,
  };
}
