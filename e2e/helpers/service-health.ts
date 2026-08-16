import http from 'http';

export interface HealthCheckOptions {
  url: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export async function waitForService(options: HealthCheckOptions): Promise<void> {
  const {
    url,
    timeout = 30000,
    retries = 30,
    retryDelay = 1000,
  } = options;

  const startTime = Date.now();

  for (let attempt = 1; attempt <= retries; attempt++) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Service health check timeout after ${timeout}ms: ${url}`);
    }

    try {
      await checkHealth(url);
      console.log(`✓ Service healthy: ${url}`);
      return;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Service health check failed after ${retries} attempts: ${url}`);
      }
      await sleep(retryDelay);
    }
  }
}

function checkHealth(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
        resolve();
      } else {
        reject(new Error(`Health check failed with status ${res.statusCode}`));
      }
      res.resume();
    });

    request.on('error', reject);
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Health check request timeout'));
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
