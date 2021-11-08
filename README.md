# trading-engine

Trading engine package to be used for Wallfair trading related microservices

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

## Usage

TODO: Add future usage definitions of what library is all around.

## Additional Info

Author: [Samir Hodzic](https://github.com/SamirHodzic)

License: AGPL 3.0

## Copyright

2021 - Wallfair.
