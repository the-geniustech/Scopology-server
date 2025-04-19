import { IUserDocument } from "../../src/interfaces/user.interface";

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}
