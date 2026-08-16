# E2E Tests Setup Guide

## Prerequisites

1. **MySQL Database**
   - Host: localhost:3306
   - Username: root
   - Password: root
   - Database: test_base

2. **Node.js & pnpm**
   - Node.js >= 16
   - pnpm >= 9.7.1

3. **Prisma Client & Playwright Browsers**
   - Prisma client auto-generated on `pnpm install` via postinstall hook
   - Playwright browsers installed via `pnpm test:setup`

## First Time Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Setup test environment (Prisma client + Playwright browsers)
pnpm test:setup

# 3. Ensure MySQL is running and test_base database exists
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS test_base;"
```

**Note**: `pnpm test:setup` will:
- Generate Prisma client
- Install Playwright Chromium browser (~100MB download)

## Running Tests

```bash
# Run all E2E tests
pnpm test

# Run with Playwright UI
pnpm test:e2e:ui

# Run in debug mode
pnpm test:e2e:debug

# Run in headed mode (see browser)
pnpm test:e2e:headed

# View test report
pnpm test:e2e:report
```

## Troubleshooting

### Issue: Playwright browsers not installed

**Error**: `Executable doesn't exist at C:\Users\...\ms-playwright\chromium_headless_shell-1217\...`

**Solution**:
```bash
pnpm exec playwright install chromium
# or install all browsers
pnpm exec playwright install
```

### Issue: Prisma Client DLL locked (Windows)

**Error**: `EPERM: operation not permitted, unlink 'query_engine-windows.dll.node'`

**Solution**:
1. Close all Node.js processes
2. Run `pnpm test:setup` separately first
3. Then run `pnpm test`

### Issue: Database connection failed

**Error**: `Can't reach database server at localhost:3306`

**Solution**:
1. Ensure MySQL is running
2. Check credentials in `playground/server/schema.prisma`
3. Create test database: `CREATE DATABASE test_base;`

### Issue: Port already in use

**Error**: `Port 8001/5173/5174 is already in use`

**Solution**:
- The test suite uses dynamic port allocation
- If preferred ports are taken, it will find available ones
- Check `e2e/helpers/port-manager.ts` for configuration

## Test Structure

```
e2e/
├── config/
│   └── playwright.config.ts       # Playwright configuration
├── fixtures/
│   ├── database.ts                # Database helper
│   └── services.ts                # Service orchestrator
├── helpers/
│   ├── port-manager.ts            # Port allocation
│   ├── report-interceptor.ts      # Report capture
│   └── service-health.ts          # Health checks
├── setup/
│   ├── global-setup.ts            # Pre-test setup
│   └── global-teardown.ts         # Post-test cleanup
└── tests/
    ├── integration/               # Integration tests
    │   ├── demo-page.spec.ts
    │   ├── manager.spec.ts
    │   └── mock-app.spec.ts
    └── plugins/                   # Plugin tests
        ├── customer.spec.ts
        ├── dom.spec.ts
        ├── errors.spec.ts
        ├── fetch.spec.ts
        ├── page-crash.spec.ts
        ├── performance.spec.ts
        ├── routing.spec.ts
        └── xhr.spec.ts
```

## What Tests Do

### Global Setup (runs once before all tests)
1. Connect to database
2. Push Prisma schema to database
3. Clean up old test data
4. Seed test data (test_mock_app project)
5. Build SDK packages
6. Start services (server, mock_app, manager)

### Test Execution
- Tests run sequentially (workers: 1)
- Each test can intercept and validate reports
- Services remain running between tests

### Global Teardown (runs once after all tests)
1. Stop all services
2. Clean up test data
3. Disconnect from database

## CI/CD Integration

```yaml
# Example GitHub Actions workflow
- name: Setup MySQL
  run: |
    sudo systemctl start mysql
    mysql -u root -proot -e "CREATE DATABASE test_base;"

- name: Install dependencies
  run: pnpm install

- name: Run E2E tests
  run: pnpm test
```
