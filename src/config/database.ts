import { type Dialect } from "sequelize";

interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: Dialect;
  // logging: boolean | ((sql: string, timing?: number) => void);
}

const config: DatabaseConfig = {
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "rag_test_db",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  dialect: "postgres",
  // logging: process.env.NODE_ENV === "development" ? console.log : false,
};

export default config;
