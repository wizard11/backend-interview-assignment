import { Controller } from '@nestjs/common';
import { FileSharingService } from './file-sharing.service';

@Controller('file-sharing')
export class FileSharingController {
  constructor(private readonly fileSharingService: FileSharingService) {}
  // TODO: Implement file sharing endpoints
}
