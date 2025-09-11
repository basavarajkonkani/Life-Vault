import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { CreateNomineeDto, UpdateNomineeDto } from '../dto/nominee.dto';

@Injectable()
export class NomineeService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(createNomineeDto: CreateNomineeDto, userId: string): Promise<any> {
    const nomineeData = {
      user_id: userId,
      name: createNomineeDto.name,
      relation: createNomineeDto.relation,
      phone: createNomineeDto.phone,
      email: createNomineeDto.email,
      allocation_percentage: createNomineeDto.allocationPercentage,
      is_executor: createNomineeDto.isExecutor,
      is_backup: createNomineeDto.isBackup,
    };

    return await this.supabaseService.createNominee(nomineeData);
  }

  async findAll(userId: string): Promise<any[]> {
    return await this.supabaseService.getNomineesByUserId(userId);
  }

  async findOne(id: string, userId: string): Promise<any> {
    const nominees = await this.supabaseService.getNomineesByUserId(userId);
    const nominee = nominees.find(n => n.id === id);
    
    if (!nominee) {
      throw new NotFoundException('Nominee not found');
    }
    
    return nominee;
  }

  async update(id: string, updateNomineeDto: UpdateNomineeDto, userId: string): Promise<any> {
    // First check if nominee exists and belongs to user
    await this.findOne(id, userId);
    
    const updateData = {
      name: updateNomineeDto.name,
      relation: updateNomineeDto.relation,
      phone: updateNomineeDto.phone,
      email: updateNomineeDto.email,
      allocation_percentage: updateNomineeDto.allocationPercentage,
      is_executor: updateNomineeDto.isExecutor,
      is_backup: updateNomineeDto.isBackup,
    };

    return await this.supabaseService.updateNominee(id, updateData);
  }

  async remove(id: string, userId: string): Promise<void> {
    // First check if nominee exists and belongs to user
    await this.findOne(id, userId);
    
    await this.supabaseService.deleteNominee(id);
  }
}
