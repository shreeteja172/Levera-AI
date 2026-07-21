"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function approveExtension(userCode: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(`/auth/sign-in?callbackURL=/auth/extension?code=${userCode}`);
  }

  const device = await prisma.deviceCode.findUnique({
    where: {
      userCode,
    },
  });

  if (!device) {
    throw new Error("Invalid device code");
  }

  if (device.expiresAt < new Date()) {
    throw new Error("Device code expired");
  }

  if (device.status === "APPROVED") {
    return;
  }

  await prisma.deviceCode.update({
    where: {
      userCode,
    },
    data: {
      status: "APPROVED",
      userId: session.user.id,
    },
  });
  
  redirect("/auth/extension/success");
}
