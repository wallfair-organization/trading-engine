import { ConnectionOptions } from 'typeorm';
console.log(__dirname);

const config: ConnectionOptions = {
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  port: +process.env.TYPEORM_PORT,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  ssl: false,

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
