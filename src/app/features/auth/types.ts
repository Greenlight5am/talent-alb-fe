export type UserRole = "CANDIDATE" | "EMPLOYER" | "ADMIN" | string;

export type AccountDto = {
  id: string;
  email: string;
  roles?: UserRole[];
  [k: string]: unknown;
};
