import { DataTypes, Model, Sequelize } from "sequelize";

export default (sequelize: Sequelize) => {
  class Product extends Model {
    public id!: number;
    public name!: string;
    public description!: string | null;
    public user_id!: string; // Change this to UUID
    public image_url!: string | null;
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
      user_id: {
        type: DataTypes.UUID, // Change user_id to UUID to match users table
        allowNull: false,
        references: {
          model: 'users', // The users table
          key: 'id',      // Referencing the id field in users table (UUID)
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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
