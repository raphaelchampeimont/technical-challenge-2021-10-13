import { Sequelize, Model, DataTypes } from "sequelize";

export const sequelize = new Sequelize(
  "postgres://postgres:mydbpass@db:5432/postgres"
);

export class Document extends Model {}
Document.init(
  {
    originalUrl: { type: DataTypes.STRING(2048), primaryKey: true },
    originalFileHash: DataTypes.STRING,
    thumbnailAvailable: DataTypes.BOOLEAN,
  },
  { sequelize, modelName: "document" }
);

export async function initDB() {
  await sequelize.authenticate();
  console.log("Authentication with DB successful.");
  await sequelize.sync();
  console.log("Synchronization of data structure in DB successful.");
}
