import { PartialType } from '@nestjs/mapped-types';
import { CreateFolderDto } from './create-file-folder.dto';

export class UpdateFileDto {
  name?: string;
}

export class UpdateFolderDto extends PartialType(CreateFolderDto) {}
