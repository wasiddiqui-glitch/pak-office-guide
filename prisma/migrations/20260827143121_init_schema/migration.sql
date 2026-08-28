-- Extensions required for full-text search ranking helpers and vector similarity search.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" TEXT,
    "address" TEXT,
    "googleMapsLink" TEXT,
    "hours" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "lastUpdated" TIMESTAMP(3),
    "searchVector" tsvector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeRequirement" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "OfficeRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeStep" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "OfficeStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeFee" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "OfficeFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeNote" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "OfficeNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guide" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "emoji" TEXT,
    "summary" TEXT,
    "categoryId" TEXT,
    "city" TEXT,
    "estimatedTime" TEXT,
    "totalFees" TEXT,
    "relatedOfficeCategory" TEXT,
    "lastUpdated" TIMESTAMP(3),
    "searchVector" tsvector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideRequirement" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "GuideRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideStep" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "GuideStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideTip" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "GuideTip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideFaq" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "q" TEXT NOT NULL,
    "a" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "GuideFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Embassy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "hours" TEXT,
    "nadraDesk" BOOLEAN NOT NULL DEFAULT false,
    "passportServices" BOOLEAN NOT NULL DEFAULT false,
    "nicopServices" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" TIMESTAMP(3),
    "searchVector" tsvector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Embassy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmbassyService" (
    "id" TEXT NOT NULL,
    "embassyId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "EmbassyService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmbassyRequirement" (
    "id" TEXT NOT NULL,
    "embassyId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "EmbassyRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmbassyStep" (
    "id" TEXT NOT NULL,
    "embassyId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "EmbassyStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmbassyFee" (
    "id" TEXT NOT NULL,
    "embassyId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "EmbassyFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmbassyNote" (
    "id" TEXT NOT NULL,
    "embassyId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "EmbassyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "tokenCount" INTEGER,
    "embedding" vector(1536),
    "searchVector" tsvector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Office_cityId_categoryId_idx" ON "Office"("cityId", "categoryId");

-- CreateIndex
CREATE INDEX "Office_name_idx" ON "Office"("name");

-- CreateIndex
CREATE INDEX "Office_searchVector_idx" ON "Office" USING GIN ("searchVector");

-- CreateIndex
CREATE INDEX "OfficeRequirement_officeId_position_idx" ON "OfficeRequirement"("officeId", "position");

-- CreateIndex
CREATE INDEX "OfficeStep_officeId_position_idx" ON "OfficeStep"("officeId", "position");

-- CreateIndex
CREATE INDEX "OfficeFee_officeId_position_idx" ON "OfficeFee"("officeId", "position");

