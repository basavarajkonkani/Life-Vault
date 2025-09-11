import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // User operations
  async createUser(userData: any) {
    const { data, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserById(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserByPhone(phone: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Asset operations
  async getAssetsByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }

  async createAsset(assetData: any) {
    const { data, error } = await this.supabase
      .from('assets')
      .insert(assetData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateAsset(id: string, assetData: any) {
    const { data, error } = await this.supabase
      .from('assets')
      .update(assetData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteAsset(id: string) {
    const { error } = await this.supabase
      .from('assets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }

  // Nominee operations
  async getNomineesByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('nominees')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }

  async createNominee(nomineeData: any) {
    const { data, error } = await this.supabase
      .from('nominees')
      .insert(nomineeData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateNominee(id: string, nomineeData: any) {
    const { data, error } = await this.supabase
      .from('nominees')
      .update(nomineeData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteNominee(id: string) {
    const { error } = await this.supabase
      .from('nominees')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }

  // Trading Account operations
  async getTradingAccountsByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('trading_accounts')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }

  async createTradingAccount(tradingAccountData: any) {
    const { data, error } = await this.supabase
      .from('trading_accounts')
      .insert(tradingAccountData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateTradingAccount(id: string, tradingAccountData: any) {
    const { data, error } = await this.supabase
      .from('trading_accounts')
      .update(tradingAccountData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteTradingAccount(id: string) {
    const { error } = await this.supabase
      .from('trading_accounts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }

  // Vault Request operations
  async getVaultRequests() {
    const { data, error } = await this.supabase
      .from('vault_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createVaultRequest(vaultRequestData: any) {
    const { data, error } = await this.supabase
      .from('vault_requests')
      .insert(vaultRequestData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateVaultRequest(id: string, vaultRequestData: any) {
    const { data, error } = await this.supabase
      .from('vault_requests')
      .update(vaultRequestData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Dashboard operations
  async getDashboardStats(userId: string) {
    // Get assets count and total value
    const { data: assets, error: assetsError } = await this.supabase
      .from('assets')
      .select('current_value')
      .eq('user_id', userId);
    
    if (assetsError) throw assetsError;

    // Get nominees count
    const { count: nomineesCount, error: nomineesError } = await this.supabase
      .from('nominees')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (nomineesError) throw nomineesError;

    // Get trading accounts count
    const { count: tradingAccountsCount, error: tradingError } = await this.supabase
      .from('trading_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (tradingError) throw tradingError;

    const totalValue = assets?.reduce((sum, asset) => sum + parseFloat(asset.current_value || 0), 0) || 0;

    return {
      totalAssets: assets?.length || 0,
      totalValue,
      totalNominees: nomineesCount || 0,
      totalTradingAccounts: tradingAccountsCount || 0,
    };
  }
}
