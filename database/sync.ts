import type { Sequelize } from "sequelize";

/**
 * Synchronize all Sequelize models with the database.
 * In development: alter=true
 * In production: keep alter=false if you use migrations.
 */
export default async function syncDatabase(sequelize: Sequelize): Promise<void> {
  const isProd = process.env.NODE_ENV === "production";
  console.log(`🔄 Syncing database (alter=${!isProd})...`);

  await sequelize.sync({
    alter: !isProd,
    logging: false,
  });

  console.log("✅ Database synced successfully");
}
