export interface VoiceProfile {
  id: string;
  userId: string;
  bio?: string | null;
  languages?: string[];
  voiceStyles?: string[];
  audioSampleUrl?: string | null;
  updatedAt?: string;
}

export interface UpdateVoiceProfileDto {
  bio?: string;
  languages?: string[];
  voiceStyles?: string[];
  audioSampleUrl?: string;
}

export interface ProducerProfile {
  id: string;
  userId: string;
  bio?: string | null;
  specialty?: string | null;
  portfolioUrl?: string | null;
  updatedAt?: string;
}

export interface UpdateProducerProfileDto {
  bio?: string;
  specialty?: string;
  portfolioUrl?: string;
}

export interface ClientProfile {
  id: string;
  userId: string;
  companyName?: string | null;
  phone?: string | null;
  address?: string | null;
  updatedAt?: string;
}

export interface UpdateClientProfileDto {
  companyName?: string;
  phone?: string;
  address?: string;
}
