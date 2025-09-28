// Импортируем необходимые модули для создания middleware
import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response } from "express";
import { ExpressRequestInterface } from "@app/types/expressRequest.interface";
import { verify } from "jsonwebtoken";
import { JWT_SECRET } from "@app/config";
import { UserService } from "@app/user/user.service";

// Декоратор @Injectable делает класс доступным для Dependency Injection
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  // Основной метод middleware - выполняется для каждого HTTP запроса
  async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    // Проверяем, есть ли заголовок Authorization в запросе
    if (!req.headers.authorization) {
      // ❌ Было: req.user = null;  - TypeScript ошибка!
      // ✅ Исправлено: используем undefined вместо null
      // ✅ Как в уроке: используем null
      req.user = null;

      // Передаем управление следующему middleware или контроллеру
      next();
      return;
    }

    // Извлекаем токен из заголовка Authorization
    // Ожидаем формат: "Bearer <token>" или "Token <token>"
    const token = req.headers.authorization.split(" ")[1];

    // Выводим токен в консоль для отладки
    console.log("token", token);

    try {
      const decode = verify(token, JWT_SECRET);
      // console.log("decode", decode);
        const user = await this.userService.findById(decode.id);
        req.user = user;

      // Пока что просто передаем управление дальше
      // TODO: Здесь должна быть проверка и декодирование JWT токена
      next();
    } catch (err) {
      req.user = null;
      next();
    }
  }
}
