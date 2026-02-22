import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { StockLabelData } from './types';



@Injectable()
export class LabelsService {
  constructor(@InjectQueue('labels') private labelsQueue: Queue) { }

  async processExcelAndQueue(file: Express.Multer.File) {
    if (!file) throw new Error('File not provided');

    // Parse Excel file from buffer (or disk)
    let workbook;
    if (file.path) {
      workbook = xlsx.readFile(file.path);
      // Clean up the uploaded file to prevent disk clutter
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('Failed to delete uploaded file:', err);
      }
    } else {
      workbook = xlsx.read(file.buffer, { type: 'buffer' });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get JSON data
    const rawData = xlsx.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' }); // defval to avoid undefined for empty cells

    if (!rawData || rawData.length === 0) {
      throw new Error('No data found in Excel file');
    }

    // Normalize keys to ensure we can find "Stock ID", "Stock_Id", "stock id", etc.
    const normalizedData: Partial<StockLabelData>[] = rawData.map((row) => {
      const newRow: Record<string, any> = {};
      Object.keys(row).forEach((key) => {
        // Convert "Stock ID" -> "stock_id", "No. of Stones" -> "no_of_stones"
        const normalizedKey = key.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        newRow[normalizedKey] = row[key];

        // Manual mapping for common variations if regex isn't enough
        if (normalizedKey === 'stock_no' || normalizedKey === 'stock_code') newRow['stock_id'] = row[key];
        if (normalizedKey === 'cts' || normalizedKey === 'carat' || normalizedKey === 'weight_cts') newRow['weight'] = row[key];
        if (normalizedKey === 'stone' || normalizedKey === 'stones' || normalizedKey === 'no_of_stone') newRow['no_of_stones'] = row[key];
        if (normalizedKey === 'report_no' || normalizedKey === 'report_number' || normalizedKey === 'certificate_number' || normalizedKey === 'cert_no') newRow['cert_number'] = row[key];
        if (normalizedKey === 'certificate_no') newRow['cert_number'] = row[key];
        if (normalizedKey === 'measurements') newRow['measurement'] = row[key];
      });
      return newRow as Partial<StockLabelData>;
    });

    // Add job to Queue
    // We pass the normalized data array directly to the job
    const job = await this.labelsQueue.add('generate-labels', normalizedData, {
      removeOnComplete: false, // Keep completed jobs so we can fetch result
      removeOnFail: false, // Keep failed jobs for debugging
    });

    return {
      message: 'Processing started',
      jobId: job.id,
      count: rawData.length,
    };
  }

  async getJobStatus(jobId: string) {
    const job = await this.labelsQueue.getJob(jobId);

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return {
      id: job.id,
      state,
      progress,
      result, // This will contain the download URL or path when completed
      failedReason,
    };
  }
}
