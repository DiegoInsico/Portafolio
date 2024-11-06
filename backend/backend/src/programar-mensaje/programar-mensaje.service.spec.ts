import { Test, TestingModule } from '@nestjs/testing';
import { ProgramarMensajeService } from './programar-mensaje.service';

describe('ProgramarMensajeService', () => {
  let service: ProgramarMensajeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgramarMensajeService],
    }).compile();

    service = module.get<ProgramarMensajeService>(ProgramarMensajeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
