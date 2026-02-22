import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
  NotFoundException,
  BadRequestException,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LabelsService } from './labels.service';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('labels')
@UseGuards(JwtAuthGuard)
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.labelsService.processExcelAndQueue(file);
  }

  @Get('status/:jobId')
  async getStatus(@Param('jobId') jobId: string) {
    return this.labelsService.getJobStatus(jobId);
  }

  @Get('download/:fileName')
  async downloadFile(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    const filePath = path.join(process.cwd(), 'generated', 'labels', fileName);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  }
}
