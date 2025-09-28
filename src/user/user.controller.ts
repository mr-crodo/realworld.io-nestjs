// src/user/user.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { UserService } from "@app/user/user.service";
import { CreateUserDto } from "@app/user/dto/create.user.dto";
import { UserResponseInterface } from "@app/user/types/userResponse.interface";
import { LoginUserDto } from "@app/user/dto/login.user.dto";
import { User } from "./decorators/user.decorators";
// ✅ Используем type-only импорт для типов в декораторах
import type { ExpressRequestInterface } from "@app/types/expressRequest.interface";
import { UserEntity } from "@app/user/entities/user.entity";
import { AuthGuard } from "@app/user/guards/auth.guards";
import { UpdateUserDto } from "@app/user/dto/update.user.dto";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  @UsePipes(new ValidationPipe())
  async createUser(
    @Body("user") createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Post("login")
  @UsePipes(new ValidationPipe())
  async login(
    @Body("user") loginUserDto: LoginUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Get("user")
  @UseGuards(AuthGuard)
  async currentUser(
    // sdes ispolzuyem customniy dekorator
    @User() user: UserEntity,
    @User("id") currentUserId: number,
  ): Promise<UserResponseInterface> {
    console.log("User from controller decoratos:", user);
    // Теперь можем получить доступ к полю user из middleware
    // console.log("User from middleware:", request.user);

    // ✅ Проверяем, что пользователь авторизован
    // if (!request.user) {
    //   throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
    // }
    console.log("User ID", currentUserId);
    // Теперь TypeScript знает, что request.user точно не null/undefined
    return this.userService.buildUserResponse(user);
  }

  @Put("user")
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @User("id") currentUserId: number,
    @Body("user") updateUserDto: UpdateUserDto,
  ): Promise<UserResponseInterface> {
      const user = await this.userService.updateUser(currentUserId, updateUserDto);
      return this.userService.buildUserResponse(user)
  }
}
