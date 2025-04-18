import { User } from '@dandelion/types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}