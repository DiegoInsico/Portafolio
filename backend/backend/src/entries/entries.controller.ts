import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { EntriesService } from './entries.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'; // Importar directamente desde 'multer'
import { extname } from 'path';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('media', {
    storage: diskStorage({
      destination: './uploads', // Carpeta donde se almacenarán los archivos
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // Limitar el tamaño del archivo a 10MB
    fileFilter: (req, file, callback) => {
      if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
        callback(null, true);
      } else {
        callback(new Error('Solo se permiten archivos de audio o video'), false);
      }
    },
  }))
  async create(
    @Body() createEntryDto: CreateEntryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let media_url: string = null;
    if (file) {
      media_url = `/uploads/${file.filename}`;
    }
    return this.entriesService.create(createEntryDto, media_url);
  }

  @Get()
  findAll() {
    return this.entriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEntryDto: UpdateEntryDto) {
    return this.entriesService.update(+id, updateEntryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entriesService.remove(+id);
  }
}
