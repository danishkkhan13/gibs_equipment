import { DataTypes, Model, Sequelize } from "sequelize";

// Define the Product model for Sequelize
export default (sequelize: Sequelize) => {
  class Product extends Model {
    public id!: number;
    public name!: string;
    public description!: string | null;
    public price!: number;
    public user_id!: string;
    public image_url!: string | null; // Image URL (relative path to the file)
    public created_at!: Date;
    public updated_at!: Date;
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
        type: DataTypes.STRING,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.STRING, // Store image URL path here
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: "products",
      timestamps: false, // We manually handle created_at / updated_at
    }
  );

  return Product;
};
