import { ConnectionOptions } from 'typeorm';

const config: ConnectionOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl:
    process.env.POSTGRES_DISABLE_SSL === 'true'
      ? false
      : { rejectUnauthorized: false },

  migrationsRun: true,
  logging: process.env.DB_QUERY_LOGGING === 'true',

  entities: [__dirname + '/entities/*{.ts,.js}'],
  subscribers: [__dirname + '/subscribers/*{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  cli: {
    migrationsDir: './src/db/migrations',
    entitiesDir: './src/db/entities',
  },
  extra: {
    max: +process.env.POOL_MAX_SIZE || 20,
    maxUses: +process.env.POOL_MAX_USES || 7200,
    idleTimeoutMillis: +process.env.POOL_IDLE_TIMEOUT || 10000,
    connectionTimeoutMillis: +process.env.POSTGRES_CONNECTION_TIMEOUT || 1000,
    query_timeout: +process.env.QUERY_TIMEOUT || 1000,
  },
};

export default config;
