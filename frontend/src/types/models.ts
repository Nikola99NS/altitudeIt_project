// User model for storing user data
export interface User {
  email: string;
  ime: string;
  prezime: string;
  dateBirth: string;
  urlSlike: string;
  roleId: number;
  twoFA: number;
}

// Model for profile image
export interface ProfileImage {
  profileImage: string | null;
}

// Model for handling form state (like isEditing)
export interface EditState {
  ime: boolean;
  prezime: boolean;
  dateBirth: boolean;
}

// Model for handling password change
export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  isPasswordValid: boolean;
  isChangingPassword: boolean;
}
