import { Test, TestingModule } from '@nestjs/testing';
import { TraderController } from './trader.controller';
import { TraderService } from './trader.service';

describe('TraderController', () => {
  let controller: TraderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TraderController],
      providers: [TraderService],
    }).compile();

    controller = module.get<TraderController>(TraderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
