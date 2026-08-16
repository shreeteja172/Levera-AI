import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
  ],
});

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

export async function requestPasswordReset(email: string) {
  const result = await authClient.requestPasswordReset({
    email,
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function resetPassword(newPassword: string, token: string) {
  const result = await authClient.resetPassword({
    newPassword,
    token,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function sendOtp(email: string) {
  const result = await authClient.emailOtp.sendVerificationOtp({
    email,
    type: "sign-in",
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}