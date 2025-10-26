import { Module } from '@nestjs/common';
import { FileSharingController } from './file-sharing.controller';

@Module({
  controllers: [FileSharingController]
})
export class FileSharingModule {}
