// src/types/User.ts
export type User = {
  id: number; // <-- id do seu banco
  fullName: string;
  email: string;
  firebaseUid: string;
   photoURL?: string | null;
    displayName?: string;
};
