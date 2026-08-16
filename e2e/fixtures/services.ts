import { ChildProcess, spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { portManager, PortMapping } from '../helpers/port-manager';
import { waitForService } from '../helpers/service-health';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ServiceConfig {
  name: string;
  port: number;
  cwd: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  healthCheckPath: string;
}

export class ServiceOrchestrator {
  private processes: Map<string, ChildProcess> = new Map();
  private ports: PortMapping | null = null;

  async startAll(): Promise<void> {
    this.ports = await portManager.allocatePorts();

    const services = this.getServiceConfigs();

    console.log('Starting services...');
    console.log('Port allocation:', this.ports);

    for (const service of services) {
      await this.startService(service);
    }

    console.log('All services started successfully');
  }

  private getServiceConfigs(): ServiceConfig[] {
    if (!this.ports) {
      throw new Error('Ports not allocated');
    }

    const rootDir = path.resolve(__dirname, '../..');

    return [
      {
        name: 'server',
        port: this.ports.server,
        cwd: path.join(rootDir, 'playground/server'),
        command: 'pnpm',
        args: ['dev'],
        env: {
          DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/test_base',
          PORT: String(this.ports.server),
        },
        healthCheckPath: '/project/init',
      },
      {
        name: 'mock_app',
        port: this.ports.mockApp,
        cwd: path.join(rootDir, 'playground/mock_app'),
        command: 'pnpm',
        args: ['dev', '--port', String(this.ports.mockApp), '--host'],
        healthCheckPath: '/',
      },
      {
        name: 'manager',
        port: this.ports.manager,
        cwd: path.join(rootDir, 'playground/manager'),
        command: 'pnpm',
        args: ['dev', '--port', String(this.ports.manager), '--host'],
        healthCheckPath: '/',
      },
    ];
  }

  private async startService(config: ServiceConfig): Promise<void> {
    console.log(`Starting ${config.name} on port ${config.port}...`);

    const proc = spawn(config.command, config.args, {
      cwd: config.cwd,
      env: {
        ...process.env,
        ...config.env,
      },
      stdio: 'pipe',
      shell: true,
    });

    proc.stdout?.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`[${config.name}] ${output}`);
      }
    });

    proc.stderr?.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('DeprecationWarning')) {
        console.error(`[${config.name}] ${output}`);
      }
    });

    proc.on('error', (error) => {
      console.error(`[${config.name}] Process error:`, error);
    });

    proc.on('exit', (code, signal) => {
      console.log(`[${config.name}] Process exited with code ${code}, signal ${signal}`);
      this.processes.delete(config.name);
    });

    this.processes.set(config.name, proc);

    const healthCheckUrl = `http://localhost:${config.port}${config.healthCheckPath}`;
    await waitForService({ url: healthCheckUrl, timeout: 60000 });
  }

  async stopAll(): Promise<void> {
    console.log('Stopping all services...');

    for (const [name, proc] of this.processes.entries()) {
      console.log(`Stopping ${name}...`);

      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t'], { shell: true });
      } else {
        proc.kill('SIGTERM');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.processes.clear();
    console.log('All services stopped');
  }

  getPort(service: 'server' | 'mockApp' | 'manager'): number {
    if (!this.ports) {
      throw new Error('Ports not allocated');
    }
    return this.ports[service];
  }
}

export const serviceOrchestrator = new ServiceOrchestrator();
