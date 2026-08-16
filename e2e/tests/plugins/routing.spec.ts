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
const SERVER_PORT = getPort('server');

const EventTypes = {
  ROUTE: 6,
};

const RouteTypes = {
  HASH: 61,
  HISTORY: 62,
};

test.describe('Routing Plugin Tests', () => {
  let page: Page;
  let interceptor: ReportInterceptor;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    interceptor = new ReportInterceptor(page);
    await interceptor.start();
    await page.goto(`http://localhost:${SERVER_PORT}/demo`);
    await page.waitForLoadState('networkidle');
    interceptor.clear();
  });

  test.describe('Hash Routing', () => {
    test('should capture hash route change', async () => {
      await page.evaluate(() => {
        window.location.hash = '#/login';
      });

      await page.waitForTimeout(1000);

      const routeReports = interceptor.getReportsByEventType(EventTypes.ROUTE);
      const hashReport = routeReports.find(
        report => report.dat?.st === RouteTypes.HASH
      );

      expect(hashReport).toBeDefined();
      expect(hashReport?.dat).toHaveProperty('from');
      expect(hashReport?.dat).toHaveProperty('to');
      expect(hashReport?.dat?.to).toContain('#/login');
    });

    test('should track multiple hash changes', async () => {
      await page.evaluate(() => {
        window.location.hash = '#/page1';
      });
      await page.waitForTimeout(500);

      await page.evaluate(() => {
        window.location.hash = '#/page2';
      });
      await page.waitForTimeout(500);

      const routeReports = interceptor.getReportsByEventType(EventTypes.ROUTE);
      const hashReports = routeReports.filter(
        report => report.dat?.st === RouteTypes.HASH
      );

      expect(hashReports.length).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('History Routing', () => {
    test('should capture history pushState', async () => {
      await page.evaluate(() => {
        window.history.pushState({}, '', '/new-page');
      });

      await page.waitForTimeout(1000);

      const routeReports = interceptor.getReportsByEventType(EventTypes.ROUTE);
      const historyReport = routeReports.find(
        report => report.dat?.st === RouteTypes.HISTORY
      );

      expect(historyReport).toBeDefined();
      expect(historyReport?.dat).toHaveProperty('from');
      expect(historyReport?.dat).toHaveProperty('to');
    });

    test('should capture history replaceState', async () => {
      await page.evaluate(() => {
        window.history.replaceState({}, '', '/replaced-page');
      });

      await page.waitForTimeout(1000);

      const routeReports = interceptor.getReportsByEventType(EventTypes.ROUTE);
      const historyReport = routeReports.find(
        report => report.dat?.st === RouteTypes.HISTORY
      );

      expect(historyReport).toBeDefined();
    });
  });
});