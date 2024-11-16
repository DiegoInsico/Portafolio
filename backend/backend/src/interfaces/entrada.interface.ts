// src/interfaces/entrada.interface.ts

export interface Entrada {
    id: string;
    userId: string;
    content: string;
    isPublic: boolean;
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt?: FirebaseFirestore.Timestamp;
    // Otros campos según tu modelo de datos
  }
  