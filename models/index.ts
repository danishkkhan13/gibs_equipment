import { Sequelize } from "sequelize";
import DBServices from "../database/DBService";

import initUserModel from "./User";
import initProductModel from "./Product";

// Initialize DB services
const dbService = new DBServices();
const sequelize: Sequelize = dbService.sequelizeWriter;

// Initialize models
const User = initUserModel(sequelize);
const Product = initProductModel(sequelize);

// Associations
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

// Export db instance
const db = {
  sequelize,
  Sequelize,
  User,
  Product,
};

export default db;
export { dbService, sequelize, User, Product };
