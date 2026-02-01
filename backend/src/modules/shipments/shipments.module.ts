import { Module } from '@nestjs/common';
import {
  DELIVERIES_REPOSITORY,
  DELIVERY_EVENTS_REPOSITORY,
  SHIPMENTS_REPOSITORY,
  WEBHOOK_EVENTS_REPOSITORY,
} from '../../common/constants/tokens';
import { OrdersModule } from '../orders/orders.module';
import { NovaPoshtaModule } from '../nova-poshta/nova-poshta.module';
import { PrismaDeliveriesRepository } from './infrastructure/prisma-deliveries.repository';
import { PrismaDeliveryEventsRepository } from './infrastructure/prisma-delivery-events.repository';
import { PrismaShipmentsRepository } from './infrastructure/prisma-shipments.repository';
import { PrismaWebhookEventsRepository } from './infrastructure/prisma-webhook-events.repository';
import { OrderShipmentsController } from './order-shipments.controller';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';

@Module({
  imports: [OrdersModule, NovaPoshtaModule],
  controllers: [ShipmentsController, OrderShipmentsController],
  providers: [
    ShipmentsService,
    {
      provide: DELIVERIES_REPOSITORY,
      useClass: PrismaDeliveriesRepository,
    },
    {
      provide: SHIPMENTS_REPOSITORY,
      useClass: PrismaShipmentsRepository,
    },
    {
      provide: DELIVERY_EVENTS_REPOSITORY,
      useClass: PrismaDeliveryEventsRepository,
    },
    {
      provide: WEBHOOK_EVENTS_REPOSITORY,
      useClass: PrismaWebhookEventsRepository,
    },
  ],
})
export class ShipmentsModule {}
