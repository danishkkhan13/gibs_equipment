import { DataTypes, Model, Sequelize } from "sequelize";

export default (sequelize: Sequelize) => {
  class Product extends Model {
    public id!: number;
    public name!: string;
    public description!: string | null;
    public user_id!: string;
    public image_url!: string | null;
    public readonly createdAt!: Date; // camelCase for Sequelize
    public readonly updatedAt!: Date;
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "created_at", // maps DB column created_at → createdAt
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "updated_at", // maps DB column updated_at → updatedAt
      },
    },
    {
      sequelize,
      tableName: "products",
      timestamps: true, // enables Sequelize’s timestamp handling
      createdAt: "created_at", // map to DB column
      updatedAt: "updated_at", // map to DB column
    }
  );

  return Product;
};
