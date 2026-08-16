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
  ERROR: 2,
  API: 4,
  DOM: 5,
  CUSTOMER: 10,
};

test.describe('Demo Page Integration Tests', () => {
  let page: Page;
  let interceptor: ReportInterceptor;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    interceptor = new ReportInterceptor(page);
    await interceptor.start();
    await page.goto(`http://localhost:${SERVER_PORT}/demo`);
    await page.waitForLoadState('networkidle');
  });

  test('should load IIFE bundle', async () => {
    const hasSDK = await page.evaluate(() => {
      return typeof (window as any).HEIMDALLR_REPORT === 'function';
    });

    expect(hasSDK).toBe(true);
  });

  test('should test TypeError button', async () => {
    interceptor.clear();

    await page.click('#TypeError');
    await page.waitForTimeout(2000);

    const errorReports = interceptor.getReportsByEventType(EventTypes.ERROR);
    expect(errorReports.length).toBeGreaterThan(0);
  });

  test('should test ReferenceError button', async () => {
    interceptor.clear();

    await page.click('#ReferenceError');
    await page.waitForTimeout(2000);

    const errorReports = interceptor.getReportsByEventType(EventTypes.ERROR);
    expect(errorReports.length).toBeGreaterThan(0);
  });

  test('should test Promise Error button', async () => {
    interceptor.clear();

    await page.click('#promiseError');
    await page.waitForTimeout(2000);

    const errorReports = interceptor.getReportsByEventType(EventTypes.ERROR);
    expect(errorReports.length).toBeGreaterThan(0);
  });

  test('should test XHR request button', async () => {
    interceptor.clear();

    await page.click('#xhrDom');
    await page.waitForTimeout(5000);

    const apiReports = interceptor.getReportsByEventType(EventTypes.API);
    expect(apiReports.length).toBeGreaterThan(0);
  });

  test('should test fetch request button', async () => {
    interceptor.clear();

    await page.click('#fetchDom');
    await page.waitForTimeout(5000);

    const apiReports = interceptor.getReportsByEventType(EventTypes.API);
    expect(apiReports.length).toBeGreaterThan(0);
  });

  test('should test custom error button', async () => {
    interceptor.clear();

    await page.click('#customer');
    await page.waitForTimeout(2000);

    const customerReports = interceptor.getReportsByEventType(EventTypes.CUSTOMER);
    expect(customerReports.length).toBeGreaterThan(0);
  });

  test('should track all button clicks', async () => {
    interceptor.clear();

    const buttons = await page.locator('button').all();

    for (const button of buttons.slice(0, 3)) {
      await button.click();
      await page.waitForTimeout(500);
    }

    const domReports = interceptor.getReportsByEventType(EventTypes.DOM);
    expect(domReports.length).toBeGreaterThan(0);
  });

  test('should verify all reports have valid structure', async () => {
    interceptor.clear();

    await page.click('#xhrDom');
    await page.waitForTimeout(2000);

    const reports = interceptor.getReports();
    expect(reports.length).toBeGreaterThan(0);

    reports.forEach(report => {
      expect(() => interceptor.validateReportStructure(report)).not.toThrow();
    });
  });
});
