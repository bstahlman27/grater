type StarRatingProps = {
  rating: number;
};

export function StarRating({ rating }: StarRatingProps) {
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - filledStars - (hasHalfStar ? 1 : 0);

  return (
    <span aria-label={`${rating} out of 5 stars`} className="text-sm text-amber-600">
      {"★".repeat(filledStars)}
      {hasHalfStar ? "½" : null}
      <span className="text-zinc-300">{"★".repeat(emptyStars)}</span>
    </span>
  );
}
