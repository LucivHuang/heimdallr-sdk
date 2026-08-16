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
  DOM: 5,
};

test.describe('DOM Plugin Tests', () => {
  let page: Page;
  let interceptor: ReportInterceptor;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    interceptor = new ReportInterceptor(page);
    await interceptor.start();
    await page.goto(`http://localhost:${SERVER_PORT}/demo`);
    await page.waitForLoadState('networkidle');
  });

  test('should capture button click', async () => {
    interceptor.clear();

    await page.click('#xhrDom');

    await page.waitForTimeout(1000);

    const domReports = interceptor.getReportsByEventType(EventTypes.DOM);
    expect(domReports.length).toBeGreaterThan(0);

    const clickReport = domReports[0];
    expect(clickReport.dat).toHaveProperty('ele');
    expect(clickReport.dat.ele).toContain('button');
  });

  test('should capture click coordinates', async () => {
    interceptor.clear();

    const button = await page.locator('#xhrDom');
    await button.click();

    await page.waitForTimeout(1000);

    const domReports = interceptor.getReportsByEventType(EventTypes.DOM);
    const clickReport = domReports[0];

    expect(clickReport.dat).toHaveProperty('x');
    expect(clickReport.dat).toHaveProperty('y');
    expect(clickReport.dat.x).toBeGreaterThan(0);
    expect(clickReport.dat.y).toBeGreaterThan(0);
  });

  test('should capture element selector', async () => {
    interceptor.clear();

    await page.click('#fetchDom');

    await page.waitForTimeout(1000);

    const domReports = interceptor.getReportsByEventType(EventTypes.DOM);
    const clickReport = domReports[0];

    expect(clickReport.dat.ele).toBeDefined();
    expect(typeof clickReport.dat.ele).toBe('string');
    expect(clickReport.dat.ele.length).toBeGreaterThan(0);
  });

  test('should throttle rapid clicks', async () => {
    interceptor.clear();

    const button = await page.locator('#xhrDom');

    await button.click();
    await page.waitForTimeout(100);
    await button.click();
    await page.waitForTimeout(100);
    await button.click();

    await page.waitForTimeout(1000);

    const domReports = interceptor.getReportsByEventType(EventTypes.DOM);

    expect(domReports.length).toBeLessThan(3);
  });
});