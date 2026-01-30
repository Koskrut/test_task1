import { Module } from '@nestjs/common';
import { NovaPoshtaClient } from './nova-poshta.client';
import { NovaPoshtaService } from './nova-poshta.service';

@Module({
  providers: [NovaPoshtaClient, NovaPoshtaService],
  exports: [NovaPoshtaService],
})
export class NovaPoshtaModule {}
