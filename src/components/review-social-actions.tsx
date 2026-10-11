"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ProfileAvatar } from "@/components/profile-avatar";
import type { ReviewCommentSummary, ReviewSummary } from "@/types/game";

type ReviewSocialActionsProps = {
  commentAction?: (formData: FormData) => void | Promise<void>;
  comments: ReviewCommentSummary[];
  deleteCommentAction?: (formData: FormData) => void | Promise<void>;
  review: Pick<
    ReviewSummary,
    | "canComment"
    | "canVote"
    | "dislikeCount"
    | "id"
    | "likeCount"
    | "viewerVote"
  >;
  updateCommentAction?: (formData: FormData) => void | Promise<void>;
  voteAction?: (formData: FormData) => void | Promise<void>;
};

const defaultVisibleCommentCount = 3;

function ThumbIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      aria-hidden="true"
      className={`size-4 ${direction === "down" ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M7 21H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m0 11V9l4-7a3 3 0 0 1 3 3v4h4.4a2 2 0 0 1 2 2.3l-1.1 7A3 3 0 0 1 16.4 21H7z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 5.5A3.5 3.5 0 0 1 7.5 2h9A3.5 3.5 0 0 1 20 5.5v6A3.5 3.5 0 0 1 16.5 15H11l-5 5v-5.3a3.5 3.5 0 0 1-2-3.2v-6z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

function EditIcon() {
  return (
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
  );
}

function SmallTrashIcon() {
  return (
    <svg aria-hidden="true" className="size-3.5" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function EditCommentForm({
  action,
  body,
  commentId,
  onCancel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  body: string;
  commentId: string;
  onCancel: () => void;
}) {
  return (
    <form action={action} className="mt-2 flex gap-2">
      <input name="commentId" type="hidden" value={commentId} />
      <label className="sr-only" htmlFor={`edit-comment-${commentId}`}>
        Edit comment
      </label>
      <input
        autoFocus
        className="min-h-9 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-emerald-600/20 placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4"
        defaultValue={body}
        id={`edit-comment-${commentId}`}
        maxLength={300}
        name="body"
      />
      <button
        className="cursor-pointer rounded-md bg-zinc-950 px-3 text-xs font-semibold text-white transition hover:bg-emerald-600"
        type="submit"
      >
        Save
      </button>
      <button
        className="cursor-pointer rounded-md px-2 text-xs font-semibold text-zinc-500 transition hover:text-amber-500"
        onClick={onCancel}
        type="button"
      >
        Cancel
      </button>
    </form>
  );
}

function VoteButton({
  action,
  count,
  isActive,
  label,
  reviewId,
  value,
}: {
  action?: (formData: FormData) => void | Promise<void>;
  count: number;
  isActive: boolean;
  label: string;
  reviewId: string;
  value: "like" | "dislike";
}) {
  const button = (
    <button
      aria-label={label}
      aria-pressed={isActive}
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold transition ${
        isActive
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-amber-300 hover:text-amber-500"
      } ${action ? "cursor-pointer" : "cursor-default"}`}
      disabled={!action}
      type="submit"
    >
      <ThumbIcon direction={value === "like" ? "up" : "down"} />
      <span>{count}</span>
    </button>
  );

  if (!action) {
    return button;
  }

  return (
    <form action={action}>
      <input name="reviewId" type="hidden" value={reviewId} />
      <input name="voteValue" type="hidden" value={value} />
      {button}
    </form>
  );
}

function CommentForm({
  action,
  reviewId,
}: {
  action: (formData: FormData) => void | Promise<void>;
  reviewId: string;
}) {
  return (
    <form action={action} className="mt-4 flex gap-2">
      <input name="reviewId" type="hidden" value={reviewId} />
      <label className="sr-only" htmlFor={`comment-${reviewId}`}>
        Add a comment
      </label>
      <input
        autoFocus
        className="min-h-10 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-emerald-600/20 placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4"
        id={`comment-${reviewId}`}
        maxLength={300}
        name="body"
        placeholder="Add a comment"
      />
      <button
        className="cursor-pointer rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
        type="submit"
      >
        Post
      </button>
    </form>
  );
}

