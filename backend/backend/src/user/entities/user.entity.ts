import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['correo']) // Asegura que el correo electrónico sea único
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuario: string;

  @Column()
  correo: string;

  @Column()
  contrasena: string; // Almacenar la contraseña hasheada
}