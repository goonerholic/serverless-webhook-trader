import { Module } from '@nestjs/common';
import { TraderService } from './trader.service';
import { TraderController } from './trader.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [TraderController],
  providers: [TraderService],
})
export class TraderModule {}
