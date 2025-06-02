import { ConnectionOptions } from 'typeorm';

require('dotenv').config();

const config: ConnectionOptions = {
    type: 'postgres',
    host: process.env.POSTGRES_HOST_LOCAL || 'localhost',  // ✅ Используем POSTGRES_HOST_LOCAL
    port: parseInt(process.env.POSTGRES_PORT_LOCAL || '5433'),  // ✅ Используем POSTGRES_PORT_LOCAL
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'test123456',
    database: process.env.POSTGRES_DB || 'realwordio',
    entities: [__dirname +'/**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: true,
};

export default config;