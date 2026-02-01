import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../auth/auth.types';
import { UserRole } from '../users/users.types';
import { ClientProfileService } from './client-profile.service';
import { AddressResponseDto } from './dto/address-response.dto';
import { ClientProfileResponseDto } from './dto/client-profile-response.dto';
import { NotificationPreferencesDto } from './dto/notification-preferences.dto';

@Controller('client/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientProfileController {
  constructor(private readonly profileService: ClientProfileService) {}

  @Get()
  @Roles(UserRole.Client)
  getProfile(
    @CurrentUser() user: JwtPayload,
  ): Promise<ClientProfileResponseDto> {
    return this.profileService.getProfile(user.sub);
  }

  @Get('addresses')
  @Roles(UserRole.Client)
  listAddresses(
    @CurrentUser() user: JwtPayload,
  ): Promise<AddressResponseDto[]> {
    return this.profileService.listAddresses(user.sub);
  }

  @Get('preferences')
  @Roles(UserRole.Client)
  getPreferences(
    @CurrentUser() user: JwtPayload,
  ): Promise<NotificationPreferencesDto> {
    return this.profileService.getPreferences(user.sub);
  }

  @Patch('preferences')
  @Roles(UserRole.Client)
  updatePreferences(
    @CurrentUser() user: JwtPayload,
    @Body() dto: NotificationPreferencesDto,
  ): Promise<NotificationPreferencesDto> {
    return this.profileService.updatePreferences(user.sub, dto);
  }
}
