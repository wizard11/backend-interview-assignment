import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFileDto, CreateFolderDto } from './dto/create-file-folder.dto';
import { UpdateFileDto, UpdateFolderDto } from './dto/update-file-folder.dto';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { Folder, File } from '@prisma/client';

@Injectable()
export class FileFolderService {
  private readonly uploadDir = './uploads';
  constructor(private prisma: PrismaService) {}

  async uploadFile(
    expressFile: Express.Multer.File,
    createFileDto: CreateFileDto,
    userId: string,
  ): Promise<File> {
    // if a file with the same name exists, delete it first
    const file = await this.findLiveFileByName(
      expressFile.originalname,
      userId,
    );
    if (file) {
      await this.deleteFile(file.id, userId);
    }

    // save the new file
    const fileId = uuidv4();
    const userDir = path.join(this.uploadDir, userId);
    const fileExtension = path.extname(expressFile.originalname);
    const fileName = `${fileId}.${fileExtension}`;
    const filePath = path.join(userDir, fileName);

    // ensure directory exists
    await fs.mkdir(userDir, { recursive: true });
    await fs.writeFile(filePath, new Uint8Array(expressFile.buffer));

    return await this.prisma.file.create({
      data: {
        id: fileId,
        name: expressFile.originalname,
        extension: fileExtension,
        size: expressFile.size,
        createdAt: new Date(),
        folderId: createFileDto.folderId,
        ownerId: userId,
      },
    });
  }

  async createFolder(
    createFolderDto: CreateFolderDto,
    userId: string,
  ): Promise<Folder> {
    if (createFolderDto.parentId) {
      const parentFolder = await this.prisma.folder.findUnique({
        where: { id: createFolderDto.parentId },
      });

      if (!parentFolder || parentFolder.deletedAt) {
        throw new NotFoundException('Parent folder not found');
      }

      if (parentFolder.ownerId !== userId) {
        throw new NotFoundException('Parent folder not found');
      }
    }

    return this.prisma.folder.create({
      data: {
        id: uuidv4(),
        name: createFolderDto.name,
        parentId: createFolderDto.parentId,
        createdAt: new Date(),
        ownerId: userId,
      },
    });
  }

  async listFiles(userId: string, folderId?: string): Promise<File[]> {
    return this.prisma.file.findMany({
      where: {
        ownerId: userId,
        folderId: folderId || null,
        deletedAt: null,
      },
    });
  }

  async listFolders(userId: string, parentId?: string): Promise<Folder[]> {
    return this.prisma.folder.findMany({
      where: {
        ownerId: userId,
        parentId: parentId || null,
        deletedAt: null,
      },
    });
  }

  async getFileById(id: string, userId: string): Promise<File> {
    const file = await this.prisma.file.findFirst({
      where: { id, ownerId: userId, deletedAt: null },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async findFolderById(id: string, userId: string): Promise<Folder> {
    const folder = await this.prisma.folder.findUnique({
      where: { id, ownerId: userId, deletedAt: null },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return folder;
  }

  async updateFile(
    id: string,
    updateFileDto: UpdateFileDto,
    userId: string,
  ): Promise<File> {
    const file = await this.getFileById(id, userId);

    return await this.prisma.file.update({
      where: { id: file.id },
      data: updateFileDto,
    });
  }

  async updateFolder(
    id: string,
    updateFolderDto: UpdateFolderDto,
    userId: string,
  ): Promise<Folder> {
    const folder = await this.findFolderById(id, userId);
    return await this.prisma.folder.update({
      where: { id: folder.id },
      data: updateFolderDto,
    });
  }

  async deleteFile(id: string, userId: string): Promise<void> {
    const file = await this.findLiveFileById(id, userId);
    if (!file) {
      return;
    }

    const fileName = `${file.id}.${file.extension}`;
    const fsPath = path.join(this.uploadDir, userId, fileName);
    await fs.rm(fsPath);

    await this.prisma.file.update({
      where: { id: file.id },
      data: { deletedAt: new Date() },
    });
  }

  async deleteFolder(id: string, userId: string): Promise<void> {
    const folder = await this.findFolderById(id, userId);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const files = await this.listFiles(userId, folder.id);
    if (files.length > 0) {
      throw new ForbiddenException('Folder is not empty');
    }

    await this.prisma.folder.update({
      where: { id: folder.id },
      data: { deletedAt: new Date() },
    });
  }

  async downloadFile(
    fileId: string,
    userId: string,
  ): Promise<{ file: File; stream: any }> {
    const file = await this.getFileById(fileId, userId);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const fileName = `${file.id}.${file.extension}`;
    const fsPath = path.join(this.uploadDir, userId, fileName);

    try {
      const stream = await fs.readFile(fsPath);
      return { file, stream };
    } catch (error) {
      throw new NotFoundException('File not found on disk');
    }
  }

  private async findLiveFileById(
    id: string,
    userId: string,
  ): Promise<File | null> {
    const file = await this.prisma.file.findFirst({
      where: { id, ownerId: userId, deletedAt: null },
    });
    return file;
  }

  private async findLiveFileByName(
    name: string,
    userId: string,
    parentFolderId?: string,
  ): Promise<File | null> {
    return await this.prisma.file.findFirst({
      where: {
        name,
        ownerId: userId,
        deletedAt: null,
        folderId: parentFolderId || null,
      },
    });
  }
}
