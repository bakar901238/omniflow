
export interface UserListItem {
  user: string;
}

export interface UserData {
  user: string;
  pass: string | null;
  textprompt: string;
  imageprompt: string;
  type: string;
  id?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type AppView = 'login' | 'dashboard' | 'edit' | 'add';

export interface AuthState {
  isAdmin: boolean;
  token?: string;
}
