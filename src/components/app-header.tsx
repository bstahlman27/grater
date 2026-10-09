import Link from "next/link";
import { getSignedInProfile } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/friends", label: "Friends" },
  { href: "/profile", label: "Profile" },
];

export async function AppHeader() {
  const profile = await getSignedInProfile();

  return (
    <header className="flex flex-col gap-5 border-b border-zinc-300/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/" className="w-fit">
        <p className="text-sm font-medium uppercase text-red-700">Grater</p>
        <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">
          Your game journal
        </h1>
      </Link>
      <nav className="flex items-center gap-5 text-sm font-medium text-zinc-700">
        {navItems.map((item) => (
          <Link className="hover:text-zinc-950" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
        {profile ? (
          <form action={logoutAction}>
            <button className="hover:text-zinc-950" type="submit">
              Sign out @{profile.username}
            </button>
          </form>
        ) : (
          <Link className="hover:text-zinc-950" href="/login">
            Log in
          </Link>
        )}
      </nav>
    </header>
  );
}
