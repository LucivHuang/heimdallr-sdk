import { serviceOrchestrator } from '../fixtures/services';
import { databaseHelper } from '../fixtures/database';
import { portManager } from '../helpers/port-manager';
import { exec } from 'child_process';
import { writeFileSync } from 'fs';
import { promisify } from 'node:util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

async function globalSetup() {
  console.log('=== E2E Test Global Setup ===\n');

  try {
    console.log('1. Checking database connectivity...');
    await databaseHelper.connect();

    console.log('\n2. Running Prisma schema push...');
    // Push schema to database
    await execAsync('pnpm --filter @heimdallr-sdk/server prisma', {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/test_base',
      },
    });
    console.log('✓ Database schema updated');

    console.log('\n3. Cleaning up old test data...');
    await databaseHelper.cleanup();

    console.log('\n4. Seeding test data...');
    await databaseHelper.seedTestData();

    console.log('\n5. Building SDK packages...');
    await execAsync('pnpm build:packages', {
      cwd: process.cwd(),
    });
    console.log('✓ SDK packages built');

    console.log('\n6. Starting services...');
    await serviceOrchestrator.startAll();

    // Write port mapping for test files
    const ports = portManager.getPorts();
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const portsFilePath = path.join(__dirname, '..', '.test-ports.json');
    writeFileSync(portsFilePath, JSON.stringify(ports, null, 2));
    console.log(`\n✓ Port mapping written to ${portsFilePath}`);

    console.log('\n=== Global Setup Complete ===\n');
  } catch (error) {
    console.error('Global setup failed:', error);
    await databaseHelper.disconnect();
    await serviceOrchestrator.stopAll();
    throw error;
  }
}

export default globalSetup;
