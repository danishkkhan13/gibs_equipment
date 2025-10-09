import { Sequelize } from "sequelize";
import { Category } from "../models"; // Correctly import Category model
import DBServices from "../database/DBService";

// Initialize DB services and Sequelize instance
const dbService = new DBServices();
const sequelize: Sequelize = dbService.sequelizeWriter;

// Seed categories into the database
async function ensureCategories(sequelize: Sequelize) {
  const categories = [
    { id: "123e4567-e89b-12d3-a456-426614174000", name: "Construction equipment" },
    { id: "123e4567-e89b-12d3-a456-426614174001", name: "Civil Lab Equipment" },
    { id: "123e4567-e89b-12d3-a456-426614174002", name: "BIS Lab test equipment" },
    { id: "123e4567-e89b-12d3-a456-426614174003", name: "Laboratory setup" },
    { id: "123e4567-e89b-12d3-a456-426614174004", name: "School" },
    { id: "123e4567-e89b-12d3-a456-426614174005", name: "Engineering College" },
    { id: "123e4567-e89b-12d3-a456-426614174006", name: "Pharmacy college" },
    { id: "123e4567-e89b-12d3-a456-426614174007", name: "Hospital" },
    { id: "123e4567-e89b-12d3-a456-426614174008", name: "Pathology Lab" },
    { id: "123e4567-e89b-12d3-a456-426614174009", name: "Chemical & Apparatus" },
    { id: "123e4567-e89b-12d3-a456-426614174010", name: "Smart board Interactive panel" },
    { id: "123e4567-e89b-12d3-a456-426614174011", name: "Full HD / 4K camera" },
  ];

  for (const category of categories) {
    await Category.findOrCreate({
      where: { id: category.id },
      defaults: category,
    });
  }

  console.log("✅ Categories seeded");
}

// Ensure `category_id` column exists in `products` table
async function ensureCategoryReference(sequelize: Sequelize) {
  try {
    // Check if the column already exists before adding it
    const columnExists = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'products' AND column_name = 'category_id';
    `);

    // If the column doesn't exist, add it
    if (columnExists[0].length === 0) {
      console.log("Adding category_id column to products table...");
      await sequelize.query(`
        ALTER TABLE public.products
          ADD COLUMN category_id UUID;
      `);
      console.log("✅ Added category_id column to products table");
    }

    // Add foreign key constraint only if it doesn't exist
    const constraintExists = await sequelize.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conname = 'products_category_id_fkey';
    `);

    // If the foreign key constraint doesn't exist, add it
    if (constraintExists[0].length === 0) {
      console.log("Adding foreign key constraint for category_id...");
      await sequelize.query(`
        ALTER TABLE public.products
          ADD CONSTRAINT products_category_id_fkey
          FOREIGN KEY (category_id)
          REFERENCES public.categories(id)
          ON DELETE SET NULL;
      `);
      console.log("✅ Added foreign key constraint for category_id in products table");
    }

  } catch (error) {
    console.error("❌ Error adding category_id column and constraint:", error);
    throw error;
  }
}

// Sync database and seed categories
export async function syncDatabase(sequelize: Sequelize) {
  try {
    console.log("🔄 Syncing database...");

    // Ensure category_id exists and is referenced in products table
    await ensureCategoryReference(sequelize);

    // Ensure categories are seeded
    await ensureCategories(sequelize);

    // Sync models (no drop)
    await sequelize.sync(); // or { alter: true } if you want Sequelize to auto-add missing columns

    console.log("✅ Tables are in sync");

  } catch (error) {
    console.error("❌ Database sync failed:", error);
    throw error;
  }
}
