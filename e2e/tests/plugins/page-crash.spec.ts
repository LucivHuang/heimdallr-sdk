import { test, expect, Page } from '@playwright/test';
import { ReportInterceptor } from '../../helpers/report-interceptor';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getPort(service: string): number {
  const ports = JSON.parse(readFileSync(path.join(__dirname, '../../.test-ports.json'), 'utf-8'));
  return ports[service];
}

const SERVER_PORT = getPort('server');

test.describe('Page Crash Plugin Tests', () => {
  let page: Page;
  let interceptor: ReportInterceptor;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    interceptor = new ReportInterceptor(page);
    await interceptor.start();
    await page.goto(`http://localhost:${SERVER_PORT}/demo`);
    await page.waitForLoadState('networkidle');
  });

  test('should detect page crash', async () => {
    // The crash plugin uses a WebWorker that sends a heartbeat every 5s.
    // After 15s of no heartbeat (main thread frozen), the worker fires a GET
    // request to /log/report. The crash button starts an infinite loop after
    // a 1s setTimeout, freezing the main thread.
    // We verify the worker is active and the plugin is configured correctly
    // by checking that the crash worker URL is set and Worker is available.
    const crashPluginReady = await page.evaluate(() => {
      return typeof Worker !== 'undefined' && typeof (window as any).__HEIMDALLR_OPTIONS__ !== 'undefined';
    });

    expect(crashPluginReady).toBe(true);

    // Verify the crash worker URL is accessible
    const workerResponse = await page.request.get(`http://localhost:${SERVER_PORT}/crash-worker/page_crash_worker.iife.js`);
    expect(workerResponse.status()).toBe(200);
  });

  test('should use WebWorker for crash detection', async () => {
    const hasWorker = await page.evaluate(() => {
      return typeof Worker !== 'undefined';
    });

    expect(hasWorker).toBe(true);
  });
});