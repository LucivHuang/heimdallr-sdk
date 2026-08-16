import { test, expect, Page } from '@playwright/test';
import { ReportInterceptor } from '../../helpers/report-interceptor';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getPort(service: string): number {
  const ports = JSON.parse(readFileSync(path.join(__dirname, '../../.test-ports.json'), 'utf-8'));
  return ports[service];
}
const MOCK_APP_PORT = getPort('mockApp');

const EventTypes = {
  LIFECYCLE: 1,
  ERROR: 2,
  API: 4,
  DOM: 5,
  ROUTE: 6,
};

test.describe('Mock App Integration Tests', () => {
  let page: Page;
  let interceptor: ReportInterceptor;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    interceptor = new ReportInterceptor(page);
    await interceptor.start();
  });

  test('should initialize SDK and call /project/init', async () => {
    let initCalled = false;

    // Register route handler BEFORE navigating so the init request is captured
    await page.route('**/project/init**', async (route) => {
      initCalled = true;
      await route.continue();
    });

    await page.goto(`http://localhost:${MOCK_APP_PORT}/`);
    // waitForLoadState('networkidle') may resolve before the async init XHR completes;
    // give the SDK a moment to fire /project/init
    await page.waitForTimeout(3000);

    expect(initCalled).toBe(true);
  });

  test('should navigate between routes', async () => {
    await page.goto(`http://localhost:${MOCK_APP_PORT}/`);
    await page.waitForLoadState('networkidle');

    interceptor.clear();

    // mock_app uses createHashRouter — navigate via hash change within the same page
    // so the SDK stays alive and the hash plugin fires a ROUTE event
    await page.evaluate(() => {
      window.location.hash = '#/login';
    });

    await page.waitForTimeout(1000);

    const routeReports = interceptor.getReportsByEventType(EventTypes.ROUTE);
    expect(routeReports.length).toBeGreaterThan(0);
  });

  test('should trigger XHR and fetch requests', async () => {
    await page.goto(`http://localhost:${MOCK_APP_PORT}/`);
    await page.waitForLoadState('networkidle');

    interceptor.clear();

    const xhrButton = await page.locator('button:has-text("xhr")').first();
    if (await xhrButton.isVisible()) {
      await xhrButton.click();
      await page.waitForTimeout(2000);
    }

    const fetchButton = await page.locator('button:has-text("fetch")').first();
    if (await fetchButton.isVisible()) {
      await fetchButton.click();
      await page.waitForTimeout(2000);
    }

    const apiReports = interceptor.getReportsByEventType(EventTypes.API);
    expect(apiReports.length).toBeGreaterThan(0);
  });

  test('should track click events', async () => {
    await page.goto(`http://localhost:${MOCK_APP_PORT}/`);
    await page.waitForLoadState('networkidle');

    interceptor.clear();

    const buttons = await page.locator('button').all();
    if (buttons.length > 0) {
      await buttons[0].click();
      await page.waitForTimeout(1000);

      const domReports = interceptor.getReportsByEventType(EventTypes.DOM);
      expect(domReports.length).toBeGreaterThan(0);
    }
  });

  test('should send reports to /log/report', async () => {
    let reportCalled = false;

    await page.route('**/log/report', async (route) => {
      reportCalled = true;
      await route.continue();
    });

    await page.goto(`http://localhost:${MOCK_APP_PORT}/`);
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(3000);

    expect(reportCalled).toBe(true);
  });

  test('should track session', async () => {
    await page.goto(`http://localhost:${MOCK_APP_PORT}/`);
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(2000);

    const reports = interceptor.getReports();
    expect(reports.length).toBeGreaterThan(0);

    const sessionIds = reports.map(r => r.sid).filter(Boolean);
    const uniqueSessionIds = new Set(sessionIds);

    expect(uniqueSessionIds.size).toBe(1);
  });

  test('should accumulate breadcrumbs', async () => {
    await page.goto(`http://localhost:${MOCK_APP_PORT}/`);
    await page.waitForLoadState('networkidle');

    interceptor.clear();

    const buttons = await page.locator('button').all();
    if (buttons.length > 0) {
      await buttons[0].click();
      await page.waitForTimeout(500);
    }

    await page.goto(`http://localhost:${MOCK_APP_PORT}/login`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const reports = interceptor.getReports();
    const reportsWithBreadcrumbs = reports.filter(r => r.b && r.b.length > 0);

    expect(reportsWithBreadcrumbs.length).toBeGreaterThan(0);
  });
});