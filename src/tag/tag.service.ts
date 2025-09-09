// Импортируем нужные декораторы и типы из NestJS и TypeORM
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TagEntity } from "./entities/tag.entity"; // твоя сущность (таблица в БД)

// Декоратор @Injectable() говорит NestJS: этот класс можно внедрять в другие классы
@Injectable()
export class TagService {
  // 🔹 Конструктор вызывается автоматически, когда Nest создаёт этот сервис.
  // 🔹 Здесь мы "внедряем" (inject) зависимости — в данном случае, репозиторий для TagEntity.
  constructor(
    // 🔸 @InjectRepository(TagEntity) — говорит NestJS: "дай мне Repository для TagEntity"
    // 🔸 private readonly — создаёт свойство класса, доступное только для чтения
    // 🔸 tagRepository — имя свойства, через которое мы будем обращаться к репозиторию
    // 🔸 Repository<TagEntity> — тип: репозиторий, который работает с TagEntity
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  // 🔹 Асинхронный метод, возвращает Promise с массивом TagEntity
  // 🔹 async — говорит, что внутри будет await (ожидание асинхронной операции)
  // 🔹 Promise<TagEntity[]> — тип возвращаемого значения: "обещание вернуть массив тегов"
  async findAll(): Promise<TagEntity[]> {
    // 🔸 await — ждём, пока репозиторий получит данные из БД
    // 🔸 this.tagRepository.find() — метод TypeORM, который делает SELECT * FROM tags
    return await this.tagRepository.find();
  }
}
