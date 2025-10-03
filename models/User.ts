import { Sequelize, DataTypes, Model, Optional } from "sequelize";

export interface UserAttrs {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type UserCreation = Optional<UserAttrs, "id" | "created_at" | "updated_at" | "deleted_at">;

export class User extends Model<UserAttrs, UserCreation> implements UserAttrs {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at!: Date | null;
}

export default function initUserModel(sequelize: Sequelize) {
  User.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      tableName: "users",
      schema: "public",
      timestamps: false,
      indexes: [
        { fields: ["email"], unique: true },
        { fields: ["deleted_at"] },
      ],
    }
  );

  return User;
}
