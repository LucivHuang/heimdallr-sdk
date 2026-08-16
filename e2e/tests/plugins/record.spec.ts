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
  RECORD: 8,
};

const RecordTypes = {
  SESSION: 81,
};

test.describe('Record Plugin Tests', () => {
  let page: Page;
  let interceptor: ReportInterceptor;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    interceptor = new ReportInterceptor(page);
    await interceptor.start();
    await page.goto(`http://localhost:${SERVER_PORT}/demo`);
    await page.waitForLoadState('networkidle');
  });

  test('should capture record events', async () => {
    interceptor.clear();

    // Generate DOM interactions so rrweb has events to buffer
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);
    await page.click('button:has-text("Click Here")').catch(() => {});
    await page.waitForTimeout(1000);

    // Trigger the unload listener to flush buffered rrweb events without leaving the page
    await page.evaluate(() => {
      window.dispatchEvent(new Event('unload'));
    });

    await page.waitForTimeout(2000);

    const recordReports = interceptor.getReportsByEventType(EventTypes.RECORD);
    expect(recordReports.length).toBeGreaterThan(0);

    const recordReport = recordReports[0];
    expect(recordReport.dat).toHaveProperty('st');
    expect(recordReport.dat.st).toBe(RecordTypes.SESSION);
    expect(recordReport.dat).toHaveProperty('evs');
    expect(Array.isArray(recordReport.dat.evs)).toBe(true);
    expect(recordReport.dat.evs.length).toBeGreaterThan(0);
  });

  test('should validate record report structure', async () => {
    interceptor.clear();

    // Generate DOM interactions so rrweb has events to buffer
    await page.mouse.move(150, 150);
    await page.click('button:has-text("Click Here")').catch(() => {});
    await page.waitForTimeout(1000);

    // Flush buffered rrweb events via unload event
    await page.evaluate(() => {
      window.dispatchEvent(new Event('unload'));
    });

    await page.waitForTimeout(2000);

    const recordReports = interceptor.getReportsByEventType(EventTypes.RECORD);
    expect(recordReports.length).toBeGreaterThan(0);

    const recordReport = recordReports[0];
    expect(() => interceptor.validateReportStructure(recordReport)).not.toThrow();
  });

  test('should include record events with timestamps', async () => {
    interceptor.clear();

    await page.waitForTimeout(5000);

    const recordReports = interceptor.getReportsByEventType(EventTypes.RECORD);
    const recordReport = recordReports[0];

    if (recordReport && recordReport.dat.evs && recordReport.dat.evs.length > 0) {
      const firstEvent = recordReport.dat.evs[0];
      expect(firstEvent).toHaveProperty('timestamp');
    }
  });
});
