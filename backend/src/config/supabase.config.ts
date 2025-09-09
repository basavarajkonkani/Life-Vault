import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

export const getSupabaseConfig = (configService: ConfigService) => {
  const supabaseUrl = configService.get<string>('SUPABASE_URL');
  const supabaseAnonKey = configService.get<string>('SUPABASE_ANON_KEY');
  const supabaseServiceKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration. Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceKey: supabaseServiceKey,
    client: createClient(supabaseUrl, supabaseServiceKey),
  };
};
