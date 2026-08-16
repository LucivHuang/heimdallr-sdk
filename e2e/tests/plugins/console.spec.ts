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
  CONSOLE: 7,
};

const ConsoleTypes = {
  LOG: 'log',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  ASSERT: 'assert',
};

test.describe('Console Plugin Tests', () => {
  let page: Page;
  let interceptor: ReportInterceptor;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    interceptor = new ReportInterceptor(page);
    await interceptor.start();
    await page.goto(`http://localhost:${SERVER_PORT}/demo`);
    await page.waitForLoadState('networkidle');
  });

  test('should capture console.log', async () => {
    interceptor.clear();

    await page.evaluate(() => console.log('test log message', 123));

    await page.waitForTimeout(1000);

    const consoleReports = interceptor.getReportsByEventType(EventTypes.CONSOLE);
    expect(consoleReports.length).toBeGreaterThan(0);

    const logReport = consoleReports[0];
    expect(logReport.dat).toHaveProperty('level');
    expect(logReport.dat.level).toBe(ConsoleTypes.LOG);
    expect(logReport.dat).toHaveProperty('args');
    expect(Array.isArray(logReport.dat.args)).toBe(true);
  });

  test('should capture console.error', async () => {
    interceptor.clear();

    await page.evaluate(() => console.error('test error message'));

    await page.waitForTimeout(1000);

    const consoleReports = interceptor.getReportsByEventType(EventTypes.CONSOLE);
    const errorReport = consoleReports.find(
      report => report.dat?.level === ConsoleTypes.ERROR
    );

    expect(errorReport).toBeDefined();
    expect(errorReport?.dat.level).toBe(ConsoleTypes.ERROR);
    expect(errorReport?.dat).toHaveProperty('st');
  });

  test('should capture console.warn', async () => {
    interceptor.clear();

    await page.evaluate(() => console.warn('test warn message'));

    await page.waitForTimeout(1000);

    const consoleReports = interceptor.getReportsByEventType(EventTypes.CONSOLE);
    const warnReport = consoleReports.find(
      report => report.dat?.level === ConsoleTypes.WARN
    );

    expect(warnReport).toBeDefined();
    expect(warnReport?.dat.level).toBe(ConsoleTypes.WARN);
    expect(warnReport?.dat).toHaveProperty('st');
  });

  test('should validate console report structure', async () => {
    interceptor.clear();

    await page.evaluate(() => console.log('structure test'));

    await page.waitForTimeout(1000);

    const consoleReports = interceptor.getReportsByEventType(EventTypes.CONSOLE);
    expect(consoleReports.length).toBeGreaterThan(0);

    const consoleReport = consoleReports[0];
    expect(() => interceptor.validateReportStructure(consoleReport)).not.toThrow();
  });
});
