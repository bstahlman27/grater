import Image from "next/image";
import Link from "next/link";
import { StarRating } from "@/components/star-rating";
import type { GameSummary, ReviewSummary } from "@/types/game";

type ReviewCardProps = {
  game: GameSummary;
  review: ReviewSummary;
};

export function ReviewCard({ game, review }: ReviewCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-sm">
      <div className="grid gap-0 sm:grid-cols-[12rem_1fr]">
        <Link
          className="relative m-4 mb-0 aspect-video overflow-hidden rounded-md bg-zinc-100 sm:mb-4 sm:mr-0"
          href={`/games/${game.slug}`}
        >
          {game.coverUrl ? (
            <Image
              alt=""
              className="h-full w-full object-cover"
              fill
              sizes="(max-width: 640px) 100vw, 12rem"
              src={game.coverUrl}
            />
          ) : (
            <span
              className={`flex h-full items-end ${game.coverColor} p-4 text-xs font-semibold uppercase text-white`}
            >
              {game.releaseYear}
            </span>
          )}
        </Link>

        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link
                className="text-lg font-semibold hover:text-red-700"
                href={`/games/${game.slug}`}
              >
                {game.title}
              </Link>
              <p className="mt-1 text-sm text-zinc-500">
                Updated {review.updatedAt}
              </p>
            </div>
            <StarRating rating={review.rating} />
          </div>

          <p className="mt-3 leading-7 text-zinc-700">{review.body}</p>
        </div>
      </div>
    </article>
  );
}
