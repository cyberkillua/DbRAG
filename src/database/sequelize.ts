import { Sequelize } from "sequelize";
import config from "../config/database";

const sequelize = new Sequelize({
  database: config.database,
  username: config.username,
  password: config.password,
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    // underscored: true,
  },
});

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Only sync models in development mode
    // In production, use migrations instead
    if (
      process.env.NODE_ENV === "development" &&
      process.env.USE_MIGRATIONS !== "true"
    ) {
      await sequelize.sync({ alter: true });
      console.log("✅ Database models synchronized (development mode).");
    } else {
      console.log("📋 Using migrations for schema management.");
    }
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    throw error;
  }
};

export default sequelize;
