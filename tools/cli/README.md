# @heimdallr-sdk/cli

A CLI for creating runnable Heimdallr playground projects.

## Install

```bash
npm i -g @heimdallr-sdk/cli
```

## Commands

### Create Playground Project

```bash
heimdallr create
heimdallr-create
```

`create` copies code directly from `playground`, then rewrites the generated project's local config.

```bash
heimdallr create --template manager --name heimdallr_manager --client-api localhost:8001
heimdallr create --template server --name heimdallr_server --database heimdallr --mysql-port 3307
heimdallr create --template server-rabbitmq --name heimdallr_mqserver --rabbit-host localhost
heimdallr create --template mock-app --name heimdallr_mock_app --client-api localhost:8001
```

Available templates:

- `manager` -> `playground/manager`
- `server` -> `playground/server`
- `server-rabbitmq` -> `playground/server_consumer` and `playground/server_producer`
- `mock-app` -> `playground/mock_app`

Config flags:

- `--client-api <host:port>`
- `--database <name>`
- `--mysql-host <host>`
- `--mysql-port <port>`
- `--mysql-user <user>`
- `--mysql-password <password>`
- `--rabbit-host <host>`
- `--force` - overwrite existing directory

