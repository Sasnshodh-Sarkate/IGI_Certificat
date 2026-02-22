import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiamondReference } from './entitys/diamond-reference.entity';

@Controller('mock-igi-api')
export class MockIgiController {
  constructor(
    @InjectRepository(DiamondReference)
    private diamondRepo: Repository<DiamondReference>,
  ) {}

  @Get('verify/:certNumber')
  async verifyCertificate(@Param('certNumber') certNumber: string) {
    // Simulate a real API lookup
    const diamond = await this.diamondRepo.findOne({
      where: { certificateNumber: certNumber },
    });

    if (!diamond) {
      throw new NotFoundException({
        success: false,
        message: 'Certificate not found in IGI database',
      });
    }

    return {
      success: true,
      data: {
        id: diamond.id,
        certificateNumber: diamond.certificateNumber,
        shape: diamond.shape,
        carat: diamond.carat,
        color: diamond.color,
        clarity: diamond.clarity,
        cut: diamond.cut,
        polish: diamond.polish,
        symmetry: diamond.symmetry,
        fluorescence: diamond.fluorescence,
        measurement: diamond.measurement,
        location: diamond.location,
        fullData: JSON.stringify({ origin: 'LAB_GROWN', lab: 'IGI' }), // Mock fullData as requested string
        stock_ID: diamond.stock_ID,
        createdAt: diamond.createdAt,
        updatedAt: diamond.updatedAt,
      },
    };
  }
}
