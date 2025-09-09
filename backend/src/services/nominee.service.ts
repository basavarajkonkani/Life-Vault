import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nominee } from '../entities/nominee.entity';
import { User } from '../entities/user.entity';
import { CreateNomineeDto, UpdateNomineeDto } from '../dto/nominee.dto';
import { AuditService } from './audit.service';
import { AuditAction, AuditResource } from '../entities/audit-log.entity';

@Injectable()
export class NomineeService {
  constructor(
    @InjectRepository(Nominee)
    private readonly nomineeRepository: Repository<Nominee>,
    private readonly auditService: AuditService,
  ) {}

  async create(createNomineeDto: CreateNomineeDto, user: User): Promise<Nominee> {
    // Check if total allocation percentage doesn't exceed 100%
    const existingNominees = await this.nomineeRepository.find({
      where: { userId: user.id },
    });

    const totalAllocation = existingNominees.reduce(
      (sum, nominee) => sum + Number(nominee.allocationPercentage),
      0,
    );

    if (totalAllocation + createNomineeDto.allocationPercentage > 100) {
      throw new BadRequestException(
        `Total allocation percentage cannot exceed 100%. Current total: ${totalAllocation}%`,
      );
    }

    const nominee = this.nomineeRepository.create({
      ...createNomineeDto,
      userId: user.id,
    });

    const savedNominee = await this.nomineeRepository.save(nominee);

    // Log the action
    await this.auditService.log(
      AuditAction.CREATE,
      AuditResource.NOMINEE,
      user.id,
      savedNominee.id,
      `Nominee created: ${savedNominee.name} (${savedNominee.relation})`,
      { name: savedNominee.name, relation: savedNominee.relation },
    );

    return savedNominee;
  }

  async findAll(user: User): Promise<Nominee[]> {
    return this.nomineeRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User): Promise<Nominee> {
    const nominee = await this.nomineeRepository.findOne({
      where: { id, userId: user.id },
    });

    if (!nominee) {
      throw new NotFoundException('Nominee not found');
    }

    return nominee;
  }

  async update(id: string, updateNomineeDto: UpdateNomineeDto, user: User): Promise<Nominee> {
    const nominee = await this.findOne(id, user);

    // Check allocation percentage if being updated
    if (updateNomineeDto.allocationPercentage !== undefined) {
      const existingNominees = await this.nomineeRepository.find({
        where: { userId: user.id },
      });

      const totalAllocation = existingNominees
        .filter(n => n.id !== id)
        .reduce((sum, n) => sum + Number(n.allocationPercentage), 0);

      if (totalAllocation + updateNomineeDto.allocationPercentage > 100) {
        throw new BadRequestException(
          `Total allocation percentage cannot exceed 100%. Current total: ${totalAllocation}%`,
        );
      }
    }

    Object.assign(nominee, updateNomineeDto);
    const updatedNominee = await this.nomineeRepository.save(nominee);

    // Log the action
    await this.auditService.log(
      AuditAction.UPDATE,
      AuditResource.NOMINEE,
      user.id,
      updatedNominee.id,
      `Nominee updated: ${updatedNominee.name} (${updatedNominee.relation})`,
      { name: updatedNominee.name, relation: updatedNominee.relation },
    );

    return updatedNominee;
  }

  async remove(id: string, user: User): Promise<void> {
    const nominee = await this.findOne(id, user);

    await this.nomineeRepository.remove(nominee);

    // Log the action
    await this.auditService.log(
      AuditAction.DELETE,
      AuditResource.NOMINEE,
      user.id,
      id,
      `Nominee deleted: ${nominee.name} (${nominee.relation})`,
      { name: nominee.name, relation: nominee.relation },
    );
  }

  async getDashboardStats(user: User): Promise<{
    totalNominees: number;
    totalAllocation: number;
    nomineeDistribution: Array<{ name: string; allocation: number; amount: number }>;
  }> {
    const nominees = await this.findAll(user);
    
    const totalNominees = nominees.length;
    const totalAllocation = nominees.reduce(
      (sum, nominee) => sum + Number(nominee.allocationPercentage),
      0,
    );

    // For demo purposes, we'll use a fixed total value
    // In a real app, this would come from the user's total asset value
    const totalAssetValue = 2500000; // This should be calculated from assets

    const nomineeDistribution = nominees.map(nominee => ({
      name: `${nominee.name} (${nominee.relation})`,
      allocation: Number(nominee.allocationPercentage),
      amount: (Number(nominee.allocationPercentage) / 100) * totalAssetValue,
    }));

    return {
      totalNominees,
      totalAllocation,
      nomineeDistribution,
    };
  }
}
