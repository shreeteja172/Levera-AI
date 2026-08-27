import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { approveExtension } from "./actions";

export default async function ExtensionPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  if (!code) {
    return <div>Missing code.</div>;
  }
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(`/auth/sign-in?callbackURL=/auth/extension?code=${code}`);
  }

  const device = await prisma.deviceCode.findUnique({
    where: {
      userCode: code,
    },
  });

  if (!device) {
    notFound();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <div className="rounded-lg border p-6">
        <h1 className="text-2xl font-bold">Levera Extension</h1>

        <p>User Code: {device.userCode}</p>
        <p>Status: {device.status}</p>
        <p>Expires: {device.expiresAt.toLocaleString()}</p>
      </div>
      <form
        action={async () => {
          "use server";
          await approveExtension(device.userCode);
        }}
      >
        <button
          type="submit"
          className="mt-6 rounded bg-black px-5 py-2 text-white"
        >
          Approve Extension
        </button>
      </form>
    </main>
  );
}
