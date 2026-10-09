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
  rating: number;
  body: string;
  containsSpoilers: boolean;
  updatedAt: string;
  visibility: "private" | "friends";
};

export type ReviewedGame = {
  game: GameSummary;
  review: ReviewSummary;
};

export type ListedGame = {
  game: GameSummary;
  visibility: "private" | "friends";
  platform?: string | null;
};

export type ProfileSummary = {
  username: string;
  displayName: string;
  bio: string | null;
};

export type GameListState = {
  inPlayLater: boolean;
  playLaterVisibility: ListedGame["visibility"] | null;
  inInstalled: boolean;
  installedVisibility: ListedGame["visibility"] | null;
  installedPlatform: string | null;
};
