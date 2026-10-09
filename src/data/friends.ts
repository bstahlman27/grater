import { FriendshipStatus } from "@/generated/prisma/enums";
import { requireSignedInProfile, getSignedInProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type {
  FriendProfile,
  FriendRequestSummary,
  FriendsPageData,
} from "@/types/friends";

type FriendshipRecord = {
  id: string;
  requestedById: string;
  updatedAt: Date;
  userA: FriendProfileRecord;
  userAId: string;
  userB: FriendProfileRecord;
  userBId: string;
};

type FriendProfileRecord = {
  id: string;
  username: string;
  displayName: string | null;
};

function toFriendProfile(profile: FriendProfileRecord): FriendProfile {
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName ?? profile.username,
  };
}

function getOtherProfile(friendship: FriendshipRecord, currentProfileId: string) {
  return friendship.userAId === currentProfileId
    ? friendship.userB
    : friendship.userA;
}

function toFriendRequestSummary(
  friendship: FriendshipRecord,
  currentProfileId: string,
): FriendRequestSummary {
  return {
    id: friendship.id,
    profile: toFriendProfile(getOtherProfile(friendship, currentProfileId)),
    updatedAt: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(friendship.updatedAt),
  };
}

function getFriendshipPair(firstProfileId: string, secondProfileId: string) {
  return firstProfileId < secondProfileId
    ? { userAId: firstProfileId, userBId: secondProfileId }
    : { userAId: secondProfileId, userBId: firstProfileId };
}

export async function getFriendsPageData(): Promise<FriendsPageData> {
  const currentProfile = await getSignedInProfile();

  if (!currentProfile) {
    return {
      currentProfile: null,
      friends: [],
      incomingRequests: [],
      outgoingRequests: [],
    };
  }

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        {
          userAId: currentProfile.id,
        },
        {
          userBId: currentProfile.id,
        },
      ],
    },
    include: {
      userA: {
        select: {
          id: true,
          username: true,
          displayName: true,
        },
      },
      userB: {
        select: {
          id: true,
          username: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return {
    currentProfile: toFriendProfile(currentProfile),
    friends: friendships
      .filter((friendship) => friendship.status === FriendshipStatus.ACCEPTED)
      .map((friendship) =>
        toFriendRequestSummary(friendship, currentProfile.id),
      ),
    incomingRequests: friendships
      .filter(
        (friendship) =>
          friendship.status === FriendshipStatus.PENDING &&
          friendship.requestedById !== currentProfile.id,
      )
      .map((friendship) =>
        toFriendRequestSummary(friendship, currentProfile.id),
      ),
    outgoingRequests: friendships
      .filter(
        (friendship) =>
          friendship.status === FriendshipStatus.PENDING &&
          friendship.requestedById === currentProfile.id,
      )
      .map((friendship) =>
        toFriendRequestSummary(friendship, currentProfile.id),
      ),
  };
}

export async function sendFriendRequest(username: string) {
  const currentProfile = await requireSignedInProfile();
  const normalizedUsername = username.trim().toLowerCase();

  if (!normalizedUsername) {
    throw new Error("Enter a username.");
  }

  const targetProfile = await prisma.profile.findUnique({
    where: {
      username: normalizedUsername,
    },
    select: {
      id: true,
      username: true,
    },
  });

  if (!targetProfile) {
    throw new Error(`No user found for @${normalizedUsername}.`);
  }

  if (targetProfile.id === currentProfile.id) {
    throw new Error("You cannot friend yourself.");
  }

  const pair = getFriendshipPair(currentProfile.id, targetProfile.id);
  const existingFriendship = await prisma.friendship.findUnique({
    where: {
      userAId_userBId: pair,
    },
  });

  if (existingFriendship?.status === FriendshipStatus.ACCEPTED) {
    throw new Error(`You are already friends with @${targetProfile.username}.`);
  }

  if (existingFriendship?.status === FriendshipStatus.PENDING) {
    if (existingFriendship.requestedById === currentProfile.id) {
      throw new Error(`You already sent @${targetProfile.username} a request.`);
    }

    await prisma.friendship.update({
      where: {
        id: existingFriendship.id,
      },
      data: {
        status: FriendshipStatus.ACCEPTED,
      },
    });

    return `Accepted @${targetProfile.username}'s request.`;
  }

  await prisma.friendship.create({
    data: {
      ...pair,
      requestedById: currentProfile.id,
      status: FriendshipStatus.PENDING,
    },
  });

  return `Friend request sent to @${targetProfile.username}.`;
}

export async function acceptFriendRequest(friendshipId: string) {
  const currentProfile = await requireSignedInProfile();
  const friendship = await prisma.friendship.findFirst({
    where: {
      id: friendshipId,
      requestedById: {
        not: currentProfile.id,
      },
      status: FriendshipStatus.PENDING,
      OR: [
        {
          userAId: currentProfile.id,
        },
        {
          userBId: currentProfile.id,
        },
      ],
    },
  });

  if (!friendship) {
    throw new Error("Friend request not found.");
  }

  await prisma.friendship.update({
    where: {
      id: friendship.id,
    },
    data: {
      status: FriendshipStatus.ACCEPTED,
    },
  });
}

export async function deleteFriendship(friendshipId: string) {
  const currentProfile = await requireSignedInProfile();
  const friendship = await prisma.friendship.findFirst({
    where: {
      id: friendshipId,
      OR: [
        {
          userAId: currentProfile.id,
        },
        {
          userBId: currentProfile.id,
        },
      ],
    },
  });

  if (!friendship) {
    throw new Error("Friendship not found.");
  }

  await prisma.friendship.delete({
    where: {
      id: friendship.id,
    },
  });
}
