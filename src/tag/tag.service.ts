import { Injectable } from '@nestjs/common';

@Injectable()
export class TagService {
    public findAll(): string[] {
        return ['dragons', 'coffee',  'nest', 'realworld.io-nestjs', 'ay brat', 'ne var a qadan alim', 'ay mazaxir mazaxir', 'this is testing qadan alim']
    }
}
