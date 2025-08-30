import { JwtUser } from "./auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
      file?: Express.Multer.File;
    }
  }
}
