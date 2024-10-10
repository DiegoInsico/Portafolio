import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { Entry } from './entities/entry.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EntriesService {

  constructor(
    @InjectRepository(Entry)
  private entriesRepository: Repository<Entry>,
){}

  async create(createEntryDto: CreateEntryDto, media_url?: string): Promise<Entry> {
    const entry = this.entriesRepository.create({ ...createEntryDto, media_url });
    try {
      return await this.entriesRepository.save(entry);
    } catch (error) {
      console.log('Error creando la entrada:', error);
      throw new InternalServerErrorException('No se pudo crear la entrada')
    }
  }

  findAll() {
    return `This action returns all entries`;
  }

  findOne(id: number) {
    return `This action returns a #${id} entry`;
  }

  update(id: number, updateEntryDto: UpdateEntryDto) {
    return `This action updates a #${id} entry`;
  }

  remove(id: number) {
    return `This action removes a #${id} entry`;
  }
}
