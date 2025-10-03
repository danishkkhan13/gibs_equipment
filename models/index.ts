import { Sequelize } from "sequelize";
import DBServices from "../database/DBService";

import initUserModel from "./User";
import initProductModel from "./Product";

// ✅ create DB service instance
const dbService = new DBServices();
const sequelize: Sequelize = dbService.sequelizeWriter;

/* ------------ Initialize Models ------------ */
const User = initUserModel(sequelize);
const Product = initProductModel(sequelize);

/* ------------ Define Associations ------------ */
// One User → Many Products
User.hasMany(Product, {
  foreignKey: { name: "user_id", allowNull: false },
  as: "products",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Each Product → One User
Product.belongsTo(User, {
  foreignKey: { name: "user_id", allowNull: false },
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

/* ------------ Export ------------ */
const db = {
  sequelize,     // Sequelize instance
  Sequelize,     // Sequelize class itself
  User,
  Product,
};

export default db;
export { dbService, sequelize, User, Product };
