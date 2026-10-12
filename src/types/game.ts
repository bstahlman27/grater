export type GameSummary = {
  slug: string;
  title: string;
  releaseYear: string;
  summary: string;
  coverColor: string;
  coverUrl: string | null;
};

export type GameDetail = GameSummary & {
  releasedAt: string;
  metacritic: number | null;
  rawgRating: number | null;
};

export type ReviewSummary = {
  id: string;
  author?: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  canManage: boolean;
  canComment: boolean;
  canVote: boolean;
  comments: ReviewCommentSummary[];
  dislikeCount: number;
  likeCount: number;
  rating: number;
  body: string;
  containsSpoilers: boolean;
  pinned: boolean;
  updatedAt: string;
  viewerVote: "like" | "dislike" | null;
  visibility: "private" | "friends";
};

export type ReviewCommentSummary = {
  id: string;
  body: string;
  canManage: boolean;
  createdAt: string;
  author: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
};

export type ReviewedGame = {
  game: GameSummary;
  review: ReviewSummary;
};

export type ListedGame = {
  game: GameSummary;
  visibility: "private" | "friends";
  platforms?: string[];
};

export type GamePickerParticipant = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  games: ListedGame[];
};

export type GamePickerData = {
  currentProfile: GamePickerParticipant | null;
  friends: GamePickerParticipant[];
};

export type ProfileSummary = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
};

export type HomeProfileSummary = ProfileSummary & {
  friendCount: number;
  reviewCount: number;
};

export type GameListState = {
  inPlayLater: boolean;
  playLaterVisibility: ListedGame["visibility"] | null;
  inInstalled: boolean;
  installedVisibility: ListedGame["visibility"] | null;
  installedPlatforms: string[];
};
