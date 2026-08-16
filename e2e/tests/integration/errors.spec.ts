import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { ReportInterceptor } from '../../helpers/report-interceptor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getPort(service: string): number {
  const ports = JSON.parse(readFileSync(path.join(__dirname, '../../.test-ports.json'), 'utf-8'));
  return ports[service];
}

const SERVER_PORT = getPort('server');

const EventTypes = {
  ERROR: 2,
};

// BrowserErrorTypes sub-types (clients/browser/src/types: CODEERROR=21, RESOURCEERROR=22, UNHANDLEDREJECTION=23)
const ErrorSubTypes = {
  CODEERROR: 21,
  RESOURCEERROR: 22,
  UNHANDLEDREJECTION: 23,
};

test.describe('Error Plugin Tests', () => {
  let page: Page;
  let interceptor: ReportInterceptor;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    interceptor = new ReportInterceptor(page);
    await interceptor.start();
    await page.goto(`http://localhost:${SERVER_PORT}/demo`);
    await page.waitForLoadState('networkidle');
  });

  test('should capture TypeError', async () => {
    interceptor.clear();

    await page.click('#TypeError');

    await page.waitForTimeout(2000);

    const errorReports = interceptor.getReportsByEventType(EventTypes.ERROR);
    expect(errorReports.length).toBeGreaterThan(0);

    const typeError = errorReports.find(
      report => report.dat?.msg?.includes('TypeError')
    );

    expect(typeError).toBeDefined();
    expect(typeError?.dat).toHaveProperty('msg');
    expect(typeError?.dat).toHaveProperty('stk');
  });

  test('should capture ReferenceError', async () => {
    interceptor.clear();

    await page.click('#ReferenceError');

    await page.waitForTimeout(2000);

    const errorReports = interceptor.getReportsByEventType(EventTypes.ERROR);
    const refError = errorReports.find(
      report => report.dat?.msg?.includes('ReferenceError')
    );

    expect(refError).toBeDefined();
    expect(refError?.dat).toHaveProperty('msg');
    expect(refError?.dat).toHaveProperty('stk');
  });

  test('should capture Promise rejection', async () => {
    interceptor.clear();

    await page.click('#promiseError');

    await page.waitForTimeout(2000);

    const errorReports = interceptor.getReportsByEventType(EventTypes.ERROR);
    const promiseError = errorReports.find(
      report => report.dat?.st === ErrorSubTypes.UNHANDLEDREJECTION
    );

    expect(promiseError).toBeDefined();
  });

  test('should capture error stack trace', async () => {
    interceptor.clear();

    await page.click('#TypeError');

    await page.waitForTimeout(2000);

    const errorReports = interceptor.getReportsByEventType(EventTypes.ERROR);
    const errorReport = errorReports.find(
      report => report.dat?.st === ErrorSubTypes.CODEERROR
    );

    // jsError plugin emits `stk` as an array of frame objects ({ lin, col, file, fn }), not a string
    expect(errorReport?.dat?.stk).toBeDefined();
    expect(Array.isArray(errorReport?.dat?.stk)).toBe(true);
    expect(errorReport?.dat?.stk.length).toBeGreaterThan(0);
    expect(errorReport?.dat?.stk[0]).toHaveProperty('file');
  });

  test('should validate error report structure', async () => {
    interceptor.clear();

    await page.click('#TypeError');

    await page.waitForTimeout(2000);

    const errorReports = interceptor.getReportsByEventType(EventTypes.ERROR);
    const errorReport = errorReports[0];

    expect(() => interceptor.validateReportStructure(errorReport)).not.toThrow();
  });
});
