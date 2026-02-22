import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificateJob } from './entitys/certificate-job.entity';
import { DiamondReference } from './entitys/diamond-reference.entity';
import { Logger } from '@nestjs/common';

@Processor('certificate-processing')
export class CertificatesProcessor extends WorkerHost {
  private readonly logger = new Logger(CertificatesProcessor.name);

  constructor(
    @InjectRepository(CertificateJob)
    private jobRepository: Repository<CertificateJob>,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { jobId, certificates } = job.data;
    this.logger.log(`Starting processing for Job ID: ${jobId}`);

    // Fetch the job from DB
    const certJob = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!certJob) {
      this.logger.error(`Job ${jobId} not found in database`);
      return;
    }

    // Update status to PROCESSING
    certJob.status = 'PROCESSING';
    await this.jobRepository.save(certJob);

    const total = certificates.length;
    const baseUrl = `http://127.0.0.1:3001/mock-igi-api/verify`;

    // Process each certificate number using API flow
    for (const certNum of certificates) {
      try {
        // --- SIMULATING FUTURE 3RD PARTY API CALL ---
        const response = await fetch(`${baseUrl}/${String(certNum).trim()}`);

        if (response.ok) {
          const result = await response.json();
          this.logger.debug(
            `Certificate ${certNum} VERIFIED via API: ${result.data.shape}`,
          );
          certJob.successCount++;
        } else {
          this.logger.debug(
            `Certificate ${certNum} FAILED via API (Not Found)`,
          );
          certJob.failedCount++;
        }
      } catch (error) {
        this.logger.error(
          `API Connection Error for ${certNum}: ${error.message}`,
        );
        certJob.failedCount++;
      }

      // 2. Save progress to DB every stone (for real-time dashboard updates)
      await this.jobRepository.save(certJob);

      // 3. Simulated network delay (to mimic real world API response time)
      await new Promise((res) => setTimeout(res, 500));
    }

    // Mark as COMPLETED
    certJob.status = 'COMPLETED';
    await this.jobRepository.save(certJob);

    this.logger.log(`Finished processing for Job ID: ${jobId}`);
    return { success: true };
  }
}
