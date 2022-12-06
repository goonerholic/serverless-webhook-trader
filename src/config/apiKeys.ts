export const exchangeKeys = () => ({
  binance: {
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
    apiKeyDev: process.env.BINANCE_API_KEY_DEV,
    apiSecretDev: process.env.BINANCE_API_SECRET_DEV,
  },
});
