import { Module } from '@nestjs/common';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';
import { LabelsProcessor } from './labels.processor';
import { BullModule } from '@nestjs/bullmq';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
// We might need to import entities if we were using them, but we are not for this specific feature as per request.

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule, // <--- Add this
    BullModule.registerQueue({
      name: 'labels',
    }),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [LabelsController],
  providers: [LabelsService, LabelsProcessor],
})
export class LabelsModule {}
