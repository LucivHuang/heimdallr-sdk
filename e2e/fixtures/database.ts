import { PrismaClient } from '@prisma/client';

export class DatabaseHelper {
  private prisma: PrismaClient | null = null;

  async connect(): Promise<void> {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'mysql://root:root@localhost:3306/test_base',
        },
      },
    });

    await this.prisma.$connect();
    console.log('✓ Database connected');
  }

  async disconnect(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
      console.log('✓ Database disconnected');
    }
  }

  async cleanup(): Promise<void> {
    if (!this.prisma) {
      throw new Error('Database not connected');
    }

    console.log('Cleaning up test data...');

    // Clean up all test data - Log and Session don't have project relations in schema
    await this.prisma.log.deleteMany({});
    await this.prisma.session.deleteMany({});
    await this.prisma.breadCrumb.deleteMany({});
    await this.prisma.aIAnalysis.deleteMany({});
    await this.prisma.aIInsight.deleteMany({});

    await this.prisma.project.deleteMany({
      where: {
        name: {
          startsWith: 'test_',
        },
      },
    });

    console.log('✓ Test data cleaned up');
  }

  async seedTestData(): Promise<void> {
    if (!this.prisma) {
      throw new Error('Database not connected');
    }

    console.log('Seeding test data...');

    const projectId = 'test_mock_app_id';
    await this.prisma.project.upsert({
      where: { name: 'test_mock_app' },
      update: {},
      create: {
        id: projectId,
        name: 'test_mock_app',
        leader: 'E2E Test',
        desc: 'Test project for E2E tests',
        ctime: new Date(),
      },
    });

    console.log('✓ Test data seeded');
  }

  getClient(): PrismaClient {
    if (!this.prisma) {
      throw new Error('Database not connected');
    }
    return this.prisma;
  }
}

export const databaseHelper = new DatabaseHelper();
