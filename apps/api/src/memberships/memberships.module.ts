import { Module } from '@nestjs/common';
import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MembershipsController],
  providers: [MembershipsService, PrismaService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
