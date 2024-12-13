// src/interfaces/extended-service-account.interface.ts
import { ServiceAccount } from 'firebase-admin';

export interface ExtendedServiceAccount extends ServiceAccount {
  type: string;
  project_id: string;
  private_key: string;
  private_key_id: string;
  client_id: string;
  client_email: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}
