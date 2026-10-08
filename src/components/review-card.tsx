import Link from "next/link";
import { StarRating } from "@/components/star-rating";
import type { GameSummary, ReviewSummary } from "@/types/game";

type ReviewCardProps = {
  game: GameSummary;
  review: ReviewSummary;
};

export function ReviewCard({ game, review }: ReviewCardProps) {
  return (
    <article className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            className="text-lg font-semibold hover:text-red-700"
            href={`/games/${game.slug}`}
          >
            {game.title}
          </Link>
          <p className="mt-1 text-sm text-zinc-500">Updated {review.updatedAt}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="mt-3 leading-7 text-zinc-700">{review.body}</p>
    </article>
  );
}
