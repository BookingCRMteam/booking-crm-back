import { User as UserModel } from '@app/modules/user/user.schema';

declare global {
  namespace Express {
    export interface User extends UserModel {
      _dummy?: never;
    }
  }
}
