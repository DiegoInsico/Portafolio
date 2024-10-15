import { Controller, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('api')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('question')
  async generateQuestion(@Query('userId') userId: string): Promise<{ question: string }> {
    console.log('Received userId:', userId); // Verifica si se recibe el userId correctamente
    const question = await this.aiService.generateQuestion(userId);
    return { question };
  }
  
}
