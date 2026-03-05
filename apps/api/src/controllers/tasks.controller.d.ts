import type { AuthedRequest } from "../middleware/authMiddleware";
import type { Response } from "express";
export declare function getTasks(req: AuthedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare const createTask: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const updateTask: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare function deleteTask(req: AuthedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=tasks.controller.d.ts.map