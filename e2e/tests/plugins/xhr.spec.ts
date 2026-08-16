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
  XHR: 41,
};

test.describe('XHR Plugin Tests', () => {
  let page: Page;
  let interceptor: ReportInterceptor;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    interceptor = new ReportInterceptor(page);
    await interceptor.start();
    await page.goto(`http://localhost:${SERVER_PORT}/demo`);
    await page.waitForLoadState('networkidle');
  });

  test('should capture XHR GET request', async () => {
    interceptor.clear();

    await page.click('#xhrDom');

    await page.waitForTimeout(5000);

    const apiReports = interceptor.getReportsByEventType(EventTypes.API);
    expect(apiReports.length).toBeGreaterThan(0);

    const xhrReport = apiReports.find(
      report => report.dat?.st === HttpTypes.XHR
    );
    expect(xhrReport).toBeDefined();
    expect(xhrReport?.dat).toHaveProperty('req');
    expect(xhrReport?.dat?.req).toHaveProperty('m');
    expect(xhrReport?.dat?.req).toHaveProperty('url');
    expect(xhrReport?.dat?.res).toHaveProperty('sta');
    expect(xhrReport?.dat).toHaveProperty('et');
  });

  test('should capture XHR status codes', async () => {
    interceptor.clear();

    await page.evaluate(() => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/test');
      xhr.send();
    });

    await page.waitForTimeout(5000);

    const apiReports = interceptor.getReportsByEventType(EventTypes.API);
    const xhrReport = apiReports.find(
      report => report.dat?.st === HttpTypes.XHR && report.dat?.req?.url?.includes('/test')
    );

    expect(xhrReport).toBeDefined();
    expect(xhrReport?.dat?.res?.sta).toBe(200);
  });

  test('should track XHR timing', async () => {
    interceptor.clear();

    await page.click('#xhrDom');
    await page.waitForTimeout(5000);

    const apiReports = interceptor.getReportsByEventType(EventTypes.API);
    const xhrReport = apiReports.find(
      report => report.dat?.st === HttpTypes.XHR
    );

    expect(xhrReport?.dat?.et).toBeGreaterThan(0);
  });
});