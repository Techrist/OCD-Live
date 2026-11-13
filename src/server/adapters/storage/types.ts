export interface StorageProvider {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  getUrl(key: string): Promise<string>;
  remove(key: string): Promise<void>;
}
