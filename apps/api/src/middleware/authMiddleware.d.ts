import { Request, Response, NextFunction } from "express";
export type AuthedRequest = Request & {
    userId?: string;
};
export declare function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
//# sourceMappingURL=authMiddleware.d.ts.map