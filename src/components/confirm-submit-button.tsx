"use client";

import type { ReactNode } from "react";

type ConfirmSubmitButtonProps = {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  confirmMessage: string;
  title?: string;
};

export function ConfirmSubmitButton({
  ariaLabel,
  children,
  className,
  confirmMessage,
  title,
}: ConfirmSubmitButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className={className}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      title={title}
      type="submit"
    >
      {children}
    </button>
  );
}
