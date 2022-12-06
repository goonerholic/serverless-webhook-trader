import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';
import { Handler } from 'aws-lambda';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  if (!server) {
    const app = await NestFactory.create(AppModule);

    await app.init();

    const expressApp = app.getHttpAdapter().getInstance();
    return serverlessExpress({ app: expressApp });
  }
}

export const handler: Handler = async (event, context, callback) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
