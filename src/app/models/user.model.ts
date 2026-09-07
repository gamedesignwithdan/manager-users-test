export type UserStatus = 'active' | 'disabled';

export interface User {
  id: string;
  username: string;
  role: string;
  status: UserStatus;
  createdAt: Date | null;
  updatedAt?: Date | null;
}
