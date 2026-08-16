import { Page, Route } from '@playwright/test';

export interface ReportData {
  lid: string;
  t: number;
  e: number;
  dat: any;
  b?: any[];
  sid?: string;
  uid?: string;
  p?: number;
  url?: string;
}

export class ReportInterceptor {
  private reports: ReportData[] = [];
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async start(): Promise<void> {
    await this.page.route('**/log/report', async (route: Route) => {
      const request = route.request();
      const postData = request.postData();
      const contentType = request.headers()['content-type'] || '';
      const method = request.method();

      try {
        let parsed: Record<string, any> = {};
        let hasData = false;

        if (postData) {
          hasData = true;
          if (contentType.includes('multipart/form-data')) {
            // 解析 multipart/form-data (sendBeacon)
            const boundaryMatch = contentType.match(/boundary=(.+)$/);
            if (boundaryMatch) {
              const boundary = boundaryMatch[1];
              parsed = this.parseMultipart(postData, boundary);
            }
          } else if (contentType.includes('application/x-www-form-urlencoded')) {
            // 解析 urlencoded
            const params = new URLSearchParams(postData);
            params.forEach((value, key) => {
              parsed[key] = value;
            });
          } else {
            // 兜底 JSON 解析
            parsed = JSON.parse(postData);
          }
        } else if (method === 'GET') {
          // GET 请求：数据在 query string 中 (page_crash_worker 使用 xhr GET 上报)
          const url = request.url();
          const queryIndex = url.indexOf('?');
          if (queryIndex !== -1) {
            hasData = true;
            const params = new URLSearchParams(url.substring(queryIndex + 1));
            params.forEach((value, key) => {
              parsed[key] = value;
            });
          }
        }

        if (hasData && Object.keys(parsed).length > 0) {
          // 二次解析：dat/b 可能是 JSON 字符串
          if (typeof parsed.dat === 'string') {
            try { parsed.dat = JSON.parse(parsed.dat); } catch (_) { /* keep raw */ }
          }
          if (typeof parsed.b === 'string') {
            try { parsed.b = JSON.parse(parsed.b); } catch (_) { /* keep raw */ }
          }

          // 数值字段转换
          const numericFields = ['e', 't', 'p'];
          for (const field of numericFields) {
            if (parsed[field] !== undefined && typeof parsed[field] === 'string') {
              parsed[field] = Number(parsed[field]);
            }
          }

          this.reports.push(parsed as ReportData);
          console.log(`[Report Intercepted] Event type: ${parsed.e}, LID: ${parsed.lid}`);
        }
      } catch (error) {
        console.error('Failed to parse report data:', error);
      }

      await route.continue();
    });
  }

  private parseMultipart(body: string, boundary: string): Record<string, any> {
    const result: Record<string, any> = {};
    const parts = body.split(`--${boundary}`);

    for (const part of parts) {
      if (part.includes('Content-Disposition')) {
        const nameMatch = part.match(/name="([^"]+)"/);
        if (!nameMatch) continue;

        const name = nameMatch[1];
        const valueStart = part.indexOf('\r\n\r\n');
        if (valueStart === -1) continue;

        let value = part.substring(valueStart + 4).trim();
        // 去掉末尾的 \r\n
        if (value.endsWith('\r\n')) {
          value = value.slice(0, -2);
        }

        result[name] = value;
      }
    }

    return result;
  }

  getReports(): ReportData[] {
    return this.reports;
  }

  getReportsByEventType(eventType: number): ReportData[] {
    return this.reports.filter(report => report.e === eventType);
  }

  getLastReport(): ReportData | undefined {
    return this.reports[this.reports.length - 1];
  }

  clear(): void {
    this.reports = [];
  }

  async waitForReport(
    predicate: (report: ReportData) => boolean,
    timeout: number = 5000
  ): Promise<ReportData> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const report = this.reports.find(predicate);
      if (report) {
        return report;
      }
      await this.page.waitForTimeout(100);
    }

    throw new Error('Timeout waiting for report matching predicate');
  }

  validateReportStructure(report: ReportData): void {
    if (!report.t) {
      throw new Error('Report missing required field: t');
    }
    if (report.e === undefined) {
      throw new Error('Report missing required field: e');
    }
    if (!report.dat) {
      throw new Error('Report missing required field: dat');
    }
  }
}
