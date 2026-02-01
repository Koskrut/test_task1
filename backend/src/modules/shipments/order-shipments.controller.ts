import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../auth/auth.types';
import { UserRole } from '../users/users.types';
import { ShipOrderDto } from './dto/ship-order.dto';
import { ShipmentResponseDto } from './dto/shipment-response.dto';
import { ShipmentsService } from './shipments.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post(':id/ship')
  @Roles(UserRole.Admin, UserRole.Manager, UserRole.Logistics)
  shipOrder(
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
    @Body() dto: ShipOrderDto,
  ): Promise<ShipmentResponseDto> {
    return this.shipmentsService.createShipment(user, orderId, dto);
  }
}
