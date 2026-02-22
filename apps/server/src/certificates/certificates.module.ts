import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CertificateJob } from './entitys/certificate-job.entity';
import { DiamondReference } from './entitys/diamond-reference.entity';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { MockIgiController } from './mock-igi.controller';
import { CertificatesProcessor } from './certificates.processor';
import { SeederService } from '../seeder.service';

import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([CertificateJob, DiamondReference]),
    BullModule.registerQueue({
      name: 'certificate-processing',
    }),
  ],
  controllers: [CertificatesController, MockIgiController],
  providers: [CertificatesService, CertificatesProcessor, SeederService],
})
export class CertificatesModule { }
