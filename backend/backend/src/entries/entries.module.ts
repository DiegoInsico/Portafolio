import { Module } from '@nestjs/common';
import { EntriesService } from './entries.service';
import { EntriesController } from './entries.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entry } from './entities/entry.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Entry])
  ],
  controllers: [EntriesController],
  providers: [EntriesService],
})
export class EntriesModule {}
