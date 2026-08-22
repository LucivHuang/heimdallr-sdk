
<h2 style="color:#10b981">HEIMDALLR-SDK</h2>

首创插件化、可插拔的前端埋点 SDK · 简单易用、轻量化、插件化的前端监控利器

The first plug-in, pluggable front-end tracking SDK — easy-to-use, lightweight, and extensible

## Documentation

To check out docs, visit [heimdallr-sdk](https://LucivHuang.github.io/heimdallr-sdk/).

## Env

- node version: `20.16.0`
- npm script: `pnpm`

## Preparation

Make sure `MySQL` and `RabbitMQ` are installed

## Dev

Installation Dependency

```bash
pnpm i --registry=https://registry.npmmirror.com
```

Ensure that the local MySQL database service is started

- host: localhost
- port: 3306

Initialize the database and automatically create a database named `test_base` database for debugging

```bash
pnpm run prisma
```

Start Local Service

```bash
pnpm run dev
```

## Build

Installation Dependency

```bash
pnpm i --registry=https://registry.npmmirror.com
```

Build a single package

```bash
pnpm --filter [packageName] run build
```

For example, build a browser package

```bash
pnpm --filter @heimdallr-sdk/browser run build
```

Build all packages

```bash
pnpm run build
```

## Testing

### E2E Tests

Comprehensive end-to-end testing suite with Playwright covering SDK core functionality, all plugins, and manager integration.

**Prerequisites**
- MySQL running at localhost:3306 with database `test_base`
- Node.js >= 16, pnpm >= 9.7.1

**First Time Setup**

```bash
# Install dependencies
pnpm install

# Setup test environment (Prisma client + Playwright browsers)
pnpm test:setup

# Create test database if not exists
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS test_base;"
```

**Run Tests**

```bash
# Run all E2E tests
pnpm test

# Run tests only (skip setup — used by CI)
pnpm test:e2e

# Run with Playwright UI (interactive mode)
pnpm test:e2e:ui

# Run in debug mode
pnpm test:e2e:debug

# Run in headed mode (see browser)
pnpm test:e2e:headed

# View test report
pnpm test:e2e:report
```

**Test Coverage**
- ✅ SDK Core & Manager Integration (9 tests)
- ✅ Error Capture (5 tests)
- ✅ Mock App Integration (7 tests)
- ✅ Console Plugin (4 tests)
- ✅ Customer Events (6 tests)
- ✅ DOM Plugin (5 tests)
- ✅ Fetch Plugin (4 tests)
- ✅ Page Crash Detection (2 tests)
- ✅ Performance Metrics (5 tests)
- ✅ Recording Plugin (3 tests)
- ✅ Routing Plugin (5 tests)
- ✅ Vue Plugin (3 tests)
- ✅ XHR Plugin (3 tests)

For detailed testing documentation, see [e2e/README.md](./e2e/README.md)

## Sponsor

持续优化更新中...

完全开源，绝不收费！！！

如果对您有所帮助，那就小小支持一下吧 😘

|Alipay|Wechat|
|-|-|
|<img style="width: 200px" src="./docs/sponsor/alipay.jpg"/>|<img style="width: 193px" src="./docs/sponsor/wechat.jpg"/>|
