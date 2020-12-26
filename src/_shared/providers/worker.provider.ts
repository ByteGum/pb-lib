import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { WorkerQueue, WorkerService } from '../common';
import { Logger } from '@nestjs/common';

export const WORKER_PROVIDERS = [
  {
    provide: WorkerService.WORKER_SERVICE_TOKEN,
    useFactory: (config: ConfigService) => {
      Logger.log(`Rabbit MQ URL : ${config.get('service.rabbitMQ')}`);
      return ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [config.get('service.rabbitMQ')],
          queue: WorkerQueue.PROCESS_WORK,
          queueOptions: { durable: true },
        },
      });
    },
    inject: [ConfigService],
  },
];
