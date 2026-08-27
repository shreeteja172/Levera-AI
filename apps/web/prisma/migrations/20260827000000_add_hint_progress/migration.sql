-- CreateTable
CREATE TABLE IF NOT EXISTS "hint_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemSlug" TEXT NOT NULL,
    "unlockedLevel" INTEGER NOT NULL DEFAULT 0,
    "revealedLevel" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hint_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "hint_progress_userId_problemSlug_key" ON "hint_progress"("userId", "problemSlug");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "hint_progress" ADD CONSTRAINT "hint_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
