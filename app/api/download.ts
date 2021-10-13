import { Request, Response, NextFunction } from "express";

export function downloadLink(req: Request, res: Response, next: NextFunction) {
  console.log(req.body);

  res.send("download");
}
