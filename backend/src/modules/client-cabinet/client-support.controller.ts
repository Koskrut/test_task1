import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../auth/auth.types';
import { UserRole } from '../users/users.types';
import { ClientSupportService } from './client-support.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { MessageListResponseDto } from './dto/message-list-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { TicketListQueryDto } from './dto/ticket-list-query.dto';
import { TicketListResponseDto } from './dto/ticket-list-response.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';

@Controller('client/support')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientSupportController {
  constructor(private readonly supportService: ClientSupportService) {}

  @Get('tickets')
  @Roles(UserRole.Client)
  listTickets(
    @CurrentUser() user: JwtPayload,
    @Query() query: TicketListQueryDto,
  ): Promise<TicketListResponseDto> {
    return this.supportService.listTickets(user.sub, query);
  }

  @Post('tickets')
  @Roles(UserRole.Client)
  createTicket(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTicketDto,
  ): Promise<TicketResponseDto> {
    return this.supportService.createTicket(user.sub, dto);
  }

  @Get('tickets/:id/messages')
  @Roles(UserRole.Client)
  listMessages(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query() query: TicketListQueryDto,
  ): Promise<MessageListResponseDto> {
    return this.supportService.listMessages(user.sub, id, query);
  }

  @Post('tickets/:id/messages')
  @Roles(UserRole.Client)
  createMessage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    return this.supportService.createMessage(user.sub, id, dto);
  }
}
