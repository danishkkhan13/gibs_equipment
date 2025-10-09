import { Sequelize } from "sequelize";
import DBServices from "../database/DBService";
import initUserModel from "./User";
import initProductModel from "./Product";
import initCategoryModel from "./Category";

// Initialize DB services and Sequelize instance
const dbService = new DBServices();
const sequelize: Sequelize = dbService.sequelizeWriter;

// Initialize models
const User = initUserModel(sequelize);
const Product = initProductModel(sequelize);
const Category = initCategoryModel(sequelize); // Initialize Category model

// Define associations
User.hasMany(Product, {
  foreignKey: { name: "user_id", allowNull: false },
  as: "products",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Product.belongsTo(User, {
  foreignKey: { name: "user_id", allowNull: false },
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Product.belongsTo(Category, { foreignKey: "category_id", as: "category" }); // Product belongs to Category
Category.hasMany(Product, { foreignKey: "category_id", as: "products" }); // Category has many Products

const db = {
  sequelize,
  Sequelize,
  User,
  Product,
  Category, // Export the Category model here
};

export default db;
export { sequelize, User, Product, Category };
