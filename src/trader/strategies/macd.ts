import { ConflictException } from '@nestjs/common';
import { Exchange } from 'src/trader/exchange/exchange.model';
import AWS from 'aws-sdk';

interface Msg {
  mode: string;
  symbol: string;
  prices: number[];
  side: 'buy' | 'sell';
  type: string;
  sizes: number[];
}

export class MacdStrategy {
  constructor(private msg: Msg, private exchange: Exchange) {}

  async execute() {
    const positions = await this.exchange.fetchPositions(this.msg.symbol);
    const openOrders = await this.exchange.fetchOrders(this.msg.symbol);

    if (positions.length > 0 || openOrders.length > 0) {
      throw new ConflictException('Order already triggered');
    }

    const { type, symbol, prices, sizes, mode, side } = this.msg;

    const orders = prices.map((price, i) =>
      this.exchange.placeOrder({
        mode,
        symbol,
        type: i === 0 ? 'market' : 'limit',
        side,
        size: sizes[i],
        price,
        params: {
          positionSide: side === 'buy' ? 'LONG' : 'SHORT',
        },
      }),
    );

    const reverseOrder = this.exchange.placeOrder({
      mode,
      symbol,
      type: `STOP${type === 'limit' ? '' : '_MARKET'}`,
      side: side === 'buy' ? 'sell' : 'buy',
      size: sizes[1],
      price: prices[1],
      params: {
        stopPrice: prices[1],
        positionSide: side === 'buy' ? 'SHORT' : 'LONG',
      },
    });

    const enableRule = new AWS.EventBridge()
      .enableRule({
        Name: 'serverless-tv-trader-prod-WatcherEventsRuleSchedul-18S5J3UYYQ4NS',
        EventBusName: 'default',
      })
      .promise();

    return await Promise.all([...orders, reverseOrder, enableRule]);
  }
}
