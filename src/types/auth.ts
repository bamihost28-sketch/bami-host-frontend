export type UserRole = 'super_admin' | 'admin' | 'business_owner' | 'super_manager' | 'manager' | 'super_vendor' | 'vendor' | 'tenant' | 'user' | 'big7' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department?: string;
  hourlyRate?: number;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin: string;
  createdAt: string;
  agreementSignedAt?: string | null;
  // Role-specific fields
  assignedEstates?: string[]; // For business_owner role
  permissions?: string[];     // For super_admin role (e.g., ["all"])
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateEmailRequest {
  email: string;
  password: string;
}

export interface UpdateEmailResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface OnboardBusinessOwnerRequest {
  name: string;
  email: string;
  phone: string;
  estateIds: string[];
  sendCredentials?: boolean;
}

export interface OnboardBusinessOwnerResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: 'business_owner';
    assignedEstates: Array<{
      _id: string;
      name: string;
    }>;
    isActive: boolean;
    createdAt: string;
  };
}

export interface BusinessOwner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'business_owner';
  assignedEstates: Array<{
    _id: string;
    name: string;
    totalUnits?: number;
  }>;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetBusinessOwnersResponse {
  success: boolean;
  count: number;
  data: BusinessOwner[];
}

export interface UpdateBusinessOwnerRequest {
  name?: string;
  email?: string;
  phone?: string;
  estateIds?: string[];
}

export interface UpdateBusinessOwnerStatusRequest {
  isActive: boolean;
}

export interface UpdateBusinessOwnerResponse {
  success: boolean;
  message: string;
  data: BusinessOwner;
}

export interface DeleteBusinessOwnerResponse {
  success: boolean;
  message: string;
}

export interface RequestOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface ResetPasswordOtpRequest {
  email: string;
  code: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
}

// Manager Types
export interface OnboardManagerRequest {
  name: string;
  email: string;
  phone?: string;
  position?: string;
  sendCredentials?: boolean;
}

export interface OnboardManagerResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'manager';
    assignedEstates: Array<{
      _id: string;
      name: string;
      totalUnits?: number;
    }>;
    isActive: boolean;
    createdAt: string;
  };
}

export interface Manager {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'manager';
  assignedEstates: Array<{
    _id: string;
    name: string;
    totalUnits?: number;
  }>;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetManagersResponse {
  success: boolean;
  count: number;
  data: Manager[];
}

export interface UpdateManagerRequest {
  name?: string;
  email?: string;
  phone?: string;
  estateIds?: string[];
}

export interface UpdateManagerResponse {
  success: boolean;
  message: string;
  data: Manager;
}

export interface DeleteManagerResponse {
  success: boolean;
  message: string;
}

export interface SignAgreementRequest {
  typedName: string;
  signatureImage?: string | null;
}

export interface SignAgreementResponse {
  success: boolean;
  user: User;
}