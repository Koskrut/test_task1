import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../auth/auth.types';
import { UserRole } from '../users/users.types';
import { ShipmentStatusResponseDto } from './dto/shipment-status-response.dto';
import { ShipmentsService } from './shipments.service';

@Controller('shipments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get(':ttn')
  @Roles(UserRole.Admin, UserRole.Manager, UserRole.Logistics)
  getStatus(
    @CurrentUser() user: JwtPayload,
    @Param('ttn') ttn: string,
  ): Promise<ShipmentStatusResponseDto> {
    return this.shipmentsService.getShipmentStatus(user, ttn);
  }

  @Post('webhook/nova-poshta')
  @Roles(UserRole.Admin, UserRole.Logistics)
  async webhook(@Body() payload: Record<string, unknown>): Promise<{ ok: true }> {
    await this.shipmentsService.handleWebhook(payload);
    return { ok: true };
  }
}
