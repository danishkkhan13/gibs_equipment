import { DataTypes, Model, Sequelize, ForeignKey } from "sequelize";

export default function initProductModel(sequelize: Sequelize) {
  class Product extends Model {
    declare id: number;
    declare name: string;
    declare description: string | null;
    declare price: number;
    declare user_id: ForeignKey<string>; // ✅ FK -> User.id (UUID)
  }

  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,     // ✅ must match User.id type
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "products",
      timestamps: true,
      underscored: true,
    }
  );

  return Product;
}
