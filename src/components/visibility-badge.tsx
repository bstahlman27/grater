type VisibilityBadgeProps = {
  visibility: "friends" | "private";
};

export function VisibilityBadge({ visibility }: VisibilityBadgeProps) {
  const isPrivate = visibility === "private";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold leading-none tracking-normal ${
        isPrivate
          ? "bg-zinc-100 text-zinc-600"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      <svg aria-hidden="true" className="size-3" viewBox="0 0 24 24">
        {isPrivate ? (
          <>
            <path
              d="M3 3l18 18"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
            <path
              d="M10.7 5.2A10.7 10.7 0 0 1 12 5c5 0 8.7 4.1 10 7-0.6 1.5-1.8 3.1-3.4 4.4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d="M6.6 6.7C4.5 8.1 2.9 10.3 2 12c1.3 2.9 5 7 10 7 1.8 0 3.4-.5 4.8-1.3"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </>
        ) : (
          <>
            <path
              d="M2 12s3.7-7 10-7 10 7 10 7-3.7 7-10 7S2 12 2 12z"
              fill="none"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <circle
              cx="12"
              cy="12"
              fill="none"
              r="3"
              stroke="currentColor"
              strokeWidth="2"
            />
          </>
        )}
      </svg>
      {isPrivate ? "Private" : "Friends"}
    </span>
  );
}
