import { Module } from '@nestjs/common';
import { ORDERS_REPOSITORY } from '../../common/constants/tokens';
import { OrdersController } from './orders.controller';
import { PrismaOrdersRepository } from './infrastructure/prisma-orders.repository';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [
    OrdersService,
    {
      provide: ORDERS_REPOSITORY,
      useClass: PrismaOrdersRepository,
    },
  ],
  exports: [OrdersService, ORDERS_REPOSITORY],
})
export class OrdersModule {}
