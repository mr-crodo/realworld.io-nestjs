import { UserEntity } from "@app/user/entities/user.entity";

export type UserWithoutPassword = Omit<UserEntity, "password" | "hashPassword">;
