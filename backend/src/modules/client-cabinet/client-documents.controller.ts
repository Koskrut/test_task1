import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../auth/auth.types';
import { UserRole } from '../users/users.types';
import { ClientDocumentsService } from './client-documents.service';
import { DocumentDownloadResponseDto } from './dto/document-download-response.dto';
import { DocumentListQueryDto } from './dto/document-list-query.dto';
import { DocumentListResponseDto } from './dto/document-list-response.dto';

@Controller('client/documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientDocumentsController {
  constructor(private readonly documentsService: ClientDocumentsService) {}

  @Get()
  @Roles(UserRole.Client)
  list(
    @CurrentUser() user: JwtPayload,
    @Query() query: DocumentListQueryDto,
  ): Promise<DocumentListResponseDto> {
    return this.documentsService.listDocuments(user.sub, query);
  }

  @Get(':id/download')
  @Roles(UserRole.Client)
  download(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<DocumentDownloadResponseDto> {
    return this.documentsService.downloadDocument(user.sub, id);
  }
}
