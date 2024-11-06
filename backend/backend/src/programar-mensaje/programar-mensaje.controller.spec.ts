import { Test, TestingModule } from '@nestjs/testing';
import { ProgramarMensajeController } from './programar-mensaje.controller';
import { ProgramarMensajeService } from './programar-mensaje.service';

describe('ProgramarMensajeController', () => {
  let controller: ProgramarMensajeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramarMensajeController],
      providers: [ProgramarMensajeService],
    }).compile();

    controller = module.get<ProgramarMensajeController>(ProgramarMensajeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
