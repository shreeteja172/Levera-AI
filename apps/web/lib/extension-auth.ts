import prisma from "./prisma";

export async function validateBearerToken(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          isPro: true,
          preferredLanguage: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return { session, user: session.user };
}
