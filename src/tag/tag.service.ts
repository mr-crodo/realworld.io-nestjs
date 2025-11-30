import { Injectable } from '@nestjs/common';

@Injectable()
export class TagService {
  findAll(): string[] {
    return ['dragons', 'coffee', 'cats', 'dogs', 'birds', 'cats', 'dogs', 'birds'];
  }
}
