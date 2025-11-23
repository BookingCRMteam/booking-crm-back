import { User as UserModel } from '@app/modules/user/user.schema';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface User extends UserModel {}
  }
}
