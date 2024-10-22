import { Controller, Get, Post, Body, Req, Res, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpotifyService } from './spotify.service';

@Controller('spotify')
export class SpotifyController {
  private readonly clientId: string;
  private readonly redirectUri: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly spotifyService: SpotifyService,
  ) {
    this.clientId = this.configService.get<string>('SPOTIFY_CLIENT_ID');
    this.redirectUri = this.configService.get<string>('SPOTIFY_REDIRECT_URI');
  }

  @Get('login')
  login(@Res() res) {
    const scopes = [
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'streaming',
    ].join(' ');

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${this.clientId}&scope=${encodeURIComponent(
      scopes,
    )}&redirect_uri=${encodeURIComponent(this.redirectUri)}`;

    return res.redirect(authUrl);
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Res() res) {
    try {
      const tokens = await this.spotifyService.exchangeCodeForTokens(code);
      res.cookie('spotify_access_token', tokens.access_token, { httpOnly: true });
      res.cookie('spotify_refresh_token', tokens.refresh_token, { httpOnly: true });
      return res.redirect('/');
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      return res.status(500).send('Authentication failed');
    }
  }

  @Get('devices')
  async getDevices(@Req() req, @Res() res) {
    const accessToken = req.cookies['spotify_access_token'];
    if (!accessToken) {
      return res.redirect('/spotify/login');
    }
    try {
      const devices = await this.spotifyService.getAvailableDevices(accessToken);
      return res.json(devices);
    } catch (error) {
      console.error('Error getting devices:', error);
      return res.status(500).send('Failed to get devices');
    }
  }

  @Post('play')
  async playTrack(@Req() req, @Res() res, @Body() body) {
    const accessToken = req.cookies['spotify_access_token'];
    if (!accessToken) {
      return res.redirect('/spotify/login');
    }
    const { deviceId, trackUri } = body;
    try {
      await this.spotifyService.playTrack(accessToken, deviceId, trackUri);
      return res.send('Track is playing');
    } catch (error) {
      console.error('Error playing track:', error);
      return res.status(500).send('Failed to play track');
    }
  }
}
