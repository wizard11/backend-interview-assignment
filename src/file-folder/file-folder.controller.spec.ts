import { Test, TestingModule } from '@nestjs/testing';
import { FileFolderController } from './file-folder.controller';

describe('FileFolderController', () => {
  let controller: FileFolderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileFolderController],
    }).compile();

    controller = module.get<FileFolderController>(FileFolderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
