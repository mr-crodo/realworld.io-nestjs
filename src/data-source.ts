import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
// Импортируйте существующие сущности явно:
import { Tag } from '../tag/entities';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST_LOCAL || 'localhost',
  port: parseInt(
    process.env.POSTGRES_PORT_LOCAL || process.env.POSTGRES_PORT || '5432',
    10,
  ),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'postgres',
  entities: [Tag], // Добавляйте сюда новые сущности по мере необходимости
  synchronize: false, // Для миграций всегда false!
  migrations: [__dirname + '/migrations/*{.ts,.js}'], // Путь к миграциям
});
