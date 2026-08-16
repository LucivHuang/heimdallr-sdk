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
  VUE: 9,
};

const VueTypes = {
  ERROR: 91,
};

test.describe('Vue Plugin Tests', () => {
  let page: Page;
  let interceptor: ReportInterceptor;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    interceptor = new ReportInterceptor(page);
    await interceptor.start();
    await page.goto(`http://localhost:${SERVER_PORT}/demo`);
    await page.waitForLoadState('networkidle');
  });

  test('should capture Vue error', async () => {
    interceptor.clear();

    await page.evaluate(() => {
      const app = (window as any).__VUE_APP__;
      if (app && app.config && app.config.errorHandler) {
        app.config.errorHandler(
          new Error('Test Vue error'),
          {} as any,
          'mounted'
        );
      }
    });

    await page.waitForTimeout(2000);

    const vueReports = interceptor.getReportsByEventType(EventTypes.VUE);
    expect(vueReports.length).toBeGreaterThan(0);

    const vueReport = vueReports[0];
    expect(vueReport.dat).toHaveProperty('msg');
    expect(vueReport.dat).toHaveProperty('st');
    expect(vueReport.dat.st).toBe(VueTypes.ERROR);
  });

  test('should capture Vue error with hook info', async () => {
    interceptor.clear();

    await page.evaluate(() => {
      const app = (window as any).__VUE_APP__;
      if (app && app.config && app.config.errorHandler) {
        app.config.errorHandler(
          new Error('Vue lifecycle error'),
          {} as any,
          'created'
        );
      }
    });

    await page.waitForTimeout(2000);

    const vueReports = interceptor.getReportsByEventType(EventTypes.VUE);
    expect(vueReports.length).toBeGreaterThan(0);

    const vueReport = vueReports[0];
    expect(vueReport.dat).toHaveProperty('hook');
    expect(vueReport.dat).toHaveProperty('stk');
    expect(vueReport.dat).toHaveProperty('name');
  });

  test('should validate Vue report structure', async () => {
    interceptor.clear();

    await page.evaluate(() => {
      const app = (window as any).__VUE_APP__;
      if (app && app.config && app.config.errorHandler) {
        app.config.errorHandler(
          new Error('Structure test error'),
          {} as any,
          'updated'
        );
      }
    });

    await page.waitForTimeout(2000);

    const vueReports = interceptor.getReportsByEventType(EventTypes.VUE);
    expect(vueReports.length).toBeGreaterThan(0);

    const vueReport = vueReports[0];
    expect(() => interceptor.validateReportStructure(vueReport)).not.toThrow();
  });
});