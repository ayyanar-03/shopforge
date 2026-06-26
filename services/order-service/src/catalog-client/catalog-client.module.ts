import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CatalogClientService } from './catalog-client.service';

@Module({
  imports: [HttpModule],
  providers: [CatalogClientService],
  exports: [CatalogClientService],
})
export class CatalogClientModule {}
