export interface StorageProvider {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  /** Adresse publique de l'objet (toujours la route locale /api/files : le bucket reste privé). */
  getUrl(key: string): Promise<string>;
  /** Lit l'objet ; null s'il n'existe pas. */
  get(key: string): Promise<{ body: Uint8Array; contentType: string } | null>;
  remove(key: string): Promise<void>;
}
