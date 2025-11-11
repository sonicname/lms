import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { JwtCookieAuthGuard } from 'src/modules/auth/guards/jwt-cookie.guard';
import { AssetsService } from './assets.service';
import { AttachAssetTagsDocs } from './docs/attach-tags.docs';
import { CreateAssetTagDocs } from './docs/create-tag.docs';
import { DeleteAssetDocs } from './docs/delete-asset.docs';
import { DeleteAssetTagDocs } from './docs/delete-tag.docs';
import { DetachAssetTagDocs } from './docs/detach-tag.docs';
import { GetAssetDocs } from './docs/get-asset.docs';
import { ListAssetsDocs } from './docs/list-assets.docs';
import { ListAssetTagsDocs } from './docs/list-tags.docs';
import { UpdateAssetTagDocs } from './docs/update-tag.docs';
import { UploadAssetDocs } from './docs/upload-asset.docs';
import {
  CreateAssetsTagDto,
  ListAssetsTagsDto,
  UpdateAssetsTagDto,
} from './dtos/assets-tag.dto';
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

  // ====== Assets Tags CRUD ======
  @Get('tags')
  @ListAssetTagsDocs()
  async listTags(
    @Req() req: Request & { user?: { id: string } },
    @Query() query: ListAssetsTagsDto,
  ) {
    return this.assetsService.listTags(req.user!.id, query.search);
  }

  @Post('tags')
  @CreateAssetTagDocs()
  async createTag(
    @Req() req: Request & { user?: { id: string } },
    @Body() body: CreateAssetsTagDto,
  ) {
    return this.assetsService.createTag(req.user!.id, body);
  }

  @Patch('tags/:id')
  @UpdateAssetTagDocs()
  async updateTag(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') id: string,
    @Body() body: UpdateAssetsTagDto,
  ) {
    return this.assetsService.updateTag(req.user!.id, id, body);
  }

  @Delete('tags/:id')
  @DeleteAssetTagDocs()
  async deleteTag(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') id: string,
  ) {
    return this.assetsService.deleteTag(req.user!.id, id);
  }

  // ====== Attach/Detach tags to an asset ======
  @Post(':id/tags')
  @AttachAssetTagsDocs()
  @ApiOperation({ summary: 'Attach tags to an asset by IDs' })
  async attachTags(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') assetId: string,
    @Body() body: { tagIds: string[] },
  ) {
    return this.assetsService.attachTags(
      req.user!.id,
      assetId,
      body.tagIds || [],
    );
  }

  @Delete(':id/tags/:tagId')
  @HttpCode(200)
  @DetachAssetTagDocs()
  @ApiOperation({ summary: 'Detach one tag from an asset' })
  async detachTag(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') assetId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.assetsService.detachTag(req.user!.id, assetId, tagId);
  }
}
