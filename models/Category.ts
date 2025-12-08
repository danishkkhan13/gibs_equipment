import { DataTypes, Model, Sequelize } from "sequelize";

export default (sequelize: Sequelize) => {
  class Category extends Model {
    public id!: string;
    public name!: string;
    public is_hidden!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  Category.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING(160), allowNull: false, unique: true },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      is_hidden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false,},
    },
    {
      sequelize,
      tableName: "categories",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return Category;
};
