import { Role } from "src/users/entities";

export type JwtPayload = {
    email: string;
    sub: number;
    roles: Role[]
  };