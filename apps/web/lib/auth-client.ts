import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient;

export async function signInWithGoogle(callbackURL?: string) {
  return authClient.signIn.social({
    provider: "google",
    callbackURL,
  });
}

export async function signInWithEmail(
  email: string,
  password: string,
  callbackURL?: string
) {
  const result = await authClient.signIn.email({
    email,
    password,
    callbackURL,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
  callbackURL?: string
) {
  const result = await authClient.signUp.email({
    name,
    email,
    password,
    callbackURL,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}