import { Injectable } from '@nestjs/common';

@Injectable()
export class TagService {
    public findAll(): string[] {
        return ['dragons', 'coffee',  'nest', 'realworld.io-nestjs', 'ay brat']
    }
}
