CREATE TABLE "notification" (
  "id" TEXT NOT NULL DEFAULT id('ntf'),
  "companyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "recordId" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "from" TEXT,
  "documentType" TEXT,
  "read" BOOLEAN NOT NULL DEFAULT FALSE,
  "seen" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "notification_pkey" PRIMARY KEY ("id", "companyId"),
  CONSTRAINT "notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "notification_companyId_idx" ON "notification" ("companyId");
CREATE INDEX "notification_userId_idx" ON "notification" ("userId");
CREATE INDEX "notification_userId_unread_idx" ON "notification" ("userId", "read") WHERE "read" = FALSE;
CREATE INDEX "notification_createdAt_idx" ON "notification" ("createdAt" DESC);

ALTER TABLE "notification" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_select" ON "notification"
  FOR SELECT USING ("userId" = auth.uid()::text);

CREATE POLICY "notification_update" ON "notification"
  FOR UPDATE USING ("userId" = auth.uid()::text);

CREATE POLICY "notification_insert" ON "notification"
  FOR INSERT WITH CHECK (
    (SELECT auth.role()) = 'service_role'
  );

ALTER PUBLICATION supabase_realtime ADD TABLE "notification";
