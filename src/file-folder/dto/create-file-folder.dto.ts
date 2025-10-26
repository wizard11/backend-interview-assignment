import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateFileDto {
  @IsOptional()
  @IsUUID()
  folderId?: string;
}

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
