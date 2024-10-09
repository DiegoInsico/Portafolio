import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Metodo para crear usuario

 async create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  // Método para crear un nuevo usuario
  async createUser(usuario: string, correo: string, contrasena: string): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const user = this.userRepository.create({
      usuario,
      correo,
      contrasena: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async findOneById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  findOneByEmail(correo: string): Promise<User> {
    return this.userRepository.findOne({ where: { correo } });
  }

  async updatePassword(userId: number, nuevaContrasena: string): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    const salt = await bcrypt.genSalt();
    user.contrasena = await bcrypt.hash(nuevaContrasena, salt);
    await this.update(user);
  }

  async generateJwtToken(user: User, expiresIn: string = '1h'): Promise<string> {
    const payload = { sub: user.id, correo: user.correo };
    return this.jwtService.sign(payload, { expiresIn });
  }
}
