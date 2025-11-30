// src/ormconfig.ts
import * as dotenv from 'dotenv';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

dotenv.config({ path: `.env.${process.env.NODE_ENV || '.env.development'}` });

const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST_LOCAL || 'localhost',
  port: parseInt(
    process.env.POSTGRES_PORT_LOCAL || process.env.POSTGRES_PORT || '5432',
    10,
  ),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'postgres',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
};

export default config;
