import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const portfinder = require('portfinder');

export interface PortMapping {
  server: number;
  mockApp: number;
  manager: number;
}

const PREFERRED_PORTS = {
  server: 8001,
  mockApp: 5173,
  manager: 5174,
};

export class PortManager {
  private ports: PortMapping | null = null;

  async allocatePorts(): Promise<PortMapping> {
    if (this.ports) {
      return this.ports;
    }

    portfinder.basePort = 7000;

    const serverPort = await portfinder.getPortPromise({ port: PREFERRED_PORTS.server });
    const mockAppPort = await portfinder.getPortPromise({ port: PREFERRED_PORTS.mockApp });
    const managerPort = await portfinder.getPortPromise({ port: PREFERRED_PORTS.manager });

    this.ports = {
      server: serverPort,
      mockApp: mockAppPort,
      manager: managerPort,
    };

    return this.ports;
  }

  getPorts(): PortMapping {
    if (!this.ports) {
      throw new Error('Ports not allocated. Call allocatePorts() first.');
    }
    return this.ports;
  }

  reset(): void {
    this.ports = null;
  }
}

export const portManager = new PortManager();
