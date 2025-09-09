import { Controller, Post, UseGuards, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SupabaseService } from '../services/supabase.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    const supabase = this.supabaseService.getClient();
    const bucket = 'documents';
    const filePath = `${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage.from(bucket).upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
    if (error) throw new BadRequestException(error.message);

    const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(filePath, 60 * 60);

    return { success: true, fileName: filePath, url: signed?.signedUrl };
  }
} 