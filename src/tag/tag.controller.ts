import {Controller, Get} from '@nestjs/common';
import { TagService } from '@app/tag/tag.service';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async findAll(): Promise<{ tags: string[] }> {
    const tags = await this.tagService.findAll();
    //to kak dannie otobrajayutsa na kliente
    return {
      tags: tags.map((tag) => tag.name)
    }
  }
}
