import {
  Controller,
  Request,
  Post,
  Get,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ParseIntPipe,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import * as express from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.originalname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.certificatesService.createJob(file, userId);
  }

  @Get('jobs')
  @UseGuards(JwtAuthGuard)
  async getJobs(@Request() req: any) {
    console.log('GET /certificates/jobs - Fetching all jobs from DB');
    const userId = req.user.userId;
    const jobs = await this.certificatesService.getAllJobs(userId);
    console.log(`Found ${jobs.length} jobs in DB`);
    return jobs;
  }

  @Get('jobs/:id/download')
  @UseGuards(JwtAuthGuard)
  async downloadResults(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Res() res: express.Response,
  ) {
    const userId = req.user.userId;
    const buffer = await this.certificatesService.downloadResults(id, userId);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=job_${id}_results.xlsx`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Post('jobs/:id/open')
  @UseGuards(JwtAuthGuard)
  async openFile(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user.userId;
    return this.certificatesService.openFileInSystem(id, userId);
  }

  @Delete('jobs/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteJob(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user.userId;
    return this.certificatesService.deleteJob(id, userId);
  }
}
