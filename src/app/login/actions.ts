"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ensureProfileForUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getCredentials(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || !email.trim()) {
    throw new Error("Email is required.");
  }

  if (typeof password !== "string" || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  return {
    email: email.trim(),
    password,
  };
}

async function getOrigin() {
  const headerStore = await headers();

  return headerStore.get("origin") ?? "http://localhost:3000";
}

export async function loginAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=Supabase auth is not configured yet.");
  }

  const { email, password } = getCredentials(formData);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    await ensureProfileForUser(data.user);
  }

  revalidatePath("/", "layout");
  redirect("/profile");
}

export async function signupAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=Supabase auth is not configured yet.");
  }

  const { email, password } = getCredentials(formData);
  const origin = await getOrigin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/profile`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user && data.session) {
    await ensureProfileForUser(data.user);
    revalidatePath("/", "layout");
    redirect("/profile");
  }

  redirect(
    "/login?message=Check your email to confirm your account, then sign in.",
  );
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/login?message=Signed out.");
}
