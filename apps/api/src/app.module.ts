import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { GymsModule } from './gyms/gyms.module';
import { MembershipsModule } from './memberships/memberships.module';
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
import { ExercisesController } from './exercises/exercises.controller';
import { ExercisesService } from './exercises/exercises.service';

@Module({
  imports: [AuthModule, GymsModule, MembershipsModule],
  controllers: [
    UsersController,
    WorkoutsController,
    DietsController,
    AttendanceController,
    LeadsController,
    ExercisesController,
  ],
  providers: [
    PrismaService,
    UsersService,
    WorkoutsService,
    DietsService,
    AttendanceService,
    LeadsService,
    ExercisesService,
  ],
})
export class AppModule {}
