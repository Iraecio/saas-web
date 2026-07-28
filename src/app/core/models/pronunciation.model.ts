export interface PronunciationAudio {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: string;
  createdAt: string;
}

export interface ClientPronunciation {
  id: string;
  pronunciationId: string;
  term: string;
  pronunciationText: string;
  audios?: PronunciationAudio[];
}

export interface PronunciationPoolItem {
  pronunciationId: string;
  term: string;
  pronunciationText: string;
}

export interface PronunciationPolicy {
  allowedMimeTypes: string[];
  maxFileSizeBytes: number;
  maxAudiosPerPronunciation: number;
  maxAudiosPerClient: number;
  currentClientAudioCount: number;
}

export interface PronunciationAudioAccess {
  signedUrl: string;
  expiresAt: string;
}

export type OrderPronunciationInput =
  | { clientPronunciationId: string; audioId?: string }
  | { term: string; pronunciationText: string };

export interface OrderPronunciationVersion {
  id: string;
  versionNumber: number;
  term: string;
  pronunciationText: string;
  audioId?: string | null;
  submittedById: string;
  submittedAt: string;
  isCurrent: boolean;
}

export interface OrderPronunciation {
  id: string;
  currentVersion: OrderPronunciationVersion;
}
