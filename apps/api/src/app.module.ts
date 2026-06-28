import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { WorkoutsController } from './workouts/workouts.controller';
import { WorkoutsService } from './workouts/workouts.service';
import { DietsController } from './diets/diets.controller';
import { DietsService } from './diets/diets.service';
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';
import { LeadsController } from './leads/leads.controller';
import { LeadsService } from './leads/leads.service';

@Module({
  imports: [],
  controllers: [
    UsersController,
    WorkoutsController,
    DietsController,
    AttendanceController,
    LeadsController,
  ],
  providers: [
    PrismaService,
    UsersService,
    WorkoutsService,
    DietsService,
    AttendanceService,
    LeadsService,
  ],
})
export class AppModule {}