-- CreateIndex
CREATE INDEX "OfficeNote_officeId_position_idx" ON "OfficeNote"("officeId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Guide_slug_key" ON "Guide"("slug");

-- CreateIndex
CREATE INDEX "Guide_categoryId_idx" ON "Guide"("categoryId");

-- CreateIndex
CREATE INDEX "Guide_searchVector_idx" ON "Guide" USING GIN ("searchVector");

-- CreateIndex
CREATE INDEX "GuideRequirement_guideId_position_idx" ON "GuideRequirement"("guideId", "position");

-- CreateIndex
CREATE INDEX "GuideStep_guideId_position_idx" ON "GuideStep"("guideId", "position");

-- CreateIndex
CREATE INDEX "GuideTip_guideId_position_idx" ON "GuideTip"("guideId", "position");

-- CreateIndex
CREATE INDEX "GuideFaq_guideId_position_idx" ON "GuideFaq"("guideId", "position");

-- CreateIndex
CREATE INDEX "Embassy_region_idx" ON "Embassy"("region");

-- CreateIndex
CREATE INDEX "Embassy_searchVector_idx" ON "Embassy" USING GIN ("searchVector");

-- CreateIndex
CREATE INDEX "EmbassyService_embassyId_position_idx" ON "EmbassyService"("embassyId", "position");

-- CreateIndex
CREATE INDEX "EmbassyRequirement_embassyId_position_idx" ON "EmbassyRequirement"("embassyId", "position");

-- CreateIndex
CREATE INDEX "EmbassyStep_embassyId_position_idx" ON "EmbassyStep"("embassyId", "position");

-- CreateIndex
CREATE INDEX "EmbassyFee_embassyId_position_idx" ON "EmbassyFee"("embassyId", "position");

-- CreateIndex
CREATE INDEX "EmbassyNote_embassyId_position_idx" ON "EmbassyNote"("embassyId", "position");

-- CreateIndex
CREATE INDEX "DocumentChunk_sourceType_sourceId_idx" ON "DocumentChunk"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "DocumentChunk_searchVector_idx" ON "DocumentChunk" USING GIN ("searchVector");

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeRequirement" ADD CONSTRAINT "OfficeRequirement_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeStep" ADD CONSTRAINT "OfficeStep_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeFee" ADD CONSTRAINT "OfficeFee_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeNote" ADD CONSTRAINT "OfficeNote_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideRequirement" ADD CONSTRAINT "GuideRequirement_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideStep" ADD CONSTRAINT "GuideStep_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideTip" ADD CONSTRAINT "GuideTip_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideFaq" ADD CONSTRAINT "GuideFaq_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbassyService" ADD CONSTRAINT "EmbassyService_embassyId_fkey" FOREIGN KEY ("embassyId") REFERENCES "Embassy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbassyRequirement" ADD CONSTRAINT "EmbassyRequirement_embassyId_fkey" FOREIGN KEY ("embassyId") REFERENCES "Embassy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbassyStep" ADD CONSTRAINT "EmbassyStep_embassyId_fkey" FOREIGN KEY ("embassyId") REFERENCES "Embassy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbassyFee" ADD CONSTRAINT "EmbassyFee_embassyId_fkey" FOREIGN KEY ("embassyId") REFERENCES "Embassy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbassyNote" ADD CONSTRAINT "EmbassyNote_embassyId_fkey" FOREIGN KEY ("embassyId") REFERENCES "Embassy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Full-text search: weighted tsvector maintenance via triggers ──────────
-- Keeping this in triggers (rather than generated columns) lets each vector pull
-- in the related City/Category name via a subquery, which a generated column can't do.

CREATE OR REPLACE FUNCTION office_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', coalesce(NEW."name", '')), 'A') ||
    setweight(to_tsvector('english', coalesce((SELECT "name" FROM "Category" WHERE "id" = NEW."categoryId"), '')), 'B') ||
    setweight(to_tsvector('english', coalesce((SELECT "name" FROM "City" WHERE "id" = NEW."cityId"), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW."area", '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW."address", '')), 'D');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER office_search_vector_trigger
BEFORE INSERT OR UPDATE OF "name", "categoryId", "cityId", "area", "address" ON "Office"
FOR EACH ROW EXECUTE FUNCTION office_search_vector_update();

CREATE OR REPLACE FUNCTION guide_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', coalesce(NEW."title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW."summary", '')), 'B') ||
    setweight(to_tsvector('english', coalesce((SELECT "name" FROM "Category" WHERE "id" = NEW."categoryId"), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW."city", '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW."relatedOfficeCategory", '')), 'D');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER guide_search_vector_trigger
BEFORE INSERT OR UPDATE OF "title", "summary", "categoryId", "city", "relatedOfficeCategory" ON "Guide"
FOR EACH ROW EXECUTE FUNCTION guide_search_vector_update();

CREATE OR REPLACE FUNCTION embassy_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', coalesce(NEW."name", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW."city", '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW."country", '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW."region", '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW."address", '')), 'D');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER embassy_search_vector_trigger
BEFORE INSERT OR UPDATE OF "name", "city", "country", "region", "address" ON "Embassy"
FOR EACH ROW EXECUTE FUNCTION embassy_search_vector_update();

CREATE OR REPLACE FUNCTION document_chunk_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', coalesce(NEW."title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW."content", '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER document_chunk_search_vector_trigger
BEFORE INSERT OR UPDATE OF "title", "content" ON "DocumentChunk"
FOR EACH ROW EXECUTE FUNCTION document_chunk_search_vector_update();

-- ─── Vector similarity index (RAG hybrid retrieval) ────────────────────────
-- pgvector >= 0.5.0 supports HNSW (better recall/latency than IVFFlat, no training step needed).
CREATE INDEX "DocumentChunk_embedding_hnsw_idx" ON "DocumentChunk" USING hnsw ("embedding" vector_cosine_ops);
