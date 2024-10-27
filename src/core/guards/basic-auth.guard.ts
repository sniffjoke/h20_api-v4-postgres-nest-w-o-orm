import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { SETTINGS } from "../settings/settings";


export class BasicAuthGuard implements CanActivate {
  constructor() {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const basic = authHeader.split(" ")[0];
      const token = authHeader.split(" ")[1];

      if (basic !== "Basic" || !token) {
        throw new UnauthorizedException({ message: "User not logged in" });
      }

      // const user = this.jwtService.verify(token);
      const decodeAuth = Buffer.from(token, "base64").toString("base64");
      const verifyAuth = Buffer.from(SETTINGS.VARIABLES.ADMIN, "utf-8").toString("base64");
      if (verifyAuth !== decodeAuth) {
        throw new UnauthorizedException({ message: "User not logged in" });
      }
      // req.user = decodeAuth;
      return true;
    } catch (e: any) {
      throw new UnauthorizedException({ message: "User not logged in." });
    }
  }
}
