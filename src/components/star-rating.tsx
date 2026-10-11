type StarRatingProps = {
  rating: number;
};

const starPath =
  "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

function getStarFill(star: number, rating: number) {
  if (rating >= star) {
    return "100%";
  }

  if (rating >= star - 0.5) {
    return "50%";
  }

  return "0%";
}

export function StarRating({ rating }: StarRatingProps) {
  return (
    <span
      aria-label={`${rating} out of 5 stars`}
      className="inline-flex gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span className="relative block size-4" key={star}>
          <svg
            aria-hidden="true"
            className="size-4 text-zinc-300"
            viewBox="0 0 24 24"
          >
            <path d={starPath} fill="currentColor" />
          </svg>
          <span
            className="absolute left-0 top-0 block overflow-hidden"
            style={{ width: getStarFill(star, rating) }}
          >
            <svg
              aria-hidden="true"
              className="size-4 text-amber-500"
              viewBox="0 0 24 24"
            >
              <path d={starPath} fill="currentColor" />
            </svg>
          </span>
        </span>
      ))}
    </span>
  );
}
