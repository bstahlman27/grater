export type RawgSearchGame = {
  rawgId: number;
  slug: string;
  title: string;
  releasedAt: string | null;
  releaseYear: string;
  backgroundUrl: string | null;
  metacritic: number | null;
  rawgRating: number | null;
};

export type RawgGameDetails = RawgSearchGame & {
  summary: string | null;
};

type RawgGameResponse = {
  id: number;
  slug: string;
  name: string;
  released: string | null;
  background_image: string | null;
  metacritic: number | null;
  rating: number | null;
  description_raw?: string | null;
};

type RawgSearchResponse = {
  results: RawgGameResponse[];
};

const RAWG_BASE_URL = "https://api.rawg.io/api";

function getRawgApiKey() {
  const key = process.env.RAWG_API_KEY;

  if (!key) {
    throw new Error("RAWG_API_KEY is required to search RAWG.");
  }

  return key;
}

function getReleaseYear(releasedAt: string | null) {
  return releasedAt ? releasedAt.slice(0, 4) : "TBD";
}

function toRawgGame(game: RawgGameResponse): RawgSearchGame {
  return {
    rawgId: game.id,
    slug: game.slug,
    title: game.name,
    releasedAt: game.released,
    releaseYear: getReleaseYear(game.released),
    backgroundUrl: game.background_image,
    metacritic: game.metacritic,
    rawgRating: game.rating,
  };
}

export async function searchRawgGames(query: string): Promise<RawgSearchGame[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const params = new URLSearchParams({
    key: getRawgApiKey(),
    search: trimmedQuery,
    page_size: "8",
  });

  const response = await fetch(`${RAWG_BASE_URL}/games?${params.toString()}`, {
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    throw new Error(`RAWG search failed with status ${response.status}.`);
  }

  const data = (await response.json()) as RawgSearchResponse;

  return data.results.map(toRawgGame);
}

export async function getRawgGameDetails(rawgId: number): Promise<RawgGameDetails> {
  const params = new URLSearchParams({
    key: getRawgApiKey(),
  });

  const response = await fetch(`${RAWG_BASE_URL}/games/${rawgId}?${params}`, {
    next: {
      revalidate: 86400,
    },
  });

  if (!response.ok) {
    throw new Error(`RAWG details failed with status ${response.status}.`);
  }

  const game = (await response.json()) as RawgGameResponse;

  return {
    ...toRawgGame(game),
    summary: game.description_raw ?? null,
  };
}
