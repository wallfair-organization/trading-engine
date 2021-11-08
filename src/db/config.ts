import { ConnectionOptions } from 'typeorm';
console.log(__dirname);

const config: ConnectionOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: process.env.POSTGRES_DISABLE_SSL !== 'true',

  migrationsRun: true,
  synchronize: true,
  logging: true,

  entities: [__dirname + '/entities/*{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  cli: {
    migrationsDir: './src/db/migrations',
    entitiesDir: './src/db/entities',
  },
};

export = config;
