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

const prismaSchemaVersion = "20261009120000_add_saved_game_items";
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
