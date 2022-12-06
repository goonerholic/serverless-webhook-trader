import ccxt from 'ccxt';

export interface CreateOrderPayload {
  symbol: string;
  type: 'market' | 'limit' | 'stop_market';
  side: 'buy' | 'sell';
  size: number;
  price?: number;
}

export class Exchange {
  exchange: ccxt.Exchange;
  constructor(
    exchangeId: string,
    apiKey: string,
    secret: string,
    futures = true,
  ) {
    const Exchange = ccxt[exchangeId];

    const instance = new Exchange({
      apiKey,
      secret,
      options: {
        defaultType: 'future',
        futures,
      },
    });

    this.exchange = instance;
  }

  async fetchMarket() {
    const markets = await this.exchange.loadMarkets();

    return markets;
  }

  async fetchPositions(symbol: string) {
    const positions = await this.exchange.fetchPositions([symbol]);

    return positions.filter((position) => position.contracts !== 0);
  }

  async fetchOrders(symbol: string) {
    const orders = await this.exchange.fetchOpenOrders(symbol);

    return orders;
  }

  async cancelOrder(id: string, symbol: string) {
    return await this.exchange.cancelOrder(id, symbol);
  }

  async placeOrder(payload: CreateOrderPayload, clientId?: string) {
    const { symbol, type, side, size, price } = payload;

    const params: Record<string, any> = {
      positionSide: side === 'buy' ? 'LONG' : 'SHORT',
      clientOrderId: clientId || `${symbol}-entry-${Date.now()}`,
    };

    if (type === 'stop_market') {
      params.stopPrice = price;
    }

    const order = await this.exchange.createOrder(
      symbol,
      type,
      side,
      size,
      price,
      params,
    );

    return order;
  }

  async closePosition(symbol: string, side: 'buy' | 'sell') {
    const hedgeSide = side === 'buy' ? 'SHORT' : 'LONG';

    const position = (await this.fetchPositions(symbol)).find(
      (position) => position.side === hedgeSide.toLowerCase(),
    );

    if (position) {
      await this.exchange.createOrder(
        symbol,
        'market',
        side,
        position.contracts,
        undefined,
        {
          positionSide: side === 'buy' ? 'SHORT' : 'LONG',
        },
      );
    }

    const openOrders = (await this.fetchOrders(symbol)).filter(
      (order) => order.info.positionSide === hedgeSide,
    );

    await Promise.all(
      openOrders.map((order) => this.cancelOrder(order.id, order.symbol)),
    );

    return 'Position closed';
  }

  async closeAllPositions(symbol: string) {
    const sides: ('buy' | 'sell')[] = ['buy', 'sell'];

    return await Promise.all(
      sides.map((side) => this.closePosition(symbol, side)),
    );
  }
}
