import { serviceOrchestrator } from '../fixtures/services';
import { databaseHelper } from '../fixtures/database';

async function globalTeardown() {
  console.log('\n=== E2E Test Global Teardown ===\n');

  try {
    console.log('1. Stopping services...');
    await serviceOrchestrator.stopAll();

    console.log('\n2. Cleaning up test data...');
    // Reconnect if needed for cleanup
    try {
      await databaseHelper.cleanup();
    } catch (error) {
      // If database is not connected, connect first
      if (error instanceof Error && error.message === 'Database not connected') {
        await databaseHelper.connect();
        await databaseHelper.cleanup();
      } else {
        throw error;
      }
    }

    console.log('\n3. Disconnecting database...');
    await databaseHelper.disconnect();

    console.log('\n=== Global Teardown Complete ===\n');
  } catch (error) {
    console.error('Global teardown failed:', error);
    // Try to disconnect anyway
    try {
      await databaseHelper.disconnect();
    } catch (e) {
      // Ignore disconnect errors in teardown
    }
    throw error;
  }
}

export default globalTeardown;
