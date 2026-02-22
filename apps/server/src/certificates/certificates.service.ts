import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Delete
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CertificateJob } from './entitys/certificate-job.entity';
import { DiamondReference } from './entitys/diamond-reference.entity';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(CertificateJob)
    private jobRepository: Repository<CertificateJob>,
    @InjectRepository(DiamondReference)
    private diamondRefRepository: Repository<DiamondReference>,
    @InjectQueue('certificate-processing')
    private readonly certificateQueue: Queue,
  ) {}

  async openFileInSystem(jobId: number, userId: number) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, userId: userId },
    });
    if (!job) throw new NotFoundException('Job not found');
    if (!job.generatedFilePath)
      throw new BadRequestException('File not generated yet');

    const absolutePath = path.resolve(job.generatedFilePath);

    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundException('File not found on disk');
    }

    // Windows: start, macOS: open, Linux: xdg-open
    const command =
      process.platform === 'win32'
        ? 'start ""'
        : process.platform === 'darwin'
          ? 'open'
          : 'xdg-open';

    exec(`${command} "${absolutePath}"`, (error) => {
      if (error) {
        console.error(`Failed to open file: ${error.message}`);
      }
    });

    return { message: 'File open command sent', path: absolutePath };
  }

  async createJob(file: Express.Multer.File, userId: number) {
    // Check if uploads dir exists
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    // Seeding call removed.

    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = xlsx.utils.sheet_to_json(worksheet);

    const certificateNumbersArray = data
      .map(
        (row) =>
          row['certificate_number'] ||
          row['Certificate Number'] ||
          row['Report Number'] ||
          Object.values(row)[0],
      )
      .filter((val) => val);

    const certificateNumbersString = certificateNumbersArray.join(', ');

    const newJob = this.jobRepository.create({
      fileName: file.originalname,
      uploadedFilePath: file.path,
      totalStones: certificateNumbersArray.length,
      successCount: 0,
      failedCount: 0,
      userId: userId,
      status: 'PENDING',
      certificateNumbers: certificateNumbersString,
    });

    const savedJob = await this.jobRepository.save(newJob);

    await this.certificateQueue.add('process-certificates', {
      jobId: savedJob.id,
      certificates: certificateNumbersArray,
    });

    return savedJob;
  }

  // Seeding logic removed as per request to rely on persistent database state.

  async getAllJobs(userId: number) {
    return this.jobRepository.find({
      where: { userId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async downloadResults(jobId: number, userId: number) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, userId: userId },
    });
    if (!job) throw new NotFoundException('Job not found');

    if (job.successCount === 0) {
      throw new BadRequestException(
        'No successful records found to generate report',
      );
    }

    // If file already exists, return it
    if (job.generatedFilePath && fs.existsSync(job.generatedFilePath)) {
      return fs.readFileSync(job.generatedFilePath);
    }

    const certNumbers = job.certificateNumbers.split(', ').map((n) => n.trim());

    // Fetch all reference data at once for speed
    const referenceData = await this.diamondRefRepository.find({
      where: { certificateNumber: In(certNumbers) },
    });

    // Create a map for easy lookup
    const diamondMap = new Map(
      referenceData.map((d) => [d.certificateNumber, d]),
    );

    // Format data for Excel - ONLY include successful diamonds
    const excelData = certNumbers
      .map((certNum) => diamondMap.get(certNum))
      .filter((d) => d !== undefined) // Remove failures
      .map((d) => {
        return {
          'Certificate Number': d.certificateNumber,
          Status: 'VERIFIED',
          Type: 'NATURAL DIAMOND',
          Shape: d.shape,
          Carat: d.carat,
          Color: d.color,
          Clarity: d.clarity,
          Cut: d.cut,
          Polish: d.polish,
          Symmetry: d.symmetry,
          Fluorescence: d.fluorescence,
          Measurement: d.measurement,
          Location: d.location,
          'IGI Report URL': `https://www.igi.org/reports/verify-your-report?r=${d.certificateNumber}`,
          'Created At': d.createdAt,
          'Updated At': d.updatedAt,
          stock_ID: d.stock_ID,
        };
      });

    // Create a new workbook
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(excelData);

    // Add some styling (Auto-width column hint)
    const wscols = [
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 25 },
      { wch: 15 },
      { wch: 50 },
      { wch: 25 },
    ];
    ws['!cols'] = wscols;

    xlsx.utils.book_append_sheet(wb, ws, 'Verification Results');

    // Save to file system
    const generatedDir = path.join(process.cwd(), 'generated');
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }
    const fileName = `job_${jobId}_results.xlsx`;
    const filePath = path.join(generatedDir, fileName);
    xlsx.writeFile(wb, filePath);

    // Update job with generated path
    job.generatedFilePath = filePath;
    await this.jobRepository.save(job);

    // Return as buffer
    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async deleteJob(jobId: number, userId: number) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, userId: userId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (job.uploadedFilePath && fs.existsSync(job.uploadedFilePath)) {
      try {
        fs.unlinkSync(job.uploadedFilePath);
      } catch (err) {
        console.error(`Failed to delete uploaded file: ${err.message}`);
      }
    }

    if (job.generatedFilePath && fs.existsSync(job.generatedFilePath)) {
      try {
        fs.unlinkSync(job.generatedFilePath);
      } catch (err) {
        console.error(`Failed to delete genrated file: ${err.message}`);
      }
    }

    await this.jobRepository.remove(job);

    return { message: 'Job and associated files deleted successfully' };
  }
}
