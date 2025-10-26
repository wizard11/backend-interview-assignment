import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileFolderController } from './file-folder.controller';
import { FileFolderService } from './file-folder.service';
import { File } from './entities/file.entity';
import { Folder } from './entities/folder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File, Folder])],
  controllers: [FileFolderController],
  providers: [FileFolderService],
  exports: [FileFolderService],
})
export class FileFolderModule {}
