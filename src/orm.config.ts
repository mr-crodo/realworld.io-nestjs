// src/orm.config.ts
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const config: PostgresConnectionOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST_LOCAL || "localhost", // ← Берём из .env
  port: parseInt(process.env.POSTGRES_PORT_LOCAL || "5432", 10), // ← Берём из .env
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  database: process.env.POSTGRES_DB || "postgres",
  entities: [__dirname + "/**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
  synchronize: process.env.NODE_ENV !== "production", // Только для dev!
  logging: process.env.NODE_ENV === "development", // Логи только в dev
};

export default config;
