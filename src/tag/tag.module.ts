import { Module } from '@nestjs/common';
import { TagService } from '@app/tag/tag.service';
import { TagController } from '@app/tag/tag.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {TagEntity} from "@app/tag/entities/tag.entity";

@Module({
  controllers: [TagController],
  providers: [TagService],
  imports: [TypeOrmModule.forFeature([TagEntity])],
})
export class TagModule {}
