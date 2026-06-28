import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@maximus/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Successfully connected to the database.');
    } catch (error) {
      console.error('Database connection failed. Please check your DATABASE_URL in .env.');
      console.error(error.message || error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
