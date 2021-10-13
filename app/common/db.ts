import { Sequelize, Model, DataTypes } from "sequelize";

export const sequelize = new Sequelize(
  "postgres://postgres:mydbpass@db:5432/postgres"
);

interface DocumentAttributes {
  originalUrl: string;
  downloadSuccessful: boolean | null;
}

export class Document extends Model implements DocumentAttributes {
  public originalUrl!: string;
  public downloadSuccessful!: boolean | null;
}
Document.init(
  {
    originalUrl: { type: DataTypes.STRING(2048), primaryKey: true },
    downloadSuccessful: DataTypes.BOOLEAN,
  },
  { sequelize, modelName: "document" }
);

export async function initDB() {
  await sequelize.authenticate();
  console.log("Authentication with DB successful.");
  await sequelize.sync({ alter: true });
  console.log("Synchronization of data structure in DB successful.");
}