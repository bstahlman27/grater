import Image from "next/image";
import Link from "next/link";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ReviewSocialActions } from "@/components/review-social-actions";
import { StarRating } from "@/components/star-rating";
import { VisibilityBadge } from "@/components/visibility-badge";
import type { GameSummary, ReviewSummary } from "@/types/game";

type ReviewCardProps = {
  commentAction?: (formData: FormData) => void | Promise<void>;
  deleteAction?: (formData: FormData) => void | Promise<void>;
  deleteCommentAction?: (formData: FormData) => void | Promise<void>;
  game: GameSummary;
  pinAction?: (formData: FormData) => void | Promise<void>;
  review: ReviewSummary;
  showVisibility?: boolean;
  updateCommentAction?: (formData: FormData) => void | Promise<void>;
  voteAction?: (formData: FormData) => void | Promise<void>;
};

export function ReviewCard({
  commentAction,
  deleteAction,
  deleteCommentAction,
  game,
  pinAction,
  review,
  showVisibility = false,
  updateCommentAction,
  voteAction,
}: ReviewCardProps) {
  const canManageReview = review.canManage;
  const showReviewControls = Boolean(
    canManageReview && (pinAction || deleteAction),
  );
  const reviewControls = showReviewControls ? (
    <details className="group relative">
      <summary
        aria-label="Review options"
        className="flex size-7 cursor-pointer list-none items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-amber-500 [&::-webkit-details-marker]:hidden"
        title="Review options"
      >
        <svg
          aria-hidden="true"
          className="size-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </summary>
      <div className="absolute right-0 top-8 z-20 w-36 overflow-hidden rounded-md border border-zinc-200 bg-white py-1 text-sm shadow-lg">
        {canManageReview ? (
          <Link
            className="flex items-center gap-2 px-3 py-2 text-zinc-700 transition hover:bg-zinc-50 hover:text-amber-500"
            href={`/games/${game.slug}#your-review`}
          >
            <svg
              aria-hidden="true"
              className="size-3.5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 20h4l10.5-10.5a2.8 2.8 0 0 0-4-4L4 16v4z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
              <path
                d="M13.5 6.5l4 4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
            <span>Edit</span>
          </Link>
        ) : null}
        {pinAction ? (
          <form action={pinAction}>
            <input name="reviewId" type="hidden" value={review.id} />
            <button
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-zinc-700 transition hover:bg-zinc-50 hover:text-emerald-600"
              type="submit"
            >
              <svg aria-hidden="true" className="size-3.5" viewBox="0 0 24 24">
                <path
                  d="M14 3l7 7-2 2-1.4-1.4-4.2 4.2.3 3.5-1.4 1.4-4.1-4.1-4 4L3 18.5l4-4-4.1-4.1 1.4-1.4 3.5.3 4.2-4.2L10 3l4-0z"
                  fill={review.pinned ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
              <span>{review.pinned ? "Unpin" : "Pin"}</span>
            </button>
          </form>
        ) : null}
        {canManageReview && deleteAction ? (
          <form action={deleteAction}>
            <input name="reviewId" type="hidden" value={review.id} />
            <ConfirmSubmitButton
              ariaLabel="Delete review"
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-zinc-700 transition hover:bg-red-50 hover:text-red-600"
              confirmMessage="Delete this review? This cannot be undone."
              title="Delete review"
            >
              <svg
                aria-hidden="true"
                className="size-3.5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              <span>Delete</span>
            </ConfirmSubmitButton>
          </form>
        ) : null}
      </div>
    </details>
  ) : null;

  return (
    <article className="relative overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-sm">
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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link
                className="text-lg font-semibold hover:text-amber-500"
                href={`/games/${game.slug}`}
              >
                {game.title}
              </Link>
              <div className="mt-1">
                <StarRating rating={review.rating} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1 text-sm text-zinc-500">
                {review.author ? (
                  <Link
                    className="inline-flex items-center gap-2 align-middle font-medium text-zinc-700 hover:text-amber-500"
                    href={`/profiles/${review.author.username}`}
                  >
                    <ProfileAvatar
                      avatarUrl={review.author.avatarUrl}
                      displayName={review.author.displayName}
                      size="xs"
                    />
                    {review.author.displayName}
                  </Link>
                ) : null}
                {showVisibility ? (
                  <>
                    {review.author ? <span>-</span> : null}
                    <VisibilityBadge visibility={review.visibility} />
                  </>
                ) : null}
                {showVisibility && review.containsSpoilers ? (
                  <>
                    {review.author || showVisibility ? <span>-</span> : null}
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[0.7rem] font-semibold text-red-800">
                      Spoilers
                    </span>
                  </>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 text-sm text-zinc-500">
              {reviewControls}
              <span>Updated {review.updatedAt}</span>
            </div>
          </div>

          <p className="mt-3 leading-7 text-zinc-700">{review.body}</p>

          <ReviewSocialActions
            commentAction={commentAction}
            comments={review.comments}
            deleteCommentAction={deleteCommentAction}
            review={review}
            updateCommentAction={updateCommentAction}
            voteAction={voteAction}
          />
        </div>
      </div>
    </article>
  );
}
