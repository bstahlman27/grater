import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loginAction, signupAction } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
  }>;
};

export const dynamic = "force-dynamic";

function getSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;
  const errorMessage = getSearchValue(error);
  const statusMessage = getSearchValue(message);
  const authConfigured = isSupabaseConfigured();

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-zinc-950">
      <div className="mx-auto w-full max-w-6xl px-6 py-6 sm:px-8 lg:px-10">
        <AppHeader />

        <section className="grid gap-8 py-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-medium uppercase text-red-700">Account</p>
            <h2 className="mt-2 text-3xl font-semibold">Sign in to Grater</h2>
            <p className="mt-4 max-w-xl leading-7 text-zinc-700">
              Accounts are backed by Supabase Auth. Your profile, reviews, and
              lists stay in the Grater Postgres tables.
            </p>
            <Link
              className="mt-6 inline-flex text-sm font-semibold text-red-700 hover:text-red-900"
              href="/games"
            >
              Browse games
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {!authConfigured ? (
              <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900 md:col-span-2">
                Supabase auth is not configured yet. Add
                NEXT_PUBLIC_SUPABASE_URL and
                NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.
              </p>
            ) : null}

            {errorMessage ? (
              <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 md:col-span-2">
                {errorMessage}
              </p>
            ) : null}

            {statusMessage ? (
              <p className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 md:col-span-2">
                {statusMessage}
              </p>
            ) : null}

            <form
              action={loginAction}
              className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm"
            >
              <h3 className="text-xl font-semibold">Log in</h3>
              <label className="mt-5 block text-sm font-medium" htmlFor="login-email">
                Email
              </label>
              <input
                className="mt-2 min-h-11 w-full rounded-lg border border-zinc-300 px-3 outline-none ring-red-700/20 focus:border-red-700 focus:ring-4"
                id="login-email"
                name="email"
                type="email"
                required
              />
              <label
                className="mt-4 block text-sm font-medium"
                htmlFor="login-password"
              >
                Password
              </label>
              <input
                className="mt-2 min-h-11 w-full rounded-lg border border-zinc-300 px-3 outline-none ring-red-700/20 focus:border-red-700 focus:ring-4"
                id="login-password"
                name="password"
                type="password"
                required
              />
              <button
                className="mt-5 w-full rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                type="submit"
              >
                Log in
              </button>
            </form>

            <form
              action={signupAction}
              className="rounded-lg border border-zinc-300 bg-white p-5 shadow-sm"
            >
              <h3 className="text-xl font-semibold">Create account</h3>
              <label
                className="mt-5 block text-sm font-medium"
                htmlFor="signup-email"
              >
                Email
              </label>
              <input
                className="mt-2 min-h-11 w-full rounded-lg border border-zinc-300 px-3 outline-none ring-red-700/20 focus:border-red-700 focus:ring-4"
                id="signup-email"
                name="email"
                type="email"
                required
              />
              <label
                className="mt-4 block text-sm font-medium"
                htmlFor="signup-password"
              >
                Password
              </label>
              <input
                className="mt-2 min-h-11 w-full rounded-lg border border-zinc-300 px-3 outline-none ring-red-700/20 focus:border-red-700 focus:ring-4"
                id="signup-password"
                name="password"
                type="password"
                minLength={6}
                required
              />
              <button
                className="mt-5 w-full rounded-lg border border-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-950 hover:border-red-700 hover:text-red-700"
                type="submit"
              >
                Sign up
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
