import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL')!;
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!;
    this.client = createClient(url, serviceKey);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  async uploadFile(
    bucket: string,
    fileName: string,
    file: Buffer,
    contentType: string,
  ): Promise<{ path: string; url: string }> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const { data: urlData } = this.client.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
    };
  }

  async deleteFile(bucket: string, fileName: string): Promise<void> {
    const { error } = await this.client.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async createSignedUrl(
    bucket: string,
    fileName: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(fileName, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  async getPublicUrl(bucket: string, fileName: string): Promise<string> {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
}
