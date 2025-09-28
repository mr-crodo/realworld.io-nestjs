// src/user/user.service.ts
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from "@app/user/dto/create.user.dto";
import { UserEntity } from "@app/user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { sign } from "jsonwebtoken";
import { JWT_SECRET } from "@app/config";
import { UserResponseInterface } from "@app/user/types/userResponse.interface";
import { LoginUserDto } from "@app/user/dto/login.user.dto";
import { compare } from "bcrypt";
import { UserWithoutPassword } from "@app/user/types/user-without-password.interface";
import { UpdateUserDto } from "@app/user/dto/update.user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    const userByUserName = await this.userRepository.findOne({
      where: {
        username: createUserDto.username,
      },
    });

    if (userByEmail || userByUserName) {
      throw new HttpException(
        "Email or username is taken",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    // console.log(newUser, "new User di");
    return await this.userRepository.save(newUser);
  }

  findById(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  generateJwt(user: UserEntity | UserWithoutPassword): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      // process.env.JWT_SECRET,
      JWT_SECRET,
    );
  }

  async login(loginUserDto: LoginUserDto): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
      select: ["id", "username", "email", "bio", "image", "password"],
    });

    // console.log(user, "user di");
    // console.log("Password from DB:", user?.password); // И это

    if (!user) {
      throw new HttpException(
        "Credentials are not valid",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordCorrect = await compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new HttpException(
        "Credentials are not valid",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.findById(userId);
    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  buildUserResponse(
    user: UserEntity | UserWithoutPassword,
  ): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }
}
