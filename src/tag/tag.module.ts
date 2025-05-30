import { Module } from '@nestjs/common';
import { TagService } from '@app/tag/tag.service';
import { TagController } from '@app/tag/tag.controller';

@Module({
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
