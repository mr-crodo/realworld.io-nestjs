// src/ormdatasource.ts
import { DataSource } from "typeorm";
import ormconfig from "@app/orm.config";

export default new DataSource(ormconfig);