export function ReviewSocialActions({
  commentAction,
  comments,
  deleteCommentAction,
  review,
  updateCommentAction,
  voteAction,
}: ReviewSocialActionsProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [isShowingAllComments, setIsShowingAllComments] = useState(false);
  const canShowComments = comments.length > 0 || isCommenting;
  const canComment = Boolean(commentAction && review.canComment);
  const hiddenCommentCount = Math.max(
    comments.length - defaultVisibleCommentCount,
    0,
  );
  const visibleComments = isShowingAllComments
    ? comments
    : comments.slice(0, defaultVisibleCommentCount);

  if (!review.canVote && !canComment && comments.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <VoteButton
            action={review.canVote ? voteAction : undefined}
            count={review.likeCount}
            isActive={review.viewerVote === "like"}
            label="Like review"
            reviewId={review.id}
            value="like"
          />
          <VoteButton
            action={review.canVote ? voteAction : undefined}
            count={review.dislikeCount}
            isActive={review.viewerVote === "dislike"}
            label="Dislike review"
            reviewId={review.id}
            value="dislike"
          />
        </div>

        {canComment ? (
          <button
            aria-label="Add comment"
            className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 text-xs font-semibold text-zinc-500 transition hover:border-amber-300 hover:text-amber-500"
            onClick={() => setIsCommenting(true)}
            type="button"
          >
            <CommentIcon />
            {comments.length > 0 ? <span>{comments.length}</span> : null}
          </button>
        ) : null}
      </div>

      {canShowComments ? (
        <section className="mt-4 border-t border-zinc-200 pt-4">
          <p className="text-sm font-semibold text-zinc-700">Comments</p>

          {comments.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {visibleComments.map((comment) => (
                <li className="flex gap-2 text-sm" key={comment.id}>
                  <ProfileAvatar
                    avatarUrl={comment.author.avatarUrl}
                    displayName={comment.author.displayName}
                    size="xs"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1 text-xs text-zinc-500">
                      <Link
                        className="font-semibold text-zinc-700 hover:text-amber-500"
                        href={`/profiles/${comment.author.username}`}
                      >
                        {comment.author.displayName}
                      </Link>
                      <span>-</span>
                      <span>{comment.createdAt}</span>
                    </div>
                    {editingCommentId === comment.id && updateCommentAction ? (
                      <EditCommentForm
                        action={updateCommentAction}
                        body={comment.body}
                        commentId={comment.id}
                        onCancel={() => setEditingCommentId(null)}
                      />
                    ) : (
                      <p className="mt-1 leading-6 text-zinc-700">
                        {comment.body}
                      </p>
                    )}
                  </div>
                  {comment.canManage &&
                  (updateCommentAction || deleteCommentAction) ? (
                    <details className="group relative ml-auto shrink-0">
                      <summary
                        aria-label="Comment options"
                        className="flex size-6 cursor-pointer list-none items-center justify-center text-zinc-400 transition hover:text-amber-500 [&::-webkit-details-marker]:hidden"
                        title="Comment options"
                      >
                        <MoreIcon />
                      </summary>
                      <div className="absolute right-0 top-7 z-20 w-32 overflow-hidden rounded-md border border-zinc-200 bg-white py-1 text-sm shadow-lg">
                        {updateCommentAction ? (
                          <button
                            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-zinc-700 transition hover:bg-zinc-50 hover:text-amber-500"
                            onClick={() => setEditingCommentId(comment.id)}
                            type="button"
                          >
                            <EditIcon />
                            <span>Edit</span>
                          </button>
                        ) : null}
                        {deleteCommentAction ? (
                          <form action={deleteCommentAction}>
                            <input
                              name="commentId"
                              type="hidden"
                              value={comment.id}
                            />
                            <ConfirmSubmitButton
                              ariaLabel="Delete comment"
                              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-zinc-700 transition hover:bg-red-50 hover:text-red-600"
                              confirmMessage="Delete this comment? This cannot be undone."
                              title="Delete comment"
                            >
                              <SmallTrashIcon />
                              <span>Delete</span>
                            </ConfirmSubmitButton>
                          </form>
                        ) : null}
                      </div>
                    </details>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          {!isShowingAllComments && hiddenCommentCount > 0 ? (
            <button
              className="mt-3 cursor-pointer text-sm font-semibold text-zinc-600 transition hover:text-amber-500"
              onClick={() => setIsShowingAllComments(true)}
              type="button"
            >
              See {hiddenCommentCount} more{" "}
              {hiddenCommentCount === 1 ? "comment" : "comments"}
            </button>
          ) : null}

          {isCommenting && commentAction ? (
            <CommentForm action={commentAction} reviewId={review.id} />
          ) : null}
        </section>
      ) : null}
    </>
  );
}
