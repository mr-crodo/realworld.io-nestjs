// Импортируем базовый Request из Express
import { Request } from "express";
// Импортируем нашу сущность пользователя
import { UserEntity } from "@app/user/entities/user.entity";

// Расширяем стандартный Express Request, добавляя поле user
export interface ExpressRequestInterface extends Request {
  // Поле user может содержать данные пользователя или быть undefined
  // undefined - когда пользователь не авторизован
  // UserEntity - когда пользователь успешно авторизован через JWT
  user?: UserEntity | null;
}
