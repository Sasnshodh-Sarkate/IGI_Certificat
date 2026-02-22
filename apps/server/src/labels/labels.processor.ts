import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as fs from 'fs';
import * as path from 'path';

import * as QRCode from 'qrcode';
import * as Handlebars from 'handlebars';
import { StockLabelData } from './types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import * as pdf from 'html-pdf-node';

@Processor('labels')
export class LabelsProcessor extends WorkerHost {
  async process(job: Job<StockLabelData[], any, string>): Promise<any> {
    const stocks = job.data;
    if (!stocks || !Array.isArray(stocks)) {
      throw new Error('Invalid job data: Expected array of stocks');
    }

    // 1. Process Data & Generate QR Codes
    const processedData = await Promise.all(
      stocks.map(async (item: Partial<StockLabelData>) => {
        // Generate QR Code
        // Helper to ensure string
        const stockId = item.stock_id ? String(item.stock_id) : 'UNKNOWN';
        const qrCodeUrl = await QRCode.toDataURL(stockId, { margin: 0 });

        // Shape Short Code Map
        const shapeMap: Record<string, string> = {
          ROUND: 'RD',
          PRINCESS: 'PR',
          EMERALD: 'EM',
          OVAL: 'OV',
          PEAR: 'PS',
          MARQUISE: 'MQ',
          RADIANT: 'RA',
          HEART: 'HT',
          CUSHION: 'CU',
          ASHCHER: 'AS',
        };

        const shapeFull = item.shape ? String(item.shape).toUpperCase() : '';
        const shapeCode = shapeMap[shapeFull] || shapeFull; // Fallback to full name if no code

        // Determine cert status
        const isCert =
          item.type === 'CERT' ||
          item.type === 'Certified' ||
          (item.lab && item.cert_number);
        const nonCert = !isCert;

        return {
          ...item,
          stock_id: stockId.toUpperCase(),
          lab: item.lab ? String(item.lab).toUpperCase() : '',
          cut: item.cut ? String(item.cut).toUpperCase() : '',
          polish: item.polish ? String(item.polish).toUpperCase() : '',
          symmetry: item.symmetry ? String(item.symmetry).toUpperCase() : '',
          fluorescence: item.fluorescence
            ? String(item.fluorescence).toUpperCase()
            : '',
          shape: shapeCode, // Use the short code
          color: item.color ? String(item.color).toUpperCase() : '',
          clarity: item.clarity ? String(item.clarity).toUpperCase() : '',
          no_bgm: item.no_bgm ? String(item.no_bgm).toUpperCase() : '',
          weight: item.weight
            ? parseFloat(String(item.weight)).toFixed(2)
            : '0.00',
          no_of_stones: item.no_of_stones
            ? parseInt(String(item.no_of_stones))
            : 0,
          url: qrCodeUrl,
          isCert: true,
          nonCert,
          cert_number: item.cert_number
            ? String(item.cert_number).toUpperCase()
            : '',
          measurement: item.measurement
            ? String(item.measurement).toUpperCase()
            : '',
        };
      }),
    );

    // 2. Read HTML Template
    const possiblePaths = [
      path.join(process.cwd(), 'apps', 'server', 'public', 'stock-label.html'),
      path.join(process.cwd(), 'public', 'stock-label.html'),
      path.join(__dirname, '..', '..', 'public', 'stock-label.html'), // If compiled to dist/apps/server/src/...
    ];

    let htmlTemplate = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        htmlTemplate = fs.readFileSync(p, 'utf-8');
        break;
      }
    }

    if (!htmlTemplate) {
      throw new Error(
        `Template not found. Checked: ${possiblePaths.join(', ')}`,
      );
    }

    // 3. Compile Template with Handlebars
    const template = Handlebars.compile(htmlTemplate);
    // Wrap data in object as per template {{#each data}}
    const finalHtml = template({ data: processedData });

    // 4. Generate PDF
    const options = {
      // Removed format: 'A3' to allow width/height to define the page size exactly
      width: '70mm', // Adjusted to prevent right side cutoff
      height: '34mm',
      printBackground: true,
      // Remove default margins
      margin: {
        top: '0px',
        bottom: '0px',
        left: '0px',
        right: '0px',
      },
    };

    const file = { content: finalHtml };

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'generated', 'labels');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `labels-${Date.now()}.pdf`;
    const outputPath = path.join(outputDir, fileName);

    try {
      const pdfBuffer = await pdf.generatePdf(file, options);
      fs.writeFileSync(outputPath, pdfBuffer);

      // Return relative path/filename for download
      return {
        fileName,
        downloadUrl: `/labels/download/${fileName}`,
      };
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job ${job.id} has completed!`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    console.error(`Job ${job.id} has failed with ${err.message}`);
  }
}
