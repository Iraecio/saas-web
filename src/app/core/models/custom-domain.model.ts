export interface CustomDomain {
  id: string;
  resellerId: string;
  domain: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterCustomDomainDto {
  domain: string;
}

export interface RegisterCustomDomainResponse {
  success: boolean;
  domain: string;
  message: string;
}
