import { Controller, Get } from '@nestjs/common';
import { TagService } from './tag.service';


@Controller('tags')
export class TagController {
  // ukazivaem kak zavisimost dla nasheqo kontrollera
  constructor(private readonly tagService: TagService) {}

  @Get()
  async findAll(): Promise<{ tags: string[] }> {
      // todo: menayem to kak backend budet vozvrashat dannie na frontend
    const tags = await this.tagService.findAll();
    return {
      tags: tags.map((tag) => tag.name),
      // {
      //     "tags": [
      //         "trawel",
      //         "game",
      //         "sport",
      //         "news"
      //     ]
      // }
    };
  }
}
