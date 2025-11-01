import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { JwtCookieAuthGuard } from 'src/modules/auth/guards/jwt-cookie.guard';
import { AssetsService } from './assets.service';
import { DeleteAssetDocs } from './docs/delete-asset.docs';
import { GetAssetDocs } from './docs/get-asset.docs';
import { ListAssetsDocs } from './docs/list-assets.docs';
import { UploadAssetDocs } from './docs/upload-asset.docs';
import { ListAssetsDto } from './dtos/list-assets.dto';

function ensureUploadsDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

@Controller('assets')
@ApiTags('Assets')
@UseGuards(JwtCookieAuthGuard)
@ApiCookieAuth('access_token')
export class AssetsController {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private readonly assetsService: AssetsService) {
    ensureUploadsDir(this.uploadDir);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, path.join(process.cwd(), 'uploads'));
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = path.extname(file.originalname);
          cb(null, `${unique}${ext}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  @UploadAssetDocs()
  async upload(
    @Req() req: Request & { user?: { id: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { fileType?: string; type?: string },
  ) {
    const userId = req.user!.id;
    const url = `/uploads/${file.filename}`;
    return this.assetsService.createFromUpload({
      userId,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url,
      fileType: body.fileType ?? null,
      type: body.type ?? null,
    });
  }

  @Get()
  @ListAssetsDocs()
  async list(
    @Req() req: Request & { user?: { id: string } },
    @Query() query: ListAssetsDto,
  ) {
    return this.assetsService.list(req.user!.id, query);
  }

  @Get(':id')
  @GetAssetDocs()
  async getById(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') id: string,
  ) {
    return this.assetsService.getById(req.user!.id, id);
  }

  @Delete(':id')
  @DeleteAssetDocs()
  async remove(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') id: string,
  ) {
    return this.assetsService.delete(req.user!.id, id);
  }
}
