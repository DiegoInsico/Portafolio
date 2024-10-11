import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('entries')
export class Entry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  media_url?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date?: string; // Añadir si lo estás manejando en la base de datos

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
