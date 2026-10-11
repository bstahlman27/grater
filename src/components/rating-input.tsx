"use client";

import { useId, useState } from "react";

type RatingInputProps = {
  defaultRating?: number | null;
  name?: string;
};

const ratingValues = [
  0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5,
];

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

function getRatingLabel(rating: number) {
  return `${rating} ${rating === 1 ? "star" : "stars"}`;
}

function RatingStar({ fill }: { fill: string }) {
  return (
    <span className="relative block size-8">
      <svg
        aria-hidden="true"
        className="size-8 text-zinc-300"
        viewBox="0 0 24 24"
      >
        <path d={starPath} fill="currentColor" />
      </svg>
      <span
        className="absolute left-0 top-0 block overflow-hidden"
        style={{ width: fill }}
      >
        <svg
          aria-hidden="true"
          className="size-8 text-amber-500"
          viewBox="0 0 24 24"
        >
          <path d={starPath} fill="currentColor" />
        </svg>
      </span>
    </span>
  );
}

export function RatingInput({
  defaultRating = null,
  name = "rating",
}: RatingInputProps) {
  const inputId = useId();
  const [selectedRating, setSelectedRating] = useState<number | null>(
    defaultRating,
  );
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const displayRating = hoveredRating ?? selectedRating;
  const displayedStarRating = displayRating ?? 0;

  return (
    <fieldset>
      <legend className="block text-sm font-medium text-zinc-700">
        Rating
      </legend>
      <div
        className="relative mt-2 inline-flex"
        onMouseLeave={() => setHoveredRating(null)}
      >
        <div
          aria-hidden="true"
          className="flex"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <RatingStar
              fill={getStarFill(star, displayedStarRating)}
              key={star}
            />
          ))}
        </div>

        <div className="absolute inset-0 grid grid-cols-10">
          {ratingValues.map((rating) => (
            <span key={rating}>
              <input
                aria-label={getRatingLabel(rating)}
                className="peer sr-only"
                defaultChecked={rating === defaultRating}
                id={`${inputId}-${rating}`}
                name={name}
                onChange={() => setSelectedRating(rating)}
                required={rating === 0.5}
                type="radio"
                value={rating}
              />
              <label
                className="block h-full cursor-pointer rounded-sm peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600"
                htmlFor={`${inputId}-${rating}`}
                onMouseEnter={() => setHoveredRating(rating)}
                title={getRatingLabel(rating)}
              >
                <span className="sr-only">
                  Set rating to {getRatingLabel(rating)}
                </span>
              </label>
            </span>
          ))}
        </div>
      </div>
      <p className="mt-2 text-sm text-zinc-600">
        {displayRating ? getRatingLabel(displayRating) : "Select a rating"}
      </p>
    </fieldset>
  );
}
