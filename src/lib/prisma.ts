import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to create the Prisma client.");
}

const globalForPrisma = globalThis as unknown as {
  prisma?: InstanceType<typeof PrismaClient>;
  prismaSchemaVersion?: string;
};

const prismaSchemaVersion = "20261011100000_add_review_votes";
const existingPrisma = globalForPrisma.prisma;

export const prisma =
  existingPrisma && globalForPrisma.prismaSchemaVersion === prismaSchemaVersion
    ? existingPrisma
    : new PrismaClient({
        adapter: new PrismaPg({ connectionString }),
      });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaVersion = prismaSchemaVersion;
}
