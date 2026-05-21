"use server"

import { signIn, signOut } from "@/lib/auth"

export async function signInWithGoogle(_locale: string, _formData?: FormData) {
  await signIn("google", { redirectTo: `/${_locale}/ideas` })
}

export async function signInWithGitHub(_locale: string, _formData?: FormData) {
  await signIn("github", { redirectTo: `/${_locale}/ideas` })
}

export async function signOutAction(_locale: string, _formData?: FormData) {
  await signOut({ redirectTo: `/${_locale}` })
}
