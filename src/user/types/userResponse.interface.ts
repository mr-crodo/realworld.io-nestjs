// src/user/types/user-response.interface.ts
// import {UserType} from "@app/user/types/user.type";
// export interface UserResponseInterface {
//   user: UserType & { token: string };
// }

import { UserWithoutPassword } from "@app/user/types/user-without-password.interface";

export interface UserResponseInterface {
  user: UserWithoutPassword & { token: string };
}
