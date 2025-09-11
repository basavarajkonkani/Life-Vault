import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { CreateTradingAccountDto, UpdateTradingAccountDto } from '../dto/trading-account.dto';

@Injectable()
export class TradingAccountService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(createTradingAccountDto: CreateTradingAccountDto, userId: string): Promise<any> {
    const tradingAccountData = {
      user_id: userId,
      broker_name: createTradingAccountDto.brokerName,
      client_id: createTradingAccountDto.clientId,
      demat_number: createTradingAccountDto.dematNumber,
      nominee_id: createTradingAccountDto.nomineeId,
      current_value: createTradingAccountDto.currentValue,
      status: createTradingAccountDto.status || 'Active',
      notes: createTradingAccountDto.notes,
    };

    return await this.supabaseService.createTradingAccount(tradingAccountData);
  }

  async findAll(userId: string): Promise<any[]> {
    return await this.supabaseService.getTradingAccountsByUserId(userId);
  }

  async findOne(id: string, userId: string): Promise<any> {
    const tradingAccounts = await this.supabaseService.getTradingAccountsByUserId(userId);
    const tradingAccount = tradingAccounts.find(ta => ta.id === id);
    
    if (!tradingAccount) {
      throw new NotFoundException('Trading account not found');
    }
    
    return tradingAccount;
  }

  async update(id: string, updateTradingAccountDto: UpdateTradingAccountDto, userId: string): Promise<any> {
    // First check if trading account exists and belongs to user
    await this.findOne(id, userId);
    
    const updateData = {
      broker_name: updateTradingAccountDto.brokerName,
      client_id: updateTradingAccountDto.clientId,
      demat_number: updateTradingAccountDto.dematNumber,
      nominee_id: updateTradingAccountDto.nomineeId,
      current_value: updateTradingAccountDto.currentValue,
      status: updateTradingAccountDto.status,
      notes: updateTradingAccountDto.notes,
    };

    return await this.supabaseService.updateTradingAccount(id, updateData);
  }

  async remove(id: string, userId: string): Promise<void> {
    // First check if trading account exists and belongs to user
    await this.findOne(id, userId);
    
    await this.supabaseService.deleteTradingAccount(id);
  }
}
