import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../auth/auth.types';
import { UserRole } from '../users/users.types';
import { VisitDetailResponseDto } from './dto/visit-detail-response.dto';
import { VisitFinishDto } from './dto/visit-finish.dto';
import { VisitResponseDto } from './dto/visit-response.dto';
import { VisitStartDto } from './dto/visit-start.dto';
import { VisitsService } from './visits.service';

@Controller('visits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post('start')
  @Roles(UserRole.Manager)
  start(
    @CurrentUser() user: JwtPayload,
    @Body() dto: VisitStartDto,
  ): Promise<VisitResponseDto> {
    return this.visitsService.startManual(user.sub, dto);
  }

  @Post('finish')
  @Roles(UserRole.Manager)
  finish(
    @CurrentUser() user: JwtPayload,
    @Body() dto: VisitFinishDto,
  ): Promise<VisitResponseDto> {
    return this.visitsService.finishManual(user.sub, dto);
  }

  @Get('my')
  @Roles(UserRole.Manager)
  listMy(@CurrentUser() user: JwtPayload): Promise<VisitResponseDto[]> {
    return this.visitsService.listMyVisits(user.sub);
  }

  @Get(':id')
  @Roles(UserRole.Admin, UserRole.Manager)
  getById(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<VisitDetailResponseDto> {
    return this.visitsService.getVisit(user, id);
  }
}
