import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFileDto } from './dto/create-file-folder.dto';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { File } from '@prisma/client';

@Injectable()
export class FileService {
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

  async listFiles(userId: string, folderId?: string): Promise<File[]> {
    return this.prisma.file.findMany({
      where: {
        ownerId: userId,
        folderId: folderId || null,
        deletedAt: null,
      },
    });
  }

  async getFile(id: string, userId: string): Promise<File> {
    const file = await this.findLiveFileById(id, userId);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
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

  async downloadFile(
    fileId: string,
    userId: string,
  ): Promise<{ file: File; stream: any }> {
    const file = await this.getFile(fileId, userId);
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

  async _retriveFileList(userId: string, filter: any): Promise<File[]> {
    return this.prisma.file.findMany({
      where: {
        ownerId: userId,
        ...filter,
      },
    });
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
