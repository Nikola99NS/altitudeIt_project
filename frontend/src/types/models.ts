export interface User {
  email: string;
  ime: string;
  prezime: string;
  dateBirth: string;
  urlSlike: string;
  roleId: number;
  twoFA: number;
}

export interface ProfileImage {
  profileImage: string | null;
}

export interface EditState {
  ime: boolean;
  prezime: boolean;
  dateBirth: boolean;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  isPasswordValid: boolean;
  isChangingPassword: boolean;
}
