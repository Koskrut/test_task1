import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../auth/auth.types';
import { UserRole } from '../users/users.types';
import { ClientOrdersService } from './client-orders.service';
import { ClientOrderDetailDto } from './dto/client-order-detail.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { OrderListResponseDto } from './dto/order-list-response.dto';

@Controller('client/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientOrdersController {
  constructor(private readonly ordersService: ClientOrdersService) {}

  @Get()
  @Roles(UserRole.Client)
  list(
    @CurrentUser() user: JwtPayload,
    @Query() query: OrderListQueryDto,
  ): Promise<OrderListResponseDto> {
    return this.ordersService.listOrders(user.sub, query);
  }

  @Get(':id')
  @Roles(UserRole.Client)
  getById(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<ClientOrderDetailDto> {
    return this.ordersService.getOrder(user.sub, id);
  }

  @Post(':id/repeat')
  @Roles(UserRole.Client)
  repeat(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<ClientOrderDetailDto> {
    return this.ordersService.repeatOrder(user.sub, id);
  }
}
