import { ConnectionOptions } from 'typeorm';
import dotenv from 'dotenv';
dotenv.config();

const config: ConnectionOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: process.env.POSTGRES_DISABLE_SSL !== 'true',
  dropSchema: true,
  migrationsRun: true,
  logging: false,

  entities: [__dirname + '/../../db/entities/*{.ts,.js}'],
  subscribers: [__dirname + '/../../db/subscribers/*{.ts,.js}'],
  migrations: [__dirname + '/../../db/migrations/*{.ts,.js}'],
};

export default config;
