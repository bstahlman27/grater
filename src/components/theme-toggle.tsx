"use client";

const themeStorageKey = "grater-theme";

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

export function ThemeToggle() {
  function toggleTheme() {
    const nextValue = !document.documentElement.classList.contains("dark");

    applyTheme(nextValue);
    window.localStorage.setItem(themeStorageKey, nextValue ? "dark" : "light");
  }

  return (
    <button
      aria-label="Toggle dark mode"
      className="inline-flex min-h-8 items-center gap-2 rounded-full border border-zinc-300 bg-white px-2 text-xs font-semibold text-zinc-700 transition hover:border-emerald-600 hover:text-emerald-600"
      onClick={toggleTheme}
      type="button"
    >
      <span aria-hidden="true" className="leading-none">
        ☀
      </span>
      <span className="relative h-4 w-8 rounded-full bg-zinc-200">
        <span className="theme-toggle-knob absolute left-1 top-0.5 size-3 rounded-full bg-zinc-950 transition" />
      </span>
      <span aria-hidden="true" className="leading-none">
        ☾
      </span>
    </button>
  );
}
