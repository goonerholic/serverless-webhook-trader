import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Exchange } from './exchange/exchange.model';

export interface EntryOrderDto {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  size: number;
  price?: number;
  prices?: number[];
  sizes?: number[];
  exchange: string;
  futures?: boolean;
}

export interface ExitOrderDto {
  symbol: string;
  side: 'buy' | 'sell';
  exchange: string;
  futures?: boolean;
  closeOrder: boolean;
}

interface ExchangeKey {
  apiKey: string;
  apiSecret: string;
}

@Injectable()
export class TraderService {
  exchange: Exchange;
  constructor(
    private configService: ConfigService<Record<string, ExchangeKey>>,
  ) {}

  async order(order: EntryOrderDto | ExitOrderDto, dev = false) {
    this.initExchange(order.exchange, (order.futures = true), dev);

    const symbol = await this.parseTicker(order.symbol);

    if ('closeOrder' in order) {
      return await this.exchange.closePosition(symbol, order.side);
    }

    if ('prices' in order) {
      return await Promise.all(
        order.prices.map((price, index) =>
          this.exchange.placeOrder(
            {
              symbol,
              side: order.side,
              type: order.type,
              size: order.sizes[index],
              price,
            },
            `${symbol}-entry-${Date.now()}-${index}`,
          ),
        ),
      );
    }

    return await this.exchange.placeOrder({
      symbol,
      type: order.type,
      side: order.side,
      size: order.size,
      price: order.price,
    });
  }

  private initExchange(exchange: string, futures?: boolean, dev?: boolean) {
    const { apiKey, apiSecret, apiKeyDev, apiSecretDev } =
      this.configService.get(exchange);

    this.exchange = new Exchange(
      exchange,
      dev ? apiKeyDev : apiKey,
      dev ? apiSecretDev : apiSecret,
      futures,
    );
  }

  private async parseTicker(ticker: string) {
    const market = await this.exchange.fetchMarket();

    return Object.entries(market).find(([, value]) => value.id === ticker)[0];
  }
}
