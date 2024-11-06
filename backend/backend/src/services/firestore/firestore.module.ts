// src/services/firestore.module.ts
import { Module } from '@nestjs/common';
import { FirestoreService } from './firestore.service';
import { FirebaseModule } from '../firebase/firebase.module'; // Importa FirebaseModule

@Module({
  imports: [FirebaseModule], // Importa FirebaseModule para acceder a FIREBASE_ADMIN
  providers: [FirestoreService],
  exports: [FirestoreService],
})
export class FirestoreModule {}
