import { Injectable } from '@nestjs/common';
import {TagEntity} from "@app/tag/entities/tag.entity";
import { Repository } from 'typeorm';
import {InjectRepository} from "@nestjs/typeorm";

@Injectable()
export class TagService {
    constructor(@InjectRepository(TagEntity) private readonly tagRepository: Repository<TagEntity>) {}
    public async findAll(): Promise<TagEntity[]> {
        return await this.tagRepository.find();
    }
}
