import { Sequelize, Model, DataTypes } from "sequelize";

export const sequelize = new Sequelize(
  "postgres://postgres:mydbpass@db:5432/postgres",
  {
    // Don't print all SQL queries, to make log more readable
    logging: false,
  }
);

interface DocumentAttributes {
  id: number;
  originalUrl: string;
  thumbnailSuccessful: boolean | null;
}

export class Document extends Model implements DocumentAttributes {
  public id!: number;
  public originalUrl!: string;
  public thumbnailSuccessful!: boolean | null;
}
Document.init(
  {
    originalUrl: {
      type: DataTypes.STRING(2048),
      unique: true,
      allowNull: false,
    },
    thumbnailSuccessful: DataTypes.BOOLEAN,
  },
  { sequelize, modelName: "document" }
);

export async function initDB() {
  await sequelize.authenticate();
  console.log("Authentication with DB successful.");

  // We use force: true to clear the whole DB at every start, because it makes it easier to test the app manually, but in the real world we would not do that of course.
  await sequelize.sync({ force: true });

  console.log("Synchronization of data structure in DB successful.");
}
