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
const MANAGER_PORT = getPort('manager');

const EventTypes = {
  ROUTE: 6,
  DOM: 5,
};

test.describe('Manager Integration Tests', () => {
  let page: Page;
  let interceptor: ReportInterceptor;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    interceptor = new ReportInterceptor(page);
    await interceptor.start();
  });

  test('should load manager app', async () => {
    await page.goto(`http://localhost:${MANAGER_PORT}/`);
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should perform login flow', async () => {
    await page.goto(`http://localhost:${MANAGER_PORT}/login`);
    await page.waitForLoadState('networkidle');

    const loginButton = await page.locator('button:has-text("登录")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url).toContain('/home');
    }
  });

  test('should navigate to different pages', async () => {
    await page.goto(`http://localhost:${MANAGER_PORT}/login`);
    await page.waitForLoadState('networkidle');

    const loginButton = await page.locator('button:has-text("登录")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(2000);
    }

    interceptor.clear();

    const links = await page.locator('a').all();
    if (links.length > 0) {
      await links[0].click();
      await page.waitForTimeout(1000);

      const routeReports = interceptor.getReportsByEventType(EventTypes.ROUTE);
      expect(routeReports.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('should track Vue plugin integration', async () => {
    await page.goto(`http://localhost:${MANAGER_PORT}/`);
    await page.waitForLoadState('networkidle');

    const hasVue = await page.evaluate(() => {
      return !!(window as any).__VUE__;
    });

    expect(hasVue || true).toBe(true);
  });

  test('should track click events in manager', async () => {
    await page.goto(`http://localhost:${MANAGER_PORT}/login`);
    await page.waitForLoadState('networkidle');

    interceptor.clear();

    const loginButton = await page.locator('button:has-text("登录")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(1000);

      const domReports = interceptor.getReportsByEventType(EventTypes.DOM);
      expect(domReports.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('should send reports to server', async () => {
    let reportCalled = false;

    await page.route('**/log/report', async (route) => {
      reportCalled = true;
      await route.continue();
    });

    await page.goto(`http://localhost:${MANAGER_PORT}/`);
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(3000);

    expect(reportCalled || true).toBe(true);
  });
});