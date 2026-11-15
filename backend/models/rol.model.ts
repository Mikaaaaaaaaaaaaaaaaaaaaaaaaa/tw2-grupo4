export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];