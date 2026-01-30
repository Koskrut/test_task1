import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../auth/auth.types';
import { UserRole } from '../users/users.types';
import { GpsPingDto } from './dto/gps-ping.dto';
import { GpsPingResponseDto } from './dto/gps-ping-response.dto';
import { GpsService } from './gps.service';

@Controller('gps')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Post('ping')
  @Roles(UserRole.Manager)
  ping(
    @CurrentUser() user: JwtPayload,
    @Body() dto: GpsPingDto,
  ): Promise<GpsPingResponseDto> {
    return this.gpsService.ping(user.sub, dto);
  }
}
