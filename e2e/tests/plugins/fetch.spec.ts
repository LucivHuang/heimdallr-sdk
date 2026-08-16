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

const EventTypes = {
  API: 4,
};

const HttpTypes = {
  FETCH: 42,
};

test.describe('Fetch Plugin Tests', () => {
  let page: Page;
  let interceptor: ReportInterceptor;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    interceptor = new ReportInterceptor(page);
    await interceptor.start();
    await page.goto(`http://localhost:${SERVER_PORT}/demo`);
    await page.waitForLoadState('networkidle');
  });

  test('should capture fetch GET request', async () => {
    interceptor.clear();

    await page.click('#fetchDom');

    await page.waitForTimeout(5000);

    const apiReports = interceptor.getReportsByEventType(EventTypes.API);
    expect(apiReports.length).toBeGreaterThan(0);

    const fetchReport = apiReports.find(
      report => report.dat?.st === HttpTypes.FETCH
    );
    expect(fetchReport).toBeDefined();
    expect(fetchReport?.dat).toHaveProperty('req');
    expect(fetchReport?.dat?.req).toHaveProperty('m');
    expect(fetchReport?.dat?.req).toHaveProperty('url');
    expect(fetchReport?.dat?.res).toHaveProperty('sta');
    expect(fetchReport?.dat).toHaveProperty('et');
  });

  test('should capture fetch POST request', async () => {
    interceptor.clear();

    await page.evaluate(() => {
      fetch('/project/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test' }),
      });
    });

    await page.waitForTimeout(2000);

    const apiReports = interceptor.getReportsByEventType(EventTypes.API);
    const fetchReport = apiReports.find(
      report =>
        report.dat?.st === HttpTypes.FETCH &&
        report.dat?.req?.m === 'POST' &&
        report.dat?.req?.url?.includes('/project/init')
    );

    expect(fetchReport).toBeDefined();
    expect(fetchReport?.dat?.req?.m).toBe('POST');
  });

  test('should track fetch timing', async () => {
    interceptor.clear();

    await page.click('#fetchDom');
    await page.waitForTimeout(5000);

    const apiReports = interceptor.getReportsByEventType(EventTypes.API);
    const fetchReport = apiReports.find(
      report => report.dat?.st === HttpTypes.FETCH
    );

    expect(fetchReport?.dat?.et).toBeGreaterThan(0);
  });

  test('should capture fetch status codes', async () => {
    interceptor.clear();

    await page.evaluate(() => {
      fetch('/test');
    });

    await page.waitForTimeout(5000);

    const apiReports = interceptor.getReportsByEventType(EventTypes.API);
    const fetchReport = apiReports.find(
      report => report.dat?.st === HttpTypes.FETCH && report.dat?.req?.url?.includes('/test')
    );

    expect(fetchReport).toBeDefined();
    expect(fetchReport?.dat?.res?.sta).toBe(200);
  });
});
