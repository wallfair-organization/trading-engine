# trading-engine

> Trading engine package to be used for Wallfair trading related microservices

<span class="badge-npmversion"><a href="https://www.npmjs.com/package/@wallfair.io/trading-engine" title="View this project on NPM"><img src="https://img.shields.io/npm/v/@wallfair.io/trading-engine.svg" alt="NPM version" /></a></span>

## Configuration

| ENV                  | Default Value | Example Value |
| -------------------- | ------------- | ------------- |
| POSTGRES_USER        | postgres      | postgres      |
| POSTGRES_HOST        | localhost     | localhost     |
| POSTGRES_DB          | testdb        | testdb        |
| POSTGRES_PASSWORD    | postgres      | postgres      |
| POSTGRES_PORT        | 5432          | 5432          |
| POSTGRES_DISABLE_SSL |               | true          |
| POSTGRES_CA          |               | TBD           |
| DB_QUERY_LOGGING     |               | true          |
| POOL_MAX_SIZE        | 20            | 20            |
| POOL_IDLE_TIMEOUT    | 10000         | 10000         |
| POOL_MAX_USES        | 7200          | 7200          |
| CONNECTION_TIMEOUT   | 1000          | 1000          |

For convenience, a `.env.example` is provided. This file can be renamed to `.env` and adjusted.

## Commands

- Create new empty entity (eg. `Transactions`)

```sh
npm run entity:create Transactions
```

- Generate migration from latest changes on entities

```sh
npm run migration:generate MigrationName
```

- Generate empty migration file

```sh
npm run migration:create MigrationName
```

- Apply all pending migrations to your db

```sh
npm run migration:run
```

- Drop schema

```sh
npm run schema:drop
```

- Generate trading-engine codebase documentation

```sh
npm run doc
```

## Usage

TODO: Add future usage definitions of what library is all around.

## Additional Info

Author: [Samir Hodzic](https://github.com/SamirHodzic)

License: AGPL 3.0

## Copyright

2021 - Wallfair.
