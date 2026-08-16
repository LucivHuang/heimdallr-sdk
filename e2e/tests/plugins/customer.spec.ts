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
  CUSTOMER: 10,
};

test.describe('Customer Plugin Tests', () => {
  let page: Page;
  let interceptor: ReportInterceptor;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    interceptor = new ReportInterceptor(page);
    await interceptor.start();
    await page.goto(`http://localhost:${SERVER_PORT}/demo`);
    await page.waitForLoadState('networkidle');
  });

  test('should expose HEIMDALLR_REPORT API', async () => {
    const hasAPI = await page.evaluate(() => {
      return typeof (window as any).HEIMDALLR_REPORT === 'function';
    });

    expect(hasAPI).toBe(true);
  });

  test('should capture custom event via HEIMDALLR_REPORT', async () => {
    interceptor.clear();

    await page.evaluate(() => {
      (window as any).HEIMDALLR_REPORT('custom_event', {
        action: 'test_action',
        value: 123,
      });
    });

    await page.waitForTimeout(2000);

    const customerReports = interceptor.getReportsByEventType(EventTypes.CUSTOMER);
    expect(customerReports.length).toBeGreaterThan(0);

    const customReport = customerReports.find(
      report => report.dat?.st === 'custom_event'
    );

    expect(customReport).toBeDefined();
    expect(customReport?.dat?.data).toHaveProperty('action', 'test_action');
    expect(customReport?.dat?.data).toHaveProperty('value', 123);
  });

  test('should capture multiple custom events', async () => {
    interceptor.clear();

    await page.evaluate(() => {
      (window as any).HEIMDALLR_REPORT('event1', { id: 1 });
      (window as any).HEIMDALLR_REPORT('event2', { id: 2 });
      (window as any).HEIMDALLR_REPORT('event3', { id: 3 });
    });

    await page.waitForTimeout(2000);

    const customerReports = interceptor.getReportsByEventType(EventTypes.CUSTOMER);
    expect(customerReports.length).toBeGreaterThanOrEqual(3);
  });

  test('should handle custom event with complex data', async () => {
    interceptor.clear();

    await page.evaluate(() => {
      (window as any).HEIMDALLR_REPORT('complex_event', {
        user: {
          id: 123,
          name: 'Test User',
        },
        items: [1, 2, 3],
        metadata: {
          timestamp: Date.now(),
          source: 'test',
        },
      });
    });

    await page.waitForTimeout(2000);

    const customerReports = interceptor.getReportsByEventType(EventTypes.CUSTOMER);
    const complexReport = customerReports.find(
      report => report.dat?.st === 'complex_event'
    );

    expect(complexReport).toBeDefined();
    expect(complexReport?.dat?.data).toHaveProperty('user');
    expect(complexReport?.dat?.data).toHaveProperty('items');
    expect(complexReport?.dat?.data).toHaveProperty('metadata');
  });

  test('should validate customer report structure', async () => {
    interceptor.clear();

    await page.evaluate(() => {
      (window as any).HEIMDALLR_REPORT('test_event', { test: true });
    });

    await page.waitForTimeout(2000);

    const customerReports = interceptor.getReportsByEventType(EventTypes.CUSTOMER);
    const customerReport = customerReports[0];

    expect(() => interceptor.validateReportStructure(customerReport)).not.toThrow();
  });
});