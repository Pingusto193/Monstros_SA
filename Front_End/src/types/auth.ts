import type { ISODateTime } from './common';
import type { CurrentUser } from './user';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface AuthSession {
  user: CurrentUser;
  token: string;
  expiresAt: ISODateTime;
}
