import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Asset } from '../entities/asset.entity';
import { Nominee } from '../entities/nominee.entity';
import { VaultRequest } from '../entities/vault-request.entity';
import { TradingAccount } from '../entities/trading-account.entity';
import { AuditLog } from '../entities/audit-log.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const supabaseUrl = configService.get<string>('SUPABASE_URL');
  const supabaseKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }

  // Extract database connection details from Supabase URL
  const url = new URL(supabaseUrl);
  const host = url.hostname;
  const port = parseInt(url.port) || 5432;
  const database = url.pathname.substring(1); // Remove leading slash
  const username = 'postgres';
  const password = supabaseKey;

  return {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    entities: [User, Asset, Nominee, VaultRequest, TradingAccount, AuditLog],
    synchronize: configService.get<string>('NODE_ENV') === 'development',
    logging: configService.get<string>('NODE_ENV') === 'development',
    ssl: {
      rejectUnauthorized: false,
    },
  };
};
