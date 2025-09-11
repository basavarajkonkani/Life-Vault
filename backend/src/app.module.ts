import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth.module';

// Import all controllers
import { AuthController } from './controllers/auth.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { AssetController } from './controllers/asset.controller';
import { AssetsController } from './controllers/assets.controller';
import { NomineeController } from './controllers/nominee.controller';
import { NomineesController } from './controllers/nominees.controller';
import { TradingAccountController } from './controllers/trading-account.controller';
import { TradingAccountsController } from './controllers/trading-accounts.controller';
import { VaultController } from './controllers/vault.controller';
import { UploadController } from './controllers/upload.controller';

// Import all services
import { AuthService } from './services/auth.service';
import { AssetService } from './services/asset.service';
import { NomineeService } from './services/nominee.service';
import { TradingAccountService } from './services/trading-account.service';
import { VaultRequestService } from './services/vault-request.service';
import { AuditService } from './services/audit.service';
import { SupabaseService } from './services/supabase.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
  ],
  controllers: [
    AppController,
    AuthController,
    DashboardController,
    AssetController,
    AssetsController,
    NomineeController,
    NomineesController,
    TradingAccountController,
    TradingAccountsController,
    VaultController,
    UploadController,
  ],
  providers: [
    AppService,
    AuthService,
    AssetService,
    NomineeService,
    TradingAccountService,
    VaultRequestService,
    AuditService,
    SupabaseService,
  ],
})
export class AppModule {}
