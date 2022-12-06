import { Body, Controller, Post } from '@nestjs/common';
import { EntryOrderDto, TraderService } from './trader.service';

@Controller('trader')
export class TraderController {
  constructor(private readonly traderService: TraderService) {}

  @Post()
  order(@Body() order: EntryOrderDto) {
    console.log(order);
    return this.traderService.order(order);
  }

  @Post('test')
  test(@Body() order: EntryOrderDto) {
    console.log(order);
    return this.traderService.order(order, true);
  }
}
