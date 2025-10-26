import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CreateFileDto, CreateFolderDto } from './dto/create-file-folder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileService } from './file.service';
import { FolderService } from './folder.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class FileFolderController {
  constructor(
    private readonly fileService: FileService,
    private readonly folderService: FolderService,
  ) {}

  @Post('/v1/files')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFileDto: CreateFileDto,
    @Req() req: any,
  ) {
    return this.fileService.uploadFile(file, createFileDto, req.user.userId);
  }

  @Post('/v1/folders')
  createFolder(@Body() createFolderDto: CreateFolderDto, @Req() req: any) {
    return this.folderService.createFolder(createFolderDto, req.user.userId);
  }

  @Get('/v1/files')
  getUserFiles(@Query('folderId') folderId: string, @Req() req: any) {
    return this.fileService.listFiles(req.user.userId, folderId);
  }

  @Get('/v1/folders')
  getUserFolders(@Query('parentId') parentId: string, @Req() req: any) {
    return this.folderService.listFolders(req.user.userId, parentId);
  }

  @Get('/v1/files/:id')
  getFile(@Param('id') id: string, @Req() req: any) {
    return this.fileService.getFile(id, req.user.userId);
  }

  @Get('/v1/folders/:id')
  getFolder(@Param('id') id: string, @Req() req: any) {
    return this.folderService.findFolderById(id, req.user.userId);
  }

  @Get('/v1/files/:id/download')
  async downloadFile(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const { file, stream } = await this.fileService.downloadFile(
      id,
      req.user.userId,
    );

    res.setHeader('Content-Type', file.extension);
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.send(stream);
  }

  @Delete('/v1/files/:id')
  deleteFile(@Param('id') id: string, @Req() req: any) {
    return this.fileService.deleteFile(id, req.user.userId);
  }

  @Delete('/v1/folders/:id')
  deleteFolder(@Param('id') id: string, @Req() req: any) {
    return this.folderService.deleteFolder(id, req.user.userId);
  }
}
