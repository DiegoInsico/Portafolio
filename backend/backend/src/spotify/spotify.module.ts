// spotify.module.ts
import { Module } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyController } from './spotify.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [SpotifyService],
  controllers: [SpotifyController],
})
export class SpotifyModule { }
