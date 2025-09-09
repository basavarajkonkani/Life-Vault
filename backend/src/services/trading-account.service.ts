import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TradingAccount } from '../entities/trading-account.entity';
import { User } from '../entities/user.entity';
import { CreateTradingAccountDto, UpdateTradingAccountDto } from '../dto/trading-account.dto';
import { AuditService } from './audit.service';
import { AuditAction, AuditResource } from '../entities/audit-log.entity';

@Injectable()
export class TradingAccountService {
  constructor(
    @InjectRepository(TradingAccount)
    private readonly tradingAccountRepository: Repository<TradingAccount>,
    private readonly auditService: AuditService,
  ) {}

  async create(createTradingAccountDto: CreateTradingAccountDto, user: User): Promise<TradingAccount> {
    const tradingAccount = this.tradingAccountRepository.create({
      ...createTradingAccountDto,
      userId: user.id,
    });

    const savedTradingAccount = await this.tradingAccountRepository.save(tradingAccount);

    // Log the action
    await this.auditService.log(
      AuditAction.CREATE,
      AuditResource.TRADING_ACCOUNT,
      user.id,
      savedTradingAccount.id,
      `Trading account created: ${savedTradingAccount.brokerName} - ${savedTradingAccount.accountNumber}`,
      { brokerName: savedTradingAccount.brokerName, accountNumber: savedTradingAccount.accountNumber },
    );

    return savedTradingAccount;
  }

  async findAll(user: User): Promise<TradingAccount[]> {
    return this.tradingAccountRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User): Promise<TradingAccount> {
    const tradingAccount = await this.tradingAccountRepository.findOne({
      where: { id, userId: user.id },
    });

    if (!tradingAccount) {
      throw new NotFoundException('Trading account not found');
    }

    return tradingAccount;
  }

  async update(id: string, updateTradingAccountDto: UpdateTradingAccountDto, user: User): Promise<TradingAccount> {
    const tradingAccount = await this.findOne(id, user);

    Object.assign(tradingAccount, updateTradingAccountDto);
    const updatedTradingAccount = await this.tradingAccountRepository.save(tradingAccount);

    // Log the action
    await this.auditService.log(
      AuditAction.UPDATE,
      AuditResource.TRADING_ACCOUNT,
      user.id,
      updatedTradingAccount.id,
      `Trading account updated: ${updatedTradingAccount.brokerName} - ${updatedTradingAccount.accountNumber}`,
      { brokerName: updatedTradingAccount.brokerName, accountNumber: updatedTradingAccount.accountNumber },
    );

    return updatedTradingAccount;
  }

  async remove(id: string, user: User): Promise<void> {
    const tradingAccount = await this.findOne(id, user);

    await this.tradingAccountRepository.remove(tradingAccount);

    // Log the action
    await this.auditService.log(
      AuditAction.DELETE,
      AuditResource.TRADING_ACCOUNT,
      user.id,
      id,
      `Trading account deleted: ${tradingAccount.brokerName} - ${tradingAccount.accountNumber}`,
      { brokerName: tradingAccount.brokerName, accountNumber: tradingAccount.accountNumber },
    );
  }
}
