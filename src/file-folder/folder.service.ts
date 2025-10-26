import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-file-folder.dto';
import { UpdateFolderDto } from './dto/update-file-folder.dto';
import { v4 as uuidv4 } from 'uuid';
import { Folder } from '@prisma/client';
import { FileService } from './file.service';

@Injectable()
export class FolderService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}

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

  async listFolders(userId: string, parentId?: string): Promise<Folder[]> {
    return this.prisma.folder.findMany({
      where: {
        ownerId: userId,
        parentId: parentId || null,
        deletedAt: null,
      },
    });
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

  async deleteFolder(id: string, userId: string): Promise<void> {
    const folder = await this.findFolderById(id, userId);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const files = await this.fileService.listFiles(userId, folder.id);
    if (files.length > 0) {
      throw new ForbiddenException('Folder is not empty');
    }

    await this.prisma.folder.update({
      where: { id: folder.id },
      data: { deletedAt: new Date() },
    });
  }
}
