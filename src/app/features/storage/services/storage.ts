import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { StorageBucket, UploadResponse, SignedUrlResponse, DeleteFileDto } from '../../../core/models/storage.model';

export interface UploadProgress {
  progress: number;
  complete: boolean;
  response?: UploadResponse;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly baseUrl = environment.apiUrl;

  uploadFile(
    file: File,
    bucket: StorageBucket,
    folder?: string,
  ): Observable<UploadProgress> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('File upload is not supported on the server'));
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    if (folder) formData.append('folder', folder);

    return this.http
      .post<UploadResponse>(`${this.baseUrl}/storage/upload`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const total = event.total ?? 0;
            const progress = total > 0 ? Math.round((event.loaded / total) * 100) : 0;
            return { progress, complete: false };
          }
          if (event.type === HttpEventType.Response) {
            return { progress: 100, complete: true, response: event.body ?? undefined };
          }
          return { progress: 0, complete: false };
        }),
        catchError((err: HttpErrorResponse) =>
          throwError(() => new Error(err.error?.message ?? err.message ?? 'Upload failed')),
        ),
      );
  }

  getSignedUrl(
    bucket: StorageBucket,
    path: string,
    expiresIn?: number,
  ): Observable<SignedUrlResponse> {
    const body: Record<string, unknown> = { bucket, path };
    if (expiresIn != null) body['expiresIn'] = expiresIn;
    return this.http
      .post<SignedUrlResponse>(`${this.baseUrl}/storage/signed-url`, body)
      .pipe(
        catchError((err: HttpErrorResponse) =>
          throwError(() => new Error(err.error?.message ?? err.message ?? 'Failed to get signed URL')),
        ),
      );
  }

  deleteFile(dto: DeleteFileDto): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/storage/files`, { body: dto })
      .pipe(
        catchError((err: HttpErrorResponse) =>
          throwError(() => new Error(err.error?.message ?? err.message ?? 'Failed to delete file')),
        ),
      );
  }
}
