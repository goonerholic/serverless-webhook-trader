import { Module } from '@nestjs/common';
import { TraderModule } from './trader/trader.module';
import { ConfigModule } from '@nestjs/config';
import { exchangeKeys } from './config/apiKeys';
import { TradersModule } from './traders/traders.module';

@Module({
  imports: [
    TraderModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [exchangeKeys],
    }),
    TradersModule,
  ],
})
export class AppModule {}
