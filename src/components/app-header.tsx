import Link from "next/link";
import { AppNavLinks } from "@/components/app-nav-links";
import { ProfileAvatar } from "@/components/profile-avatar";
import { getSignedInProfile } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games", activePrefixes: ["/lists"] },
  { href: "/friends", label: "Friends" },
  { href: "/profile", label: "Profile", activePrefixes: ["/profiles"] },
];

export async function AppHeader() {
  const profile = await getSignedInProfile();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-300/80 bg-[#f7f4ee] py-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <Link href="/" className="w-fit">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Your game rater
          </span>
          <span className="block text-2xl font-black leading-none text-zinc-950">
            GRATER
          </span>
        </Link>

        <AppNavLinks items={navItems} />

        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          {profile ? (
            <>
              <Link
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:!text-amber-500"
                href="/profile"
              >
                <ProfileAvatar
                  avatarUrl={profile.avatarUrl}
                  displayName={profile.displayName ?? profile.username}
                  size="xs"
                />
                <span>@{profile.username}</span>
              </Link>
              <form action={logoutAction}>
                <button
                  className="cursor-pointer text-sm font-semibold text-zinc-700 transition hover:!text-amber-500"
                  type="submit"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              className="cursor-pointer text-sm font-semibold text-zinc-700 transition hover:!text-amber-500"
              href="/login"
            >
              Log in
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
