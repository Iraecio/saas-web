export type StorageBucket = 'images' | 'audios' | 'documents';

export interface UploadResponse {
  path: string;
  fullPath: string;
  bucket: StorageBucket;
  size: number;
  mimetype: string;
  originalName: string;
  publicUrl?: string;
}

export interface SignedUrlResponse {
  signedUrl: string;
  expiresAt: string;
}

export interface DeleteFileDto {
  bucket: StorageBucket;
  path: string;
}
