import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { GpsModule } from './modules/gps/gps.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { NovaPoshtaModule } from './modules/nova-poshta/nova-poshta.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RbacModule,
    GpsModule,
    OrdersModule,
    ShipmentsModule,
    NovaPoshtaModule,
  ],
})
export class AppModule {}
